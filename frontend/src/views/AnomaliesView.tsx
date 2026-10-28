import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { ModelPredictionResult, PredictionPreview } from "../api/client";

type AnomalyRow = PredictionPreview & {
  model: "ensemble";
};

type AnomaliesViewProps = {
  results: ModelPredictionResult[];
};

const PAGE_SIZE = 100;

function uniqueValues(rows: AnomalyRow[], key: keyof AnomalyRow) {
  return [...new Set(rows.map((row) => String(row[key] ?? "")).filter(Boolean))].sort();
}

function formatAmount(value?: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Number(value ?? 0))} MRU`;
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function readableLabel(value?: string) {
  if (!value) return "None";
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (letter: string) => letter.toUpperCase());
}

const typeBadge = "bg-alert-weak text-alert ring-1 ring-alert/20";

function statusBadge(value?: string) {
  return value?.toUpperCase() === "SUCCESS"
    ? "border border-hairline text-ink-muted"
    : "bg-alert-weak text-alert";
}

function splitBusinessReasons(value?: string) {
  if (!value) return [];
  return value
    .split(/[|;,]/)
    .map((reason) => reason.trim())
    .filter(Boolean);
}

function explainAnomaly(row: AnomalyRow) {
  const type = row.anomaly_type?.toUpperCase() ?? "";
  const operator = row.operator ?? "cet opérateur";
  const wilaya = row.sender_wilaya ?? row.receiver_wilaya ?? "cette wilaya";
  const amount = formatAmount(row.amount);
  const status = row.status?.toUpperCase() ?? "";
  const score = Number(row.anomaly_score ?? 0).toFixed(3);
  const businessReasons = splitBusinessReasons(row.business_rule_reasons);

  if (type.includes("HIGH")) {
    return {
      title: "Montant inhabituellement élevé",
      summary: `Cette transaction est signalée parce que son montant (${amount}) est très élevé par rapport au comportement attendu dans le dataset.`,
      factors: [
        "Le montant est un signal important pour la détection.",
        `La transaction concerne ${operator} dans ${wilaya}.`,
        `Score d'anomalie calculé : ${score}.`,
        status === "SUCCESS"
          ? "Le paiement a réussi, il peut donc représenter un risque financier réel."
          : "Le paiement a échoué, mais la tentative reste importante pour l'analyse du risque.",
      ],
      businessReasons,
    };
  }

  if (type.includes("OUTAGE")) {
    return {
      title: "Suspicion de problème opérateur",
      summary: `Cette transaction est signalée car elle ressemble à un incident ou une interruption de service chez ${operator}.`,
      factors: [
        status === "FAILED"
          ? "Le statut FAILED renforce l'hypothèse d'un problème technique ou d'une panne temporaire."
          : "Même si le statut n'est pas FAILED, le contexte opérateur reste anormal.",
        `Zone observée : ${wilaya}.`,
        `Montant observé : ${amount}.`,
        `Score d'anomalie calculé : ${score}.`,
      ],
      businessReasons,
    };
  }

  if (type.includes("LOCATION")) {
    return {
      title: "Localisation inhabituelle",
      summary: `Cette transaction est détectée car sa localisation (${wilaya}) paraît inhabituelle par rapport aux habitudes observées.`,
      factors: [
        "La wilaya ou le chemin de transaction sort du comportement attendu.",
        `Opérateur concerné : ${operator}.`,
        `Montant observé : ${amount}.`,
        `Score d'anomalie calculé : ${score}.`,
      ],
      businessReasons,
    };
  }

  return {
    title: "Transaction considérée comme atypique",
    summary:
      "Cette transaction est signalée par le consensus de détection car plusieurs signaux statistiques ou métier la rendent différente des transactions normales.",
    factors: [
      `Type détecté : ${readableLabel(row.anomaly_type)}.`,
      `Opérateur concerné : ${operator}.`,
      `Zone observée : ${wilaya}.`,
      `Score d'anomalie calculé : ${score}.`,
    ],
    businessReasons,
  };
}


const selectClass =
  "mt-2 h-11 w-full min-w-0 rounded-xl border border-hairline bg-surface px-3.5 text-sm font-medium text-ink shadow-sm outline-none transition-all duration-200 hover:border-alert/30 focus:border-alert focus:ring-2 focus:ring-alert/15";

export function AnomaliesView({ results }: AnomaliesViewProps) {
  const [wilaya, setWilaya] = useState("");
  const [operator, setOperator] = useState("");
  const [anomalyType, setAnomalyType] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AnomalyRow | null>(null);

  const rows = useMemo<AnomalyRow[]>(() => {
    const ensemble = results.find((result) => result.algorithm === "ensemble");
    return (ensemble?.preview ?? []).map((transaction) => ({
      ...transaction,
      model: "ensemble",
    }));
  }, [results]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) => {
        const rowWilaya = row.sender_wilaya ?? row.receiver_wilaya ?? "";
        return (
          (!wilaya || rowWilaya === wilaya) &&
          (!operator || row.operator === operator) &&
          (!anomalyType || row.anomaly_type === anomalyType)
        );
      }),
    [anomalyType, operator, rows, wilaya],
  );
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, filteredRows.length);
  const paginatedRows = useMemo(
    () => filteredRows.slice(startIndex, endIndex),
    [endIndex, filteredRows, startIndex],
  );
  const wilayas = useMemo(
    () =>
      [...new Set(rows.map((row) => row.sender_wilaya ?? row.receiver_wilaya ?? "").filter(Boolean))].sort(),
    [rows],
  );
  const anomalyTypes = useMemo(() => uniqueValues(rows, "anomaly_type"), [rows]);
  const hasFilters = Boolean(wilaya || operator || anomalyType);

  useEffect(() => {
    setPage(1);
  }, [anomalyType, operator, results, wilaya]);

  function resetFilters() {
    setWilaya("");
    setOperator("");
    setAnomalyType("");
    setPage(1);
  }

  if (results.length === 0) {
    return (
      <section className="dashboard-card p-6 text-sm font-medium text-ink-muted">
        Televersez un fichier pour afficher les transactions suspectes.
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Vue anomalies">
      
<motion.div
  className="dashboard-card min-w-0 overflow-hidden !p-0"
  initial={{ opacity: 0, y: -8 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: 0.3,
    ease: "easeOut",
  }}
 >
  {/* En-tête */}
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-alert/10 bg-gradient-to-r from-alert/10 via-surface to-surface px-5 py-4">
    <div className="flex items-center gap-3">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-alert-weak text-alert"
        aria-hidden="true"
      >
        <SlidersHorizontal className="h-5 w-5" />
      </span>

      <div>
        <h2 className="text-sm font-bold text-ink">
          Filtres
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">
          Affiner les transactions suspectes
        </p>
      </div>
    </div>

    <button
      type="button"
      disabled={!hasFilters}
      onClick={resetFilters}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-3.5 text-xs font-semibold text-ink-muted transition-all duration-200 hover:border-alert/25 hover:bg-alert-weak hover:text-alert disabled:cursor-not-allowed disabled:opacity-40"
    >
      <RotateCcw
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      Réinitialiser
    </button>
  </div>

  {/* Champs de filtrage */}
  <div className="grid gap-4 p-5 md:grid-cols-3">

    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
      Wilaya

      <select
        aria-label="Filtrer par wilaya"
        className={selectClass}
        value={wilaya}
        onChange={(event) => setWilaya(event.target.value)}
      >
        <option value="">Toutes</option>
        {wilayas.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>

    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
      Opérateur

      <select
        aria-label="Filtrer par opérateur"
        className={selectClass}
        value={operator}
        onChange={(event) => setOperator(event.target.value)}
      >
        <option value="">Tous</option>
        {uniqueValues(rows, "operator").map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>

    <label className="block min-w-0 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
      Type d'anomalie

      <select
        aria-label="Filtrer par type d'anomalie"
        className={selectClass}
        value={anomalyType}
        onChange={(event) => setAnomalyType(event.target.value)}
      >
        <option value="">Tous</option>
        {anomalyTypes.map((value) => (
          <option key={value} value={value}>
            {readableLabel(value)}
          </option>
        ))}
      </select>
    </label>

  </div>
</motion.div>

      <motion.div
        className="dashboard-card min-w-0 overflow-hidden !p-0"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.34, ease: [0.22, 1, 0.36, 1] }} 
        >
          
<div className="flex items-center gap-3 border-b border-alert/15 bg-gradient-to-r from-alert/10 via-surface to-surface px-5 py-4">
  <span
    aria-hidden="true"
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-alert-weak text-alert"
  >
    <ShieldAlert className="h-5 w-5" />
  </span>

  <div>
    <h2 className="text-sm font-bold text-ink">
      Transactions suspectes
    </h2>
    <p className="mt-0.5 text-xs text-ink-muted">
      Résultats de détection des anomalies
    </p>
  </div>
</div>

        <div className="soft-scrollbar max-h-[560px] overflow-auto">
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-left text-[12px]">
            <thead className="sticky top-0 z-10 border-b border-alert/15 bg-alert-weak text-[10px] font-bold uppercase tracking-[0.08em] text-alert">
              <tr>
                <th className="w-[8.5rem] px-4 py-2.5 font-semibold">Date</th>
                <th className="w-[13rem] px-4 py-2.5 font-semibold">Transaction</th>
                <th className="w-24 px-4 py-2.5 font-semibold">Score</th>
                <th className="w-36 px-4 py-2.5 font-semibold">Type</th>
                <th className="w-36 px-4 py-2.5 font-semibold">Wilaya</th>
                <th className="w-28 px-4 py-2.5 font-semibold">Opérateur</th>
                <th className="w-36 px-4 py-2.5 font-semibold">Montant</th>
                <th className="w-28 px-4 py-2.5 font-semibold">Statut</th>
                <th className="w-20 px-4 py-2.5 text-center font-semibold">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {paginatedRows.map((row, index) => {
                const wilayaName = row.sender_wilaya ?? row.receiver_wilaya ?? "-";

                return (
                  <tr
                    className="group text-ink transition-colors duration-150 even:bg-canvas/35 hover:bg-alert-weak/25"
                    key={`${row.model}-${row.transaction_id ?? startIndex + index}`}
                  >
                    <td className="tnum whitespace-nowrap px-4 py-3 font-mono text-xs text-ink-muted">
                      {formatDate(row.timestamp)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="block max-w-[15rem] truncate font-mono text-xs text-ink"
                        title={row.transaction_id ?? "-"}
                      >
                        {row.transaction_id ?? "-"}
                      </span>
                    </td>
                    <td className="tnum px-4 py-3 font-mono text-xs font-medium text-ink">
                      {Number(row.anomaly_score ?? 0).toFixed(3)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${typeBadge}`}>
                        {readableLabel(row.anomaly_type)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block max-w-[9rem] whitespace-normal leading-5" title={wilayaName}>
                        {wilayaName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block truncate" title={row.operator ?? "-"}>
                        {row.operator ?? "-"}
                      </span>
                    </td>
                    <td className="tnum whitespace-nowrap px-4 py-3 font-medium text-ink">
                      {formatAmount(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${statusBadge(row.status)}`}
                      >
                        {row.status ?? "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        aria-label={`Voir ${row.transaction_id ?? "la transaction"}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-hairline text-ink-muted transition-colors hover:border-anchor/40 hover:bg-anchor-weak hover:text-anchor"
                        onClick={() => setSelected(row)}
                        type="button"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-10 text-center text-sm text-ink-muted" colSpan={9}>
                    Aucune transaction ne correspond aux filtres sélectionnés.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </motion.div>

      <div className="dashboard-card flex flex-col gap-3 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="tnum text-xs font-medium text-ink-muted">
          {filteredRows.length > 0
            ? `${(startIndex + 1).toLocaleString("fr-FR")} – ${endIndex.toLocaleString("fr-FR")} sur ${filteredRows.length.toLocaleString("fr-FR")} anomalies`
            : "0 anomalie"}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            type="button"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Precedent
          </button>
          <span className="tnum min-w-24 text-center text-xs font-medium text-ink-muted">
            Page {currentPage.toLocaleString("fr-FR")} / {pageCount.toLocaleString("fr-FR")}
          </span>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            disabled={currentPage >= pageCount}
            onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
            type="button"
          >
            Suivant
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {selected
        ? (() => {
            const explanation = explainAnomaly(selected);

            return (
              <div
                className="fixed inset-0 z-[1000] flex items-center justify-center bg-ink/40 p-4"
                role="dialog"
              >
                <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-hairline bg-surface shadow-pop">
                  
<header className="flex items-start justify-between gap-4 border-b border-alert/15 bg-gradient-to-r from-alert/10 via-surface to-surface px-6 py-5">
  <div className="flex min-w-0 items-start gap-4">
    <span
      aria-hidden="true"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-alert-weak text-alert"
    >
      <AlertTriangle className="h-5 w-5" />
    </span>

    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-alert">
        Détails de détection
      </p>

      <h3 className="mt-1.5 text-xl font-bold leading-tight tracking-tight text-ink">
        {explanation.title}
      </h3>

      <p className="mt-2 break-all font-mono text-xs text-ink-muted">
        Transaction {selected.transaction_id ?? "-"}
      </p>
    </div>
  </div>

  <button
    aria-label="Fermer les details"
    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-hairline bg-surface text-ink-muted transition-all duration-200 hover:border-alert/25 hover:bg-alert-weak hover:text-alert focus-visible:outline focus-visible:outline-2 focus-visible:outline-alert"
    onClick={() => setSelected(null)}
    type="button"
  >
    <X className="h-5 w-5" />
  </button>
</header>

                  <div className="space-y-4 p-5">
                    
<div className="relative overflow-hidden rounded-2xl border border-alert/15 bg-surface p-5 shadow-sm">
  <div
    aria-hidden="true"
    className="absolute bottom-0 left-0 top-0 w-1 bg-alert"
  />

  <div className="flex items-center gap-2">
    <span
      aria-hidden="true"
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-alert-weak text-alert"
    >
      <AlertTriangle className="h-4 w-4" />
    </span>

    <h4 className="text-[12px] font-bold uppercase tracking-[0.06em] text-alert">
      Pourquoi cette transaction est suspecte
    </h4>
  </div>

  <p className="mt-4 text-sm leading-7 text-ink">
    {explanation.summary}
  </p>
</div>


                    
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
  <div className="min-w-0 rounded-2xl border border-hairline bg-canvas/50 p-4 transition-colors hover:border-alert/25">
    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
      Type
    </p>
    <span
      className={`mt-3 inline-flex max-w-full break-words rounded-lg px-2.5 py-1.5 text-xs font-semibold ${typeBadge}`}
    >
      {readableLabel(selected.anomaly_type)}
    </span>
  </div>

  <div className="min-w-0 rounded-2xl border border-hairline bg-canvas/50 p-4 transition-colors hover:border-alert/25">
    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
      Score
    </p>
    <p className="tnum mt-3 break-all font-mono text-sm font-bold text-ink">
      {Number(selected.anomaly_score ?? 0).toFixed(3)}
    </p>
  </div>

  <div className="min-w-0 rounded-2xl border border-hairline bg-canvas/50 p-4 transition-colors hover:border-alert/25">
    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
      Montant
    </p>
    <p className="tnum mt-3 break-words text-sm font-bold text-ink">
      {formatAmount(selected.amount)}
    </p>
  </div>

  <div className="min-w-0 rounded-2xl border border-hairline bg-canvas/50 p-4 transition-colors hover:border-alert/25">
    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
      Statut
    </p>
    <span
      className={`mt-3 inline-flex rounded-lg px-2.5 py-1.5 text-xs font-semibold ${statusBadge(selected.status)}`}
    >
      {selected.status ?? "-"}
    </span>
  </div>
</div>
                    <div className="grid items-stretch gap-4 md:grid-cols-[1.1fr_0.9fr]">
                      <section className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-ink">
                          Facteurs qui expliquent la détection
                        </h4>
                        <ul className="mt-4 space-y-3">
                          {explanation.factors.map((factor) => (
                            <li
                              className="flex gap-2 text-sm leading-6 text-ink-muted"
                              key={factor}
                            >
                              <span
                                aria-hidden="true"
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-anchor"
                              />
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section className="rounded-2xl border border-hairline bg-canvas/50 p-5 shadow-sm">
                        <h4 className="text-sm font-semibold text-ink">Contexte transaction</h4>
                        <dl className="mt-4 space-y-4 text-sm">
                          <div>
                            <dt className="text-[11px] font-semibold uppercase text-ink-faint">Date</dt>
                            <dd className="tnum mt-1 font-medium text-ink">{formatDate(selected.timestamp)}</dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-semibold uppercase text-ink-faint">Wilaya</dt>
                            <dd className="mt-1 font-medium text-ink">
                              {selected.sender_wilaya ?? selected.receiver_wilaya ?? "-"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[11px] font-semibold uppercase text-ink-faint">Opérateur</dt>
                            <dd className="mt-1 font-medium text-ink">{selected.operator ?? "-"}</dd>
                          </div>
                        </dl>
                      </section>
                    </div>

                    {explanation.businessReasons.length > 0 ? (
                      
<section className="overflow-hidden rounded-2xl border border-alert/20 bg-surface shadow-sm">
  <div className="flex items-center gap-3 border-b border-alert/10 bg-alert-weak/40 px-5 py-4">
    <span
      aria-hidden="true"
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-alert-weak text-alert"
    >
      <AlertTriangle className="h-4 w-4" />
    </span>

    <h4 className="text-sm font-bold text-ink">
      Règles métier déclenchées
    </h4>
  </div>

  <ul className="space-y-3 p-5">
    {explanation.businessReasons.map((reason) => (
      <li
        key={reason}
        className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas/40 p-3 text-sm leading-6 text-ink"
      >
        <span
          aria-hidden="true"
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-alert"
        />
        <span>{reason}</span>
      </li>
    ))}
  </ul>
</section>
                    ) : null}

                    
<details className="group overflow-hidden rounded-2xl border border-hairline bg-surface shadow-sm">
  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-canvas/50 px-5 py-4 text-sm font-semibold text-ink transition-colors hover:bg-alert-weak/30 [&::-webkit-details-marker]:hidden">
    <span className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-alert-weak text-alert"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </span>
      Données techniques complètes
    </span>

    <ChevronRight
      aria-hidden="true"
      className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-90"
    />
  </summary>

  <div className="border-t border-hairline p-4 sm:p-5">
    <dl className="grid gap-3 sm:grid-cols-2">
      {Object.entries(selected).map(([key, value]) => (
        <div
          key={key}
          className="min-w-0 rounded-xl border border-hairline bg-canvas/50 p-3.5 transition-colors hover:border-alert/20 hover:bg-surface"
        >
          <dt className="mb-2 break-words text-[10px] font-bold uppercase tracking-[0.07em] text-ink-muted">
            {key}
          </dt>
          <dd className="tnum break-all font-mono text-xs font-medium leading-relaxed text-ink">
            {String(value ?? "-")}
          </dd>
        </div>
      ))}
    </dl>
  </div>
</details>
                  </div>
                </div>
              </div>
            );
          })()
        : null}
    </section>
  );
}
