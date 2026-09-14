import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";
const root = new URL("../docs/", import.meta.url);
const source = JSON.parse(
  await fs.readFile(new URL("plan-source.json", root), "utf8"),
);
const columns = [
  ["id", "Görev ID", 13],
  ["owner", "Sorumlu", 14],
  ["module", "Modül", 23],
  ["description", "Açıklama", 55],
  ["day", "Gün", 9],
  ["hours", "Tahmini saat", 13],
  ["priority", "Öncelik", 12],
  ["dependencies", "Bağımlılık", 24],
  ["output", "Teslim çıktısı", 50],
  ["acceptance", "Kabul ölçütü", 80],
  ["status", "Durum", 19],
];
const value = (task, key) =>
  Array.isArray(task[key]) ? task[key].join(", ") : task[key];
const book = new ExcelJS.Workbook();
book.creator = "TEIN";
book.title = source.title;
function sheet(name, headers, widths) {
  const page = book.addWorksheet(name, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  page.columns = headers.map((header, i) => ({ header, width: widths[i] }));
  page.getRow(1).height = 32;
  page.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF176351" },
    };
    cell.alignment = { vertical: "middle", wrapText: true };
  });
  return page;
}
function finish(page) {
  page.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: page.rowCount, column: page.columnCount },
  };
  page.eachRow((row, index) => {
    if (index === 1) return;
    row.alignment = { vertical: "top", wrapText: true };
    row.height = 72;
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 11 };
      if (index % 2 === 0)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF0F5F0" },
        };
    });
  });
  page.pageSetup = {
    orientation: "landscape",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
}
const owners = ["Esat", "Zeynep", "Umut", "Ecren", "Hazal"];
const summary = sheet(
  "Özet",
  ["Kişi / alan", "Sorumluluk / açıklama", "Görev sayısı", "Uygulama saati"],
  [25, 100, 16, 18],
);
for (const owner of owners) {
  const tasks = source.tasks.filter((t) => t.owner === owner);
  summary.addRow([
    owner,
    tasks[0].module,
    tasks.length,
    tasks.reduce((sum, t) => sum + t.hours, 0),
  ]);
}
for (const text of source.ready)
  summary.addRow(["Hazır omurga", text, "Tamamlandı"]);
for (const text of source.assumptions) summary.addRow(["Plan varsayımı", text]);
summary.addRow([
  "Güncelleme",
  "Durumları plan-source.json içinde güncelleyin. docs:generate Excel/MD/TXT dosyalarını yeniden üretir; Excel elle değişikliklerini korumaz.",
]);
finish(summary);
const tasks = sheet(
  "Görevler",
  columns.map((c) => c[1]),
  columns.map((c) => c[2]),
);
for (const task of source.tasks) {
  const row = tasks.addRow(columns.map(([key]) => value(task, key)));
  row.getCell(11).dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: ['"Başlamadı,Devam ediyor,İncelemede,Tamamlandı,Engellendi"'],
    showErrorMessage: true,
    errorTitle: "Geçersiz durum",
    error: "Listeden bir durum seçin.",
  };
}
finish(tasks);
const calendar = sheet(
  "10 Günlük Takvim",
  ["Gün", ...owners],
  [10, 48, 48, 48, 48, 48],
);
for (let day = 1; day <= 10; day++)
  calendar.addRow([
    day,
    ...owners.map((owner) => {
      const task = source.tasks.find((t) => t.day === day && t.owner === owner);
      return task.id + " — " + task.description + " (" + task.hours + " saat)";
    }),
  ]);
finish(calendar);
calendar.eachRow((row, i) => {
  if (i > 1) row.height = 105;
});
const checks = sheet(
  "Kabul Kontrolleri",
  ["Görev ID", "Sorumlu", "Kabul ölçütü", "Sonuç"],
  [14, 15, 110, 23],
);
for (const task of source.tasks) {
  const row = checks.addRow([
    task.id,
    task.owner,
    task.acceptance,
    "Kontrol edilmedi",
  ]);
  row.getCell(4).dataValidation = {
    type: "list",
    allowBlank: false,
    formulae: ['"Kontrol edilmedi,Başarılı,Başarısız,Çalıştırılamadı"'],
  };
}
finish(checks);
await book.xlsx.writeFile(
  fileURLToPath(new URL("STAJYER_IS_PLANI.xlsx", root)),
);
const md = [
  "# " + source.title,
  "",
  ...source.assumptions.map((a) => "- " + a),
  "",
  "## Hazır verilen omurga",
  "",
  ...source.ready.map((a) => "- " + a),
  "",
];
const txt = [
  source.title,
  "=".repeat(60),
  "",
  ...source.assumptions,
  "",
  "HAZIR VERİLEN OMURGA",
  ...source.ready,
  "",
];
for (const owner of owners) {
  md.push("## " + owner, "");
  txt.push(owner.toLocaleUpperCase("tr-TR"), "-".repeat(40));
  for (const task of source.tasks.filter((t) => t.owner === owner)) {
    md.push(
      "### " + task.id + " — Gün " + task.day + ": " + task.description,
      "",
    );
    for (const [key, label] of columns.filter(
      (c) => !["id", "description"].includes(c[0]),
    ))
      md.push("- **" + label + ":** " + (value(task, key) || "Yok"));
    md.push("");
    txt.push(
      ...columns.map(
        ([key, label]) => label + ": " + (value(task, key) || "Yok"),
      ),
      "",
    );
  }
}
const note =
  "Kaynak: plan-source.json. Durumları kaynakta güncelleyin; npm run docs:generate ve npm run docs:check çalıştırın. Excel elle değişiklikleri yeniden üretimde korunmaz.";
md.push("## Planı güncelleme", "", note, "");
txt.push(note);
await fs.writeFile(new URL("STAJYER_IS_PLANI.md", root), md.join("\n"));
await fs.writeFile(
  new URL("STAJYER_IS_PLANI.txt", root),
  txt.join("\n") + "\n",
);
console.log(source.tasks.length + " görev; Excel, Markdown ve TXT üretildi.");
