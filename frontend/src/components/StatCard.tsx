import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  status: string;
  icon: LucideIcon;
  /** `alert` is reserved for the detected-fraud figure only. */
  tone?: "default" | "alert";
  nowrapValue?: boolean;
};

const toneClasses = {
  default: {
    topRule: "bg-anchor/70",
    icon: "bg-anchor-weak text-anchor",
    value: "text-ink",
  },
  alert: {
    topRule: "bg-alert/70",
    icon: "bg-alert-weak text-alert",
    value: "text-alert",
  },
} as const;

function parseDisplayValue(value: string) {
  if (value === "—" || value.trim() === "") {
    return null;
  }

  const match = value.match(/\d[\d\s\u00a0\u202f.,]*/);
  if (!match) return null;

  const rawNumber = match[0];
  const normalized = rawNumber.replace(/[\s ]/g, "").replace(",", ".");
  const target = Number(normalized);
  if (!Number.isFinite(target)) return null;

  return {
    decimals: rawNumber.includes(".") || rawNumber.includes(",") ? 2 : 0,
    decimalSeparator: rawNumber.includes(".") ? "." : ",",
    prefix: value.slice(0, match.index ?? 0),
    suffix: value.slice((match.index ?? 0) + rawNumber.length),
    target,
  };
}

function CountUpValue({ value }: { value: string }) {
  const parsed = useMemo(() => parseDisplayValue(value), [value]);
  const reduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (!parsed || reduceMotion) {
      setDisplayValue(value);
      return;
    }

    const parsedValue = parsed;
    let frameId = 0;
    const duration = 600;
    const start = performance.now();
    const formatter = new Intl.NumberFormat("fr-FR", {
      maximumFractionDigits: parsedValue.decimals,
      minimumFractionDigits: parsedValue.decimals,
    });

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parsedValue.target * eased;
      const formatted =
        parsedValue.decimalSeparator === "."
          ? formatter.format(current).replace(",", ".")
          : formatter.format(current);
      setDisplayValue(`${parsedValue.prefix}${formatted}${parsedValue.suffix}`);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [parsed, reduceMotion, value]);

  return <>{displayValue}</>;
}

export function StatCard({
  title,
  value,
  detail,
  status,
  icon: Icon,
  tone = "default",
  nowrapValue = false,
}: StatCardProps) {
  const colors = toneClasses[tone];
  const reduceMotion = useReducedMotion();

  
return (
  <motion.section
    className="
      group relative flex min-h-[155px] min-w-0
      flex-col overflow-hidden rounded-2xl
      border border-hairline bg-surface p-5
      shadow-card transition-all duration-200
      hover:border-anchor/20
      hover:shadow-card-hover
    "
    
whileHover={
  reduceMotion
    ? undefined
    : {
        y: -3,
        transition: {
          duration: 0.18,
          ease: "easeOut",
        },
      }
}
    variants={{
      hidden: { opacity: 0, y: 10 },
      visible: { opacity: 1, y: 0 },
    }}
    transition={{
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    }}
  >
    {/* En-tête */}
    <div className="flex items-start justify-between gap-3">
      <p className="
        min-w-0 text-[11px] font-semibold
        uppercase tracking-[0.08em] text-ink-muted
      ">
        {title}
      </p>

      <span
        aria-hidden="true"
        className={`
          flex h-10 w-10 shrink-0 items-center
          justify-center rounded-xl
transition-transform duration-200
group-hover:scale-105 ${colors.icon}
        `}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>

    {/* Valeur statistique */}
    <p
      className={`
        tnum mt-3 text-[clamp(1.4rem,2vw,2rem)]
        font-bold leading-tight tracking-tight
        ${colors.value}
        ${nowrapValue ? "truncate" : "break-words"}
      `}
    >
      <CountUpValue value={value} />
    </p>

    {/* Description et badge */}
    <div className="mt-auto min-w-0 pt-5">
      <p className="
        text-xs leading-relaxed text-ink-muted
      ">
        {detail}
      </p>

      <div className="mt-3 flex flex-wrap">
        <span
          className={`
            inline-flex max-w-full items-center
            rounded-full px-2.5 py-1
            text-[10px] font-semibold
            ${tone === "alert"
              ? "bg-alert-weak text-alert"
              : "bg-anchor-weak text-anchor"
            }
          `}
        >
          <span className="break-words">
            {status}
          </span>
        </span>
      </div>
    </div>
  </motion.section>
);
}
