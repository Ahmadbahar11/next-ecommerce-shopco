export const PRODUCT_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
] as const;

export const BRAND_OPTIONS = [
    "adidas",
    "Nike",
    "PUMA",
    "New Balance",
    "Under Armour",
    "ASICS",
    "Skechers",
    "Jordan",
    "Converse",
    "Reebok",
    "FILA",
    "Hummel",
    "Veja",
] as const;

export const UK_SIZE_OPTIONS = [
    "3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10", "10.5", "11", "11.5", "12", "12.5", "13",
] as const;

function parseUkSize(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/(\d+(?:\.\d+)?)/);
    if (!match) return null;

    const uk = Number(match[1]);
    if (!Number.isFinite(uk) || uk < 3 || uk > 13) return null;

    return uk;
}

export function getUkSizeValue(value: string) {
    const parsed = parseUkSize(value);
    return parsed === null ? "" : String(parsed);
}

export function formatUkSizeInput(value: string) {
    const parsed = parseUkSize(value);
    if (parsed === null) return "";

    return `UK ${parsed}`;
}

export function getUkSizeMetadata(value: string) {
    const uk = parseUkSize(value);
    if (uk === null) {
        return { uk: "", us: "", eu: "" };
    }

    const us = uk + 1;
    const eu = uk + 33;

    return {
        uk: `UK ${uk}`,
        us: `US ${Number(us.toFixed(1)).toString()}`,
        eu: `EU ${Number(eu.toFixed(1)).toString()}`,
    };
}
