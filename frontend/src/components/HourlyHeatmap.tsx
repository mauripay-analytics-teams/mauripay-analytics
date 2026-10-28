
import { Clock3 } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type HeatmapRow = {
  day_of_week: string;
  hour: number;
  transactions: number;
};

type HourlyHeatmapProps = {
  rows: HeatmapRow[];
  compact?: boolean;
};

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DAY_LABELS: Record<string, string> = {
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mer",
  Thursday: "Jeu",
  Friday: "Ven",
  Saturday: "Sam",
  Sunday: "Dim",
};

export function HourlyHeatmap({
  rows,
  compact = false,
}: HourlyHeatmapProps) {
  const reduceMotion = useReducedMotion();

  const max = Math.max(
    ...rows.map((row) => row.transactions),
    1
  );

  const valueBySlot = new Map(
    rows.map((row) => [
      `${row.day_of_week}-${row.hour}`,
      row.transactions,
    ])
  );

  return (
    <motion.section
      aria-label="Heatmap horaire des transactions"
      className={`
        dashboard-card min-w-0
        rounded-2xl border border-hairline
        bg-surface p-5 shadow-card
        transition-shadow duration-200
        hover:shadow-card-hover
        ${compact ? "self-start" : ""}
      `}
      initial={
        reduceMotion
          ? false
          : { opacity: 0, y: 8 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.3 }}
    >
      <header className="mb-2 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-xl bg-anchor-weak text-anchor
          "
        >
          <Clock3 className="h-[18px] w-[18px]" />
        </span>

        <div>
          <h2 className="text-[13px] font-semibold text-ink">
            Heatmap horaire
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            Activité par jour et par heure
          </p>
        </div>
      </header>

      <div className="soft-scrollbar -mt-3 overflow-x-auto pb-2">
        <div
          className={`
            grid gap-[4px]
            ${compact
              ? "min-w-[550px] xl:min-w-0"
              : "min-w-[650px]"
            }
          `}
          style={{
            gridTemplateColumns:
              "38px repeat(24, minmax(13px, 1fr))",
          }}
        >
          <div />

          {Array.from({ length: 24 }, (_, hour) => (
            <div
              key={hour}
              className="
                tnum text-center text-[10px]
                font-medium text-ink-faint
              "
            >
              {hour}
            </div>
          ))}

          {DAYS.map((day, dayIndex) => (
            <div className="contents" key={day}>
              <div
                className="
                  flex items-center text-[11px]
                  font-medium text-ink-muted
                "
              >
                {DAY_LABELS[day]}
              </div>

              {Array.from({ length: 24 }, (_, hour) => {
                const value =
                  valueBySlot.get(`${day}-${hour}`) ?? 0;

                const intensity =
                  0.07 + (value / max) * 0.88;

                return (
                  <motion.div
                    key={`${day}-${hour}`}
                    role="img"
                    aria-label={`${DAY_LABELS[day]}, ${hour} h : ${value.toLocaleString("fr-FR")} transactions`}
                    tabIndex={0}
                    className="
                      h-[19px] rounded-[4px]
                      cursor-default
                      transition-transform duration-150
                      hover:scale-110
                      hover:ring-2 hover:ring-anchor/30
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-anchor
                    "
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0 }
                    }
                    animate={{ opacity: 1 }}
                    transition={{
                      delay: reduceMotion
                        ? 0
                        : 0.04 + dayIndex * 0.02,
                      duration: reduceMotion ? 0 : 0.2,
                    }}
                    style={{
                      backgroundColor:
                        `rgba(12, 92, 76, ${intensity})`,
                    }}
                    title={`${DAY_LABELS[day]} ${hour} h — ${value.toLocaleString("fr-FR")} transactions`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div
        className="
          mt-2 flex items-center
          justify-end gap-2
          text-[11px] font-medium
          text-ink-muted
        "
      >
        <span>Faible</span>
        <span
          aria-hidden="true"
          className="h-2 w-20 rounded-full"
          style={{
            background:
              "linear-gradient(90deg, rgba(12,92,76,0.10), rgba(12,92,76,0.95))",
          }}
        />
        <span>Fort</span>
      </div>
    </motion.section>
  );
}
