export type Role = "USER" | "MANUFACTURER" | "ADMIN";
export type User = {
    publicId: string;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean;
    role: Role;
};
export type Session = {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
};
export type ApiResponse<T> = { success: boolean; data: T };
export type PageResponse<T> = {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};
export type Category = {
    publicId: string;
    code: string;
    name: string;
    description: string | null;
    active: boolean;
};
export type CategoryInput = { code: string; name: string; description: string };
export type CategoryUpdate = Omit<CategoryInput, "code"> & { active: boolean };
export type Passport = {
    publicId: string;
    serialNumber: string;
    productModelId: string;
    productModelName: string;
    categoryId: string;
    categoryName: string;
    purchaseDate: string;
    invoiceNumber: string | null;
    description: string | null;
    active: boolean;
};
export type PassportInput = {
    serialNumber: string;
    productModelId: string;
    categoryId: string;
    purchaseDate: string;
    invoiceNumber: string;
    description: string
};
export type PassportUpdate = PassportInput;
