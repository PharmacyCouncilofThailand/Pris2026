import type { ProductDto } from "../types/merchandise";

export interface CatalogFilter {
  q?: string;
  categoryId?: string;
  kind?: "single" | "bundle";
  page?: number;
}

export function filterCatalog(
  products: ProductDto[],
  f: CatalogFilter,
  pageSize = 12,
): { items: ProductDto[]; page: number; totalPages: number; total: number } {
  const q = f.q?.trim().toLowerCase() ?? "";
  const matched = products.filter(
    (p) =>
      (!q || p.nameTh.toLowerCase().includes(q)) &&
      (!f.categoryId || p.categoryId === f.categoryId) &&
      (!f.kind || p.kind === f.kind),
  );
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const requested = Number.isFinite(f.page) ? Math.trunc(f.page as number) : 1;
  const page = Math.min(Math.max(requested, 1), totalPages);
  return {
    items: matched.slice((page - 1) * pageSize, page * pageSize),
    page,
    totalPages,
    total,
  };
}
