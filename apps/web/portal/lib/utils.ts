import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converts a name string to title case (first letter uppercase, rest lowercase per word).
 * Example: "john doe" → "John Doe", "MARY JANE" → "Mary Jane"
 */
export function toTitleCase(name: string): string {
  if (!name || !name.trim()) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Escapes a CSV cell value per RFC 4180.
 * Values containing commas, double-quotes, or newlines are wrapped in quotes.
 * Double-quotes within a value are escaped as "".
 */
function escapeCsvCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generates a CSV file and triggers a browser download.
 * @param filename - The name for the downloaded file (e.g., "export.csv")
 * @param headers - Column header labels
 * @param rows - 2D array of string cell values
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: string[][]
): void {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(","));
  const csvContent = [headerLine, ...dataLines].join("\n");

  // BOM for Excel UTF-8 compatibility
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
