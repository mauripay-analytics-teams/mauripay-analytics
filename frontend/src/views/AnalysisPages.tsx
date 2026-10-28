import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  BarChart3,
  Cable,
  CalendarDays,
  Donut,
  MapPinned,
  TrendingUp,
} from "lucide-react";
import Plot from "react-plotly.js";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ApiSnapshot, GeoWilaya, ModelPredictionResult } from "../api/client";
import { DataTable } from "../components/DataTable";
import { GeoMap } from "../components/GeoMap";
import { HourlyHeatmap } from "../components/HourlyHeatmap";
import { CHART, ChartTooltip, axisProps, tooltipCursor } from "../components/ChartKit";
import { AnomaliesView } from "./AnomaliesView";

type SnapshotProps = {
  snapshot: ApiSnapshot | null;
};

type TransactionAnalysisViewProps = SnapshotProps & {
  activeSubPage: "temporal" | "operations" | "geography";
};

type AnomalyAnalysisViewProps = SnapshotProps & {
  activeSubPage: "temporal" | "geography" | "transactions";
  results: ModelPredictionResult[];
};

/** Headers are neutral (anchor) unless the card is about detected anomalies. */
const headerToneClasses = {
  anchor: "bg-anchor-weak text-anchor",
  alert: "bg-alert-weak text-alert",
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.04, staggerChildren: 0.07 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } },
};

const cardHover = { y: -1, transition: { duration: 0.14, ease: "easeOut" as const } };

function formatNumber(value: number) {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

function formatAmount(value: number) {
  return `${formatNumber(value)} MRU`;
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)} %`;
}

function entriesToChart(data: Record<string, number>) {
  return Object.entries(data).map(([name, value]) => ({ name, value }));
}

function countByField<T extends Record<string, unknown>>(rows: T[], field: keyof T) {
  return rows.reduce<Record<string, number>>((accumulator, row) => {
    const rawValue = row[field];
    const key = typeof rawValue === "string" && rawValue.trim() ? rawValue.trim() : "Non renseigné";
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

function topTransactionsWilayas(wilayas: GeoWilaya[]) {
  return [...wilayas].sort((a, b) => b.transactions - a.transactions).slice(0, 8);
}

function topAnomalyWilayas(wilayas: GeoWilaya[]) {
  return [...wilayas].sort((a, b) => b.anomalies_count - a.anomalies_count).slice(0, 8);
}

function ChartHeader({
  title,
  description,
  icon: Icon,
  tone = "anchor",
}: {
  title: string;
  description: string;
  icon: typeof TrendingUp;
  tone?: keyof typeof headerToneClasses;
}) {
  return (
    <header className="mb-3 flex items-start gap-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${headerToneClasses[tone]}`}
        aria-hidden="true"
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div>
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        <p className="mt-0.5 text-xs text-ink-muted">{description}</p>
      </div>
    </header>
  );
}

function SeverityBadge({ label, level }: { label: string; level: 0 | 1 | 2 }) {
  const cls =
    level === 2
      ? "bg-alert-weak text-alert ring-alert/25"
      : level === 1
        ? "bg-alert-weak/60 text-alert ring-alert/15"
        : "bg-anchor-weak text-anchor ring-anchor/15";
  return (
    <span className={`tnum inline-flex rounded-full px-2 py-1 text-xs font-semibold ring-1 ${cls}`}>
      {label}
    </span>
  );
}

function AnomalyBadge({ value }: { value: number }) {
  const level = value >= 150 ? 2 : value >= 50 ? 1 : 0;
  return <SeverityBadge label={formatNumber(value)} level={level} />;
}

function FailureBadge({ value }: { value: number }) {
  const percent = value * 100;
  const level = percent >= 0.6 ? 2 : percent >= 0.4 ? 1 : 0;
  return <SeverityBadge label={formatPercent(value)} level={level} />;
}

export function TransactionsAnalysisView({ activeSubPage, snapshot }: TransactionAnalysisViewProps) {
  const typeChart = useMemo(
    () => entriesToChart(snapshot?.stats.by_type ?? {}),
    [snapshot?.stats.by_type],
  );
  const channelChart = useMemo(
    () => entriesToChart(snapshot?.stats.by_channel ?? {}),
    [snapshot?.stats.by_channel],
  );
  const operatorRows = useMemo(
    () =>
      [...(snapshot?.timeseries.volume_by_operator ?? [])].sort(
        (a, b) => b.transactions - a.transactions,
      ),
    [snapshot?.timeseries.volume_by_operator],
  );
  const wilayas = useMemo(
    () => topTransactionsWilayas(snapshot?.geo.wilayas ?? []),
    [snapshot?.geo.wilayas],
  );

  return (
    <section className="flex flex-col gap-4" aria-label="Analyse des transactions">
      {activeSubPage === "temporal" ? (
        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={gridVariants}
        >
          <motion.div className="dashboard-card chart-card min-w-0 !min-h-0" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Évolution quotidienne du volume traité"
              icon={TrendingUp}
              title="Transactions par jour"
            />
            <div className="min-h-[205px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={snapshot?.timeseries.transactions_by_day ?? []}
                  margin={{ top: 8, right: 14, left: -8, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaAnchor" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={CHART.anchor} stopOpacity={0.16} />
                      <stop offset="100%" stopColor={CHART.anchor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="day" minTickGap={30} {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} cursor={tooltipCursor} />
                  <Area
                    activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
                    dataKey="transactions"
                    dot={false}
                    fill="url(#areaAnchor)"
                    stroke={CHART.anchor}
                    strokeWidth={2}
                    type="monotone"
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div className="dashboard-card chart-card min-h-[310px]" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Montants observés par jour"
              icon={Banknote}
              title="Montants par jour"
            />
            <div className="min-h-[205px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={snapshot?.timeseries.amounts_by_day ?? []}
                  margin={{ top: 8, right: 14, left: 5, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="areaAccent" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={CHART.accent} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={CHART.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="day" minTickGap={30} {...axisProps} />
                  <YAxis width={70} {...axisProps} />
                  <Tooltip content={<ChartTooltip format={(v) => formatAmount(v)} />} cursor={tooltipCursor} />
                  <Area
                    activeDot={{ r: 4, stroke: "#ffffff", strokeWidth: 2 }}
                    dataKey="total_amount"
                    dot={false}
                    fill="url(#areaAccent)"
                    stroke={CHART.accent}
                    strokeWidth={2}
                    type="monotone"
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      {activeSubPage === "operations" ? (
        <motion.div
          className="grid items-start gap-4 lg:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={gridVariants}
        >
          <HourlyHeatmap compact rows={snapshot?.timeseries.hourly_heatmap ?? []} />

          
<motion.div
  className="dashboard-card chart-card min-w-0"
  variants={cardVariants}
  whileHover={cardHover}
>
  <ChartHeader
    description="Transactions traitées par opérateur"
    icon={BarChart3}
    title="Volume par opérateur"
  />

 <div className="h-[200px] w-full min-w-0">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={operatorRows}
        layout="vertical"
        barCategoryGap="24%"
        margin={{
          top: 10,
          right: 52,
          left: 4,
          bottom: 8,
        }}
      >
        <CartesianGrid
          stroke={CHART.grid}
          strokeDasharray="3 4"
          horizontal={false}
        />

        <XAxis
          type="number"
          allowDecimals={false}
          {...axisProps}
        />

        <YAxis
          type="category"
          dataKey="operator"
          width={116}
          {...axisProps}
        />

        <Tooltip
          content={<ChartTooltip />}
          cursor={tooltipCursor}
        />

        <Bar
          dataKey="transactions"
          fill={CHART.anchor}
          radius={[0, 5, 5, 0]}
          maxBarSize={16}
          minPointSize={2}
          animationDuration={550}
        >
          <LabelList
            dataKey="transactions"
            position="right"
            formatter={(value: number) => formatNumber(value)}
            className="fill-ink-muted text-[11px] font-medium"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</motion.div>

          <motion.div className="dashboard-card chart-card !min-h-0 !h-auto min-w-0 self-start" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Part des transactions par catégorie"
              icon={Donut}
              title="Répartition par type"
            />
            <div className="h-[220px] w-full min-w-0">
              <Plot
                config={{ displayModeBar: false, responsive: true }}
                data={[
                  {
                    labels: typeChart.map((item) => item.name),
                    values: typeChart.map((item) => item.value),
                    type: "pie",
                    hole: 0.68,
                    textinfo: "percent",
                    textposition: "outside",
                    hovertemplate: "%{label}<br>%{value:,} transactions<br>%{percent}<extra></extra>",
                    marker: {
                      colors: [...CHART.anchorRamp],
                      line: { color: "#ffffff", width: 2 },
                    },
                  },
                ]}
                layout={{
                  autosize: true,
                  height: 220,
                  margin: { l: 18, r: 16, t: 20, b: 20 },
                  paper_bgcolor: "transparent",
                  plot_bgcolor: "transparent",
                  font: { family: '"IBM Plex Sans", sans-serif', color: CHART.axis },
                  showlegend: true,
                  legend: {
                    orientation: "v",
                    x: 1,
                    y: 0.5,
                    xanchor: "left",
                    yanchor: "middle",
                    font: { size: 11, color: CHART.axis },
                    itemsizing: "constant",
                  },
                }}
                useResizeHandler
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </motion.div>

          <motion.div className="dashboard-card chart-card !min-h-0 !h-auto min-w-0 self-start" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Volume par canal de transaction"
              icon={Cable}
              title="Canaux utilisés"
            />
            <div className="h-[220px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
  barCategoryGap="40%"
  data={channelChart}
  margin={{ top: 24, right: 20, left: 4, bottom: 8 }}
>
                  <CartesianGrid stroke={CHART.grid} vertical={false} />
                  <XAxis dataKey="name" {...axisProps} />
                  <YAxis {...axisProps} />
                  <Tooltip content={<ChartTooltip />} cursor={tooltipCursor} />
                  <Bar dataKey="value" fill={CHART.anchor} radius={[7, 7, 0, 0]} maxBarSize={58} animationDuration={700}>
                    <LabelList
                      className="fill-ink-muted text-[11px] font-medium"
                      dataKey="value"
                      formatter={(value: number) => formatNumber(value)}
                      position="top"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
      ) : null}

      {activeSubPage === "geography" ? (
        <motion.div
       className="grid items-start gap-4 xl:grid-cols-2"
          initial="hidden"
          animate="visible"
          variants={gridVariants}
        >
          <motion.div className="dashboard-card chart-card min-h-[345px]" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Wilayas avec le plus grand volume"
              icon={MapPinned}
              title="Transactions par wilaya"
            />
            <div className="h-[300px] w-full min-w-0 -mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wilayas} layout="vertical" margin={{ top: 0, right: 62, left: 8, bottom: 0 }}>
                  <CartesianGrid
  stroke={CHART.grid}
  strokeDasharray="3 4"
  horizontal={false}
/>
                  <XAxis type="number" {...axisProps} />
                  <YAxis
  dataKey="wilaya"
  type="category"
  width={132}
  interval={0}
  {...axisProps}
/>
                  <Tooltip content={<ChartTooltip />} cursor={tooltipCursor} />
                  <Bar dataKey="transactions" fill={CHART.anchor} radius={[0, 6, 6, 0]} barSize={17} animationDuration={700}>
                    <LabelList
                      className="fill-ink-muted text-[11px] font-medium"
                      dataKey="transactions"
                      formatter={(value: number) => formatNumber(value)}
                      position="right"
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <GeoMap compact wilayas={snapshot?.geo.wilayas ?? []} />

          <div className="lg:col-span-2">
            <DataTable
              columns={[
                { key: "wilaya", label: "Wilaya" },
                {
                  key: "transactions",
                  label: "Transactions",
                  render: (row) => <span className="tnum">{formatNumber(Number(row.transactions))}</span>,
                },
                {
                  key: "total_amount",
                  label: "Montant",
                  render: (row) => <span className="tnum">{formatAmount(Number(row.total_amount))}</span>,
                },
                {
                  key: "failure_rate",
                  label: "Taux d'échec",
                  render: (row) => <FailureBadge value={Number(row.failure_rate)} />,
                },
              ]}
              rows={wilayas}
              title="Wilayas principales"
            />
          </div>
        </motion.div>
      ) : null}
    </section>
  );
}

export function AnomalyAnalysisView({ activeSubPage, snapshot, results }: AnomalyAnalysisViewProps) {
  const anomalyWilayas = useMemo(
    () => topAnomalyWilayas(snapshot?.geo.wilayas ?? []),
    [snapshot?.geo.wilayas],
  );
  const ensembleAnomalies = useMemo(
    () => results.find((result) => result.algorithm === "ensemble")?.preview ?? [],
    [results],
  );
  const typeChart = useMemo(
    () => entriesToChart(countByField(ensembleAnomalies, "transaction_type")),
    [ensembleAnomalies],
  );
  const channelChart = useMemo(
    () => entriesToChart(countByField(ensembleAnomalies, "channel")),
    [ensembleAnomalies],
  );
  const anomalyTypeTotal = typeChart.reduce((total, item) => total + item.value, 0);
  const anomalyChannelMax = Math.max(...channelChart.map((item) => item.value), 1);

  return (
    <section className="flex flex-col gap-4" aria-label="Analyse des anomalies">
      {activeSubPage === "temporal" ? (
        <motion.div
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
          initial="hidden"
          variants={gridVariants}
        >
          
<motion.div
  className="dashboard-card chart-card min-w-0 !min-h-0"
  variants={cardVariants}
  whileHover={cardHover}
>
  <ChartHeader
    description="Répartition horaire des transactions suspectes"
    icon={AlertTriangle}
    title="Anomalies par heure"
    tone="alert"
  />

  
<div className="mt-3 h-[245px] w-full min-w-0 rounded-xl bg-canvas/40 px-2 pt-3 pb-2">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={snapshot?.timeseries.anomalies_by_hour ?? []}
      barCategoryGap="20%"
      margin={{ top: 12, right: 12, left: -12, bottom: 4 }}
    >
      <defs>
        <linearGradient id="hourlyAnomalyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </defs>

      <CartesianGrid
        stroke={CHART.grid}
        strokeDasharray="3 6"
        vertical={false}
      />

      <XAxis
        {...axisProps}
        dataKey="hour"
        axisLine={false}
        tickLine={false}
        tickMargin={10}
      />

      <YAxis
        {...axisProps}
        allowDecimals={false}
        axisLine={false}
        tickLine={false}
        width={40}
      />

      <Tooltip
        content={<ChartTooltip />}
        cursor={{ fill: CHART.alert, fillOpacity: 0.06 }}
      />

      <Bar
        dataKey="anomalies"
        fill="url(#hourlyAnomalyGradient)"
        radius={[8, 8, 0, 0]}
        maxBarSize={34}
        animationDuration={850}
        animationEasing="ease-out"
      />
    </BarChart>
  </ResponsiveContainer>
</div>

</motion.div>


          <motion.div className="dashboard-card chart-card min-h-[310px]" variants={cardVariants} whileHover={cardHover}>
            <ChartHeader
              description="Évolution hebdomadaire des anomalies"
              icon={CalendarDays}
              title="Anomalies par semaine"
              tone="alert"
            />
            
<div className="mt-3 h-[245px] w-full min-w-0 rounded-xl bg-canvas/40 px-3 pb-2 pt-4">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart
      data={snapshot?.timeseries.anomalies_by_week ?? []}
      margin={{
        top: 12,
        right: 18,
        left: -8,
        bottom: 8,
      }}
    >
      <defs>
        <linearGradient
          id="weeklyAnomalyPremium"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0%"
            stopColor={CHART.alert}
            stopOpacity={0.30}
          />
          <stop
            offset="65%"
            stopColor={CHART.alert}
            stopOpacity={0.08}
          />
          <stop
            offset="100%"
            stopColor={CHART.alert}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>

      <CartesianGrid
        stroke={CHART.grid}
        strokeDasharray="3 6"
        vertical={false}
      />

      
<XAxis
  {...axisProps}
  dataKey="week"
  axisLine={false}
  tickLine={false}
  tickMargin={12}
  interval="preserveStartEnd"
  minTickGap={35}
  tickFormatter={(value: string) => {
    const startDate = value.split("/")[0];
    const date = new Date(`${startDate}T12:00:00`);

    return Number.isNaN(date.getTime())
      ? value
      : date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        });
  }}
/>


      <YAxis
        {...axisProps}
        allowDecimals={false}
        axisLine={false}
        tickLine={false}
        width={40}
      />

      <Tooltip
        content={<ChartTooltip />}
        cursor={{
          stroke: CHART.alert,
          strokeOpacity: 0.35,
          strokeDasharray: "4 4",
        }}
      />

      <Area
        type="monotone"
        dataKey="anomalies"
        stroke={CHART.alert}
        strokeWidth={3}
        fill="url(#weeklyAnomalyPremium)"
        dot={{
          r: 4,
          fill: CHART.alert,
          stroke: "#ffffff",
          strokeWidth: 2,
        }}
        activeDot={{
          r: 7,
          fill: CHART.alert,
          stroke: "#ffffff",
          strokeWidth: 3,
        }}
        animationDuration={900}
        animationEasing="ease-out"
      />
    </AreaChart>
  </ResponsiveContainer>
</div>

          </motion.div>

          <motion.div
  className="dashboard-card min-h-[360px] overflow-hidden p-0"
  variants={cardVariants}
  whileHover={cardHover}
>
  <div className="border-b border-hairline bg-gradient-to-br from-alert/10 via-surface to-surface px-5 py-5">
    <ChartHeader
      description="Types présents parmi les anomalies détectées"
      icon={Donut}
      title="Profil des alertes"
      tone="alert"
    />

    <div className="mt-3 grid items-start gap-3 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-alert/15 bg-surface p-4 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Total alertes classées
        </p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <p className="tnum text-[2.2rem] font-bold leading-none tracking-tight text-alert">
              {formatNumber(anomalyTypeTotal)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              Volume total consolidé
            </p>
          </div>

          <span className="rounded-full border border-alert/15 bg-alert-weak px-3 py-1 text-xs font-semibold text-alert">
            Consensus
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-hairline bg-canvas/60 px-4 py-4">
        <p className="text-sm font-semibold text-ink">
          Répartition des catégories
        </p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Chaque carte ci-dessous représente la part d’un type d’alerte dans
          l’ensemble des anomalies détectées.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-hairline">
            {typeChart.length} catégories
          </span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-ink-muted ring-1 ring-hairline">
            100 % des alertes classées
          </span>
        </div>
      </div>
    </div>
  </div>

  <div className="grid gap-3 px-5 py-5 sm:grid-cols-2">
    {typeChart.map((item, index) => {
      const percent = anomalyTypeTotal > 0 ? (item.value / anomalyTypeTotal) * 100 : 0;

      const barColor =
        index === 0
          ? CHART.alert
          : index === 1
            ? CHART.alertRamp[1]
            : CHART.muted;

      return (
        <motion.div
          key={item.name}
          className="group rounded-2xl border border-hairline bg-surface p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-alert/20 hover:shadow-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 + index * 0.05, duration: 0.28 }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: barColor }}
                  aria-hidden="true"
                />
                <p className="truncate text-[14px] font-semibold text-ink">
                  {item.name}
                </p>
              </div>

              <p className="mt-1 text-xs text-ink-muted">
                {percent.toFixed(1)} % des alertes
              </p>
            </div>

            <span className="tnum inline-flex min-w-[56px] justify-center rounded-full bg-alert-weak px-3 py-1 text-xs font-semibold text-alert ring-1 ring-alert/10">
              {formatNumber(item.value)}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-ink-muted">
              <span>Part dans le total</span>
              <span className="tnum">{percent.toFixed(1)} %</span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-canvas ring-1 ring-hairline/70">
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(percent, item.value > 0 ? 4 : 0)}%` }}
                transition={{
                  delay: 0.18 + index * 0.05,
                  duration: 0.65,
                  ease: "easeOut",
                }}
               style={{
                 backgroundColor: barColor,
                    }}
              />
            </div>
          </div>
        </motion.div>
      );
    })}
  </div>
</motion.div>

          
<motion.div
  className="dashboard-card flex min-w-0 flex-col overflow-hidden !p-0"
  variants={cardVariants}
  whileHover={cardHover}
>
  <div className="border-b border-hairline bg-gradient-to-br from-alert/10 via-surface to-surface px-5 py-5">
    <ChartHeader
      description="Canaux présents parmi les anomalies détectées"
      icon={Cable}
      title="Canaux exposés"
      tone="alert"
    />
  </div>

  <div className="flex flex-1 flex-col gap-3 p-5">
    {channelChart.map((item) => {
      const percent =
        anomalyChannelMax > 0
          ? (item.value / anomalyChannelMax) * 100
          : 0;

      const level: 0 | 1 | 2 =
        percent >= 80 ? 2 : percent >= 40 ? 1 : 0;

      const severityLabel =
        level === 2
          ? "Exposition forte"
          : level === 1
            ? "Exposition moyenne"
            : "Exposition faible";

      return (
        <article
          key={item.name}
          className="flex min-h-[145px] flex-1 flex-col justify-center rounded-2xl border border-hairline bg-surface p-4 transition-colors duration-200 hover:border-alert/25 hover:bg-canvas/40"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                Canal
              </p>
              <h3 className="mt-1 text-lg font-bold text-ink">
                {item.name}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="tnum rounded-xl bg-alert-weak px-3 py-1.5 text-lg font-bold text-alert">
                {formatNumber(item.value)}
              </span>
              <SeverityBadge
                label={severityLabel}
                level={level}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-ink-muted">
              <span>Niveau relatif</span>
              <span className="tnum font-semibold text-ink">
                {Math.round(percent)} %
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
              <motion.div
                className="h-full rounded-full bg-alert"
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(
                    percent,
                    item.value > 0 ? 6 : 0
                  )}%`,
                }}
                transition={{
                  duration: 0.65,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        </article>
      );
    })}
  </div>
</motion.div>

        </motion.div>
      ) : null}

      {activeSubPage === "geography" ? (
        <motion.div
          animate="visible"
          className="grid gap-4 lg:grid-cols-2"
          initial="hidden"
          variants={gridVariants}
        >
          
<motion.div
  className="dashboard-card min-w-0 overflow-hidden !p-0"
  variants={cardVariants}
  whileHover={cardHover}
>
  <div className="border-b border-hairline bg-gradient-to-r from-alert/10 via-surface to-surface px-5 py-4">
    <ChartHeader
      description="Zones avec le plus de signalements"
      icon={AlertTriangle}
      title="Top wilayas par anomalies"
      tone="alert"
    />
  </div>

  <div className="space-y-2 p-4">
    {anomalyWilayas.map((item, index) => {
      const maxValue = Math.max(
        ...anomalyWilayas.map((wilaya) => wilaya.anomalies_count),
        1
      );

      const percent = (item.anomalies_count / maxValue) * 100;

      return (
        <div
          key={item.wilaya}
          className="group rounded-xl border border-hairline bg-surface px-3 py-2.5 transition-colors duration-200 hover:border-alert/25 hover:bg-alert-weak/20">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                index === 0
                  ? "bg-alert text-white"
                  : "bg-alert-weak text-alert"
              }`}
            >
              {index + 1}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-[13px] font-semibold text-ink">
                  {item.wilaya}
                </span>

                <span className="tnum shrink-0 text-sm font-bold text-alert">
                  {formatNumber(item.anomalies_count)}
                </span>
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-canvas">
                <motion.div
                  className="h-full rounded-full bg-alert"
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</motion.div>


          <motion.div className="min-h-0" variants={cardVariants} whileHover={cardHover}>
            <DataTable
            variant="anomaly"
              columns={[
                { key: "wilaya", label: "Wilaya" },
                {
                  key: "anomalies_count",
                  label: "Anomalies",
                  render: (row) => <AnomalyBadge value={Number(row.anomalies_count)} />,
                },
                {
                  key: "transactions",
                  label: "Transactions",
                  render: (row) => <span className="tnum">{formatNumber(Number(row.transactions))}</span>,
                },
                {
                  key: "failure_rate",
                  label: "Taux d'échec",
                  render: (row) => <FailureBadge value={Number(row.failure_rate)} />,
                },
              ]}
              rows={anomalyWilayas}
              title="Classement géographique des anomalies"
            />
          </motion.div>
        </motion.div>
      ) : null}

      {activeSubPage === "transactions" ? <AnomaliesView results={results} /> : null}
    </section>
  );
}
