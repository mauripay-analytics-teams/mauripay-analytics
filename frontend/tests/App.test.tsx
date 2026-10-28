import { render, screen , within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import type React from "react";
import App from "../src/App";

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Popup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("react-plotly.js", () => ({
  default: () => <div data-testid="plotly-chart" />,
}));

test("renders dashboard cards and navigates via the top nav", async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText(/MauriPay/)).toBeInTheDocument();
  expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
  expect(screen.getByText("Montant total")).toBeInTheDocument();
  expect(screen.getByText("Fraudes détectées")).toBeInTheDocument();
  expect(screen.getAllByText("Taux d'échec").length).toBeGreaterThan(0);
  expect(screen.getByText("Importer des transactions")).toBeInTheDocument();

  
const navigation = screen.getByRole("navigation", {
  name: "Navigation principale",
});

// Vérifier que le menu Anomalies existe.
const anomaliesButton = within(navigation).getByRole(
  "button",
  { name: "Anomalies" }
);

expect(anomaliesButton).toBeInTheDocument();

// Naviguer vers la page des anomalies.
await user.click(anomaliesButton);

// // Vérifier que la navigation a changé.
// expect(anomaliesButton).toHaveAttribute(
//   "aria-current",
//   "page"
// );
// Vérifier que la sous-page des anomalies est sélectionnée.
expect(
  within(navigation).getByRole("button", {
    name: "Transactions suspectes",
  })
).toHaveAttribute("aria-current", "page");

  await user.click(screen.getByRole("button", { name: "Transactions" }));
  await user.click(screen.getByRole("button", { name: /Opérations/ }));
  expect(screen.getByText("Heatmap horaire")).toBeInTheDocument();
  expect(screen.queryByText("Fichier de transactions")).not.toBeInTheDocument();
  expect(screen.queryByText("Montant total")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Anomalies" }));
  await user.click(screen.getByRole("button", { name: /Transactions suspectes/ }));
expect(
  within(navigation).getByRole("button", {
    name: "Transactions suspectes",
  })
).toHaveAttribute("aria-current", "page");  
});
