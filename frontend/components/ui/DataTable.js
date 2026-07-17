import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

export default function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  pageSizeOptions = [10, 25, 50],
  empty,
}) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeOptions[0]);
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col?.sortValue ? col.sortValue(a) : a[sort.key];
      const bv = col?.sortValue ? col.sortValue(b) : b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv), "fr")
        : String(bv).localeCompare(String(av), "fr");
    });
    return copy;
  }, [rows, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageSafe = Math.min(page, totalPages - 1);
  const slice = sorted.slice(pageSafe * pageSize, pageSafe * pageSize + pageSize);

  const toggleSort = (key) => {
    setSort((prev) => {
      if (prev.key !== key) return { key, dir: "asc" };
      return { key, dir: prev.dir === "asc" ? "desc" : "asc" };
    });
    setPage(0);
  };

  if (!rows.length) {
    return empty || <p className="py-8 text-center text-sm text-ink-muted">Aucune donnée</p>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="bg-navy-700 text-white">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide">
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:text-accent"
                    >
                      {col.label}
                      {sort.key !== col.key ? (
                        <ArrowUpDown size={12} />
                      ) : sort.dir === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row) : i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-line ${i % 2 ? "bg-canvas" : "bg-white"} ${
                  onRowClick ? "cursor-pointer hover:bg-navy-50" : ""
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-3 py-2.5 align-middle ${col.className || ""}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted">
        <div className="flex items-center gap-2">
          <span>Lignes / page</span>
          <select
            className="field-input !w-auto !py-1"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>
            {sorted.length} résultat{sorted.length > 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded border border-line px-2 py-1 disabled:opacity-40"
            disabled={pageSafe <= 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Préc.
          </button>
          <span>
            {pageSafe + 1} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded border border-line px-2 py-1 disabled:opacity-40"
            disabled={pageSafe >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Suiv.
          </button>
        </div>
      </div>
    </div>
  );
}
