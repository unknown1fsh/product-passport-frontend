import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
const root = new URL("../docs/", import.meta.url);
const source = JSON.parse(
  await fs.readFile(new URL("plan-source.json", root), "utf8"),
);
const book = new ExcelJS.Workbook();
await book.xlsx.readFile(fileURLToPath(new URL("STAJYER_IS_PLANI.xlsx", root)));
assert.deepEqual(
  book.worksheets.map((s) => s.name),
  ["Özet", "Görevler", "10 Günlük Takvim", "Kabul Kontrolleri"],
);
assert.equal(source.tasks.length, 50);
assert.equal(new Set(source.tasks.map((t) => t.id)).size, 50);
const md = await fs.readFile(new URL("STAJYER_IS_PLANI.md", root), "utf8");
const txt = await fs.readFile(new URL("STAJYER_IS_PLANI.txt", root), "utf8");
const sheet = book.getWorksheet("Görevler");
const keys = [
  "id",
  "owner",
  "module",
  "description",
  "day",
  "hours",
  "priority",
  "dependencies",
  "output",
  "acceptance",
  "status",
];
for (const [i, task] of source.tasks.entries()) {
  keys.forEach((key, j) =>
    assert.equal(
      sheet.getRow(i + 2).getCell(j + 1).value,
      Array.isArray(task[key]) ? task[key].join(", ") : task[key],
    ),
  );
  assert.ok(md.includes(task.id) && md.includes(task.acceptance));
  assert.ok(txt.includes(task.id) && txt.includes(task.acceptance));
  assert.ok(sheet.getRow(i + 2).getCell(11).dataValidation);
  for (const dependency of task.dependencies) {
    const upstream = source.tasks.find((t) => t.id === dependency);
    assert.ok(upstream, "Eksik bağımlılık: " + dependency);
    assert.ok(
      upstream.day <= task.day,
      "Gelecekteki bağımlılık: " + dependency,
    );
  }
}
function visit(id, stack = []) {
  assert.ok(!stack.includes(id), "Döngü: " + id);
  for (const dependency of source.tasks.find((t) => t.id === id).dependencies)
    visit(dependency, [...stack, id]);
}
for (const task of source.tasks) visit(task.id);
for (const owner of ["Esat", "Zeynep", "Umut", "Ecren", "Hazal"]) {
  const tasks = source.tasks.filter((t) => t.owner === owner);
  assert.equal(tasks.length, 10);
  assert.deepEqual(
    tasks.map((t) => t.day),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  );
  assert.ok(tasks.every((t) => t.hours >= 4 && t.hours <= 5));
}
for (const page of book.worksheets) {
  assert.ok(page.autoFilter);
  assert.equal(page.views[0].ySplit, 1);
}
console.log("50 görev, 5 kişi, 10 gün, bağımlılıklar ve üç çıktı doğrulandı.");
