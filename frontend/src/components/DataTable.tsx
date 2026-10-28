
import { Table2 } from "lucide-react";
import type { ReactNode } from "react";

type Column<T> = {
  key: keyof T;
  label: string;
  render?: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  title: string;
  rows: T[];
  columns: Array<Column<T>>;
  emptyLabel?: string;
  compact?: boolean;
  variant?: "default" | "anomaly";
};

export function DataTable<T extends object>({
  title,
  rows,
  columns,
  emptyLabel = "Aucune donnée",
  compact = false,
  variant = "default",
}: DataTableProps<T>) {
   const isAnomaly = variant === "anomaly";
  return (
    <section
      className={`
        min-w-0 overflow-hidden rounded-2xl
        border border-hairline bg-surface
        shadow-card
        ${compact ? "flex min-h-[19rem] flex-col" : ""}
      `}
    >
      {/* En-tête premium */}
      
<header
  className={`flex shrink-0 items-center gap-3 px-5 py-4 ${
    isAnomaly
      ? "border-b border-alert/15 bg-gradient-to-r from-alert/10 via-surface to-surface"
      : "bg-[#065F46]"
  }`}
>
  <span
    aria-hidden="true"
    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
      isAnomaly
        ? "bg-alert-weak text-alert"
        : "border border-white/20 bg-white/15 text-white"
    }`}
  >
    <Table2 className="h-5 w-5" />
  </span>

  <h2
    className={`text-[14px] font-bold ${
      isAnomaly ? "text-ink" : "text-white"
    }`}
  >
    {title}
  </h2>
</header>


      {/* Tableau */}
      <div
        className={`
          soft-scrollbar min-w-0
          ${compact
            ? "min-h-0 flex-1 overflow-auto"
            : "overflow-x-auto"}
        `}
      >
        <table className="w-full min-w-[680px] border-collapse text-left text-[13px]">

          {/* Titres des colonnes */}
          <thead
            
className={`border-b text-[10px] uppercase tracking-[0.08em] ${
  isAnomaly
    ? "border-alert/15 bg-alert-weak/40 text-alert"
    : "border-hairline bg-anchor-weak text-anchor"
} ${compact ? "sticky top-0 z-10" : ""}`}
          >
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className="whitespace-nowrap px-5 py-3.5 font-bold"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Données inchangées */}
          <tbody className="divide-y divide-hairline">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-10 text-center text-sm text-ink-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
               <tr
  key={index}
  className={`group transition-colors duration-150 ${
    isAnomaly
      ? "even:bg-canvas/35 hover:bg-alert-weak/30"
      : "even:bg-canvas/50 hover:bg-anchor-weak/60"
  }`}
>
                  {columns.map((column, columnIndex) => (
                    <td
                      key={String(column.key)}
                      
className={`
  whitespace-nowrap
  ${compact ? "py-3" : "py-3.5"}
  pr-5 text-ink
  ${
    columnIndex === 0
      ? `border-l-[3px] border-l-transparent pl-[17px] font-semibold transition-colors ${
          isAnomaly
            ? "group-hover:border-l-alert"
            : "group-hover:border-l-anchor"
        }`
      : "pl-5 font-medium tnum"
  }
`}

                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
