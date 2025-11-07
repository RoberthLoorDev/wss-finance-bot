export const formatAmount = (a: any): string => {
     const n = parseFloat(String(a || 0));
     if (isNaN(n)) return String(a);
     return n.toFixed(2);
};

export const formatDateShort = (d: any): string => {
     const dateObj = d instanceof Date ? d : new Date(String(d));
     if (isNaN(dateObj.getTime())) return "--";
     const day = String(dateObj.getDate()).padStart(2, "0");
     const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
     const mon = months[dateObj.getMonth()] || "mm";
     return `${day}-${mon}`;
};

export const sumAmounts = (items: any[]): number => {
     return items.reduce(
          (s: number, tx: any) => s + (isNaN(parseFloat(String(tx.amount))) ? 0 : parseFloat(String(tx.amount))),
          0
     );
};

export const summarizeByCategory = (items: any[]): Map<string, number> => {
     const catMap = new Map<string, number>();
     for (const tx of items) {
          const cname = tx.category?.name || "Sin categoría";
          const a = isNaN(parseFloat(String(tx.amount))) ? 0 : parseFloat(String(tx.amount));
          catMap.set(cname, (catMap.get(cname) || 0) + a);
     }
     return catMap;
};

export const escapeHtml = (unsafe: any): string => {
     if (unsafe === null || unsafe === undefined) return "";
     const s = String(unsafe);
     return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};

export default {
     formatAmount,
     formatDateShort,
     sumAmounts,
     summarizeByCategory,
};
