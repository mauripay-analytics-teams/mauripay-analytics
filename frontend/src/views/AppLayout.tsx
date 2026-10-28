import { useEffect, useState, type ReactNode } from "react";
import {
  ChevronDown, ChevronLeft, ChevronRight, Moon, Sun,
  LayoutDashboard, Menu, RefreshCw, ShieldAlert, Wifi, WifiOff, X,
  ArrowLeftRight, Clock3, ListFilter, MapPinned, BarChart3,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import mauriPayLogo from "../assets/mauripay-logo.svg";

export type AppView =
  | "dashboard"
  | "transactionTemporal"
  | "transactionOperations"
  | "transactionGeography"
  | "anomalyTemporal"
  | "anomalyGeography"
  | "anomalyTransactions";

type AppLayoutProps = {
  activeView: AppView;
  anomalyCount: number;
  apiConnected: boolean;
  children: ReactNode;
  datasetName: string;
  onReconnect: () => void;
  onRefresh: () => void;
  onNavigate: (view: AppView) => void;
  refreshing: boolean;
};

type Item = { view: AppView; label: string; icon: typeof LayoutDashboard };
type Section = { id: string; label: string; icon: typeof LayoutDashboard; target: AppView; views: AppView[]; items?: Item[] };
const SECTIONS: Section[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, target: "dashboard", views: ["dashboard"] },
  {
    id: "transactions", label: "Transactions", icon: ArrowLeftRight,
    target: "transactionTemporal", views: ["transactionTemporal", "transactionOperations", "transactionGeography"],
    items: [
      { view: "transactionTemporal", label: "Évolution des transactions", icon: Clock3 },
      { view: "transactionOperations", label: "Analyse des opérations", icon: BarChart3 },
      { view: "transactionGeography", label: "Répartition territoriale", icon: MapPinned },
    ],
  },
  {
    id: "anomalies", label: "Anomalies", icon: ShieldAlert,
    target: "anomalyTransactions", views: ["anomalyTemporal", "anomalyGeography", "anomalyTransactions"],
    items: [
      { view: "anomalyTemporal", label: "Tendances des anomalies", icon: Clock3 },
      { view: "anomalyGeography", label: "Zones à risque", icon: MapPinned },
      { view: "anomalyTransactions", label: "Transactions suspectes", icon: ListFilter },
    ],
  },
];

export function AppLayout({
  activeView, anomalyCount, apiConnected, children, datasetName,
  onReconnect, onRefresh, onNavigate, refreshing,
}: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["transactions", "anomalies"]);
  const [apiPanelOpen, setApiPanelOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return window.localStorage.getItem("mauripay-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem("mauripay-theme", theme);
    } catch {
      // Le navigateur peut bloquer le stockage local.
    }
  }, [theme]);

  const activeSection = SECTIONS.find((s) => s.views.includes(activeView)) ?? SECTIONS[0];
  function navigate(view: AppView) {
    onNavigate(view);
    setMobileMenuOpen(false);
    setApiPanelOpen(false);
  }
  function toggleSection(id: string) {
    setExpanded((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  const navigation = (mobile: boolean) => (
    <nav aria-label={mobile ? "Navigation mobile" : "Navigation principale"} className="space-y-1">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const active = section.id === activeSection.id;
        const open = expanded.includes(section.id);
        const showLabels = mobile || !sidebarCollapsed;
        return (
          <div key={section.id}>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title={!showLabels ? section.label : undefined}
                aria-current={active && !section.items ? "page" : undefined}
                onClick={() => {
                  navigate(section.target);
                  if (section.items && !open) toggleSection(section.id);
                }}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active ? "bg-anchor-weak font-semibold text-anchor" : "text-ink-muted hover:bg-canvas hover:text-ink"
                } ${!showLabels ? "justify-center" : ""}`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {showLabels && <span className="truncate">{section.label}</span>}
                {showLabels && section.id === "anomalies" && anomalyCount > 0 && (
                  <span className="ml-auto rounded-full bg-alert-weak px-2 py-0.5 text-[11px] font-semibold text-alert">
                    {anomalyCount > 99 ? "99+" : anomalyCount}
                  </span>
                )}
              </button>
              {section.items && showLabels && (
                <button
                  type="button"
                  aria-label={`${open ? "Réduire" : "Développer"} ${section.label}`}
                  aria-expanded={open}
                  onClick={() => toggleSection(section.id)}
                  className="rounded-lg p-2 text-ink-muted hover:bg-canvas"
                >
                  <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {section.items && open && showLabels && (
              <div className="ml-5 mt-1 space-y-0.5 border-l border-hairline pl-3">
                {section.items.map((item) => {
                  const SubIcon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.view}
                      aria-current={activeView === item.view ? "page" : undefined}
                      onClick={() => navigate(item.view)}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                        activeView === item.view
                          ? "bg-anchor-weak font-semibold text-anchor"
                          : "text-ink-muted hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      <SubIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="app-shell flex min-h-screen overflow-x-hidden">
      {/* Desktop sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-30 hidden h-screen shrink-0 flex-col border-r border-hairline bg-surface lg:flex"
        animate={{ width: sidebarCollapsed ? 76 : 252 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <div className="flex h-[64px] items-center gap-2.5 border-b border-hairline px-4">
          <img src={mauriPayLogo} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-ink">MauriPay <span className="text-anchor">Analytics</span></p>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-6 soft-scrollbar">
          {!sidebarCollapsed && <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-ink-faint">Navigation</p>}
          {navigation(false)}
        </div>
        <div className="border-t border-hairline p-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-ink-muted hover:bg-canvas"
            aria-label={sidebarCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            onClick={() => setSidebarCollapsed((c) => !c)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /> Réduire le menu</>}
          </button>
        </div>
      </motion.aside>

   <div
  className={`flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-in-out ${
    sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-[252px]"
  }`}
>   
        <header data-testid="app-header" className="app-header sticky top-0 z-40 border-b border-hairline bg-surface/95 backdrop-blur">
          <div className="flex h-[64px] items-center gap-3 px-4 sm:px-6">
            <button
              type="button" aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink lg:hidden"
              onClick={() => setMobileMenuOpen((o) => !o)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-ink">{activeSection.label}</h1>

            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              
              <button
                type="button"
                aria-label={theme === "light" ? "Activer le mode sombre" : "Activer le mode clair"}
                title={theme === "light" ? "Mode sombre" : "Mode clair"}
                aria-pressed={theme === "dark"}
                onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline text-ink-muted hover:bg-canvas hover:text-ink"
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <div className="relative">
                <button type="button" aria-expanded={apiPanelOpen} aria-label={apiConnected ? "API connectée" : "API indisponible"}
                  className={`flex h-9 items-center gap-2 rounded-lg border px-2.5 text-xs font-semibold ${apiConnected ? "border-hairline text-anchor" : "border-alert/25 bg-alert-weak text-alert"}`}
                  onClick={() => { setApiPanelOpen((o) => !o); }}>
                  <span className={`h-2 w-2 rounded-full ${apiConnected ? "bg-anchor" : "bg-alert"}`} />
                  {apiConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  <span className="hidden sm:inline">{apiConnected ? "API connectée" : "API indisponible"}</span>
                </button>
                <AnimatePresence>
                  {apiPanelOpen && <motion.div key="api" initial={{ opacity: 0, y: -7 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }}
                    className="absolute right-0 top-12 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-hairline bg-surface p-4 shadow-pop">
                    <p className="text-sm font-bold text-ink">{apiConnected ? "Service disponible" : "Connexion interrompue"}</p>
                    <p className="mt-2 break-all font-mono text-xs text-ink-muted">{import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000"}</p>
                    <button type="button" disabled={refreshing} onClick={onReconnect} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-hairline px-3 py-2 text-sm font-semibold text-ink-muted hover:bg-canvas disabled:opacity-40">
                      <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} /> Tester la connexion
                    </button>
                  </motion.div>}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <AnimatePresence>
            {mobileMenuOpen && <motion.div key="mobile-nav" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-hairline bg-surface lg:hidden">
              <div className="max-h-[65vh] overflow-y-auto p-4">{navigation(true)}</div>
            </motion.div>}
          </AnimatePresence>
        </header>
        <main data-testid="app-content" className="app-content min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}