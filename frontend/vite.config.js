import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (id.indexOf("node_modules") !== -1) {
                        if (id.indexOf("plotly.js") !== -1) {
                            return "vendor-plotly";
                        }
                        if (id.indexOf("leaflet") !== -1 ||
                            id.indexOf("react-leaflet") !== -1) {
                            return "vendor-maps";
                        }
                        if (id.indexOf("recharts") !== -1) {
                            return "vendor-charts";
                        }
                    }
                    return undefined;
                },
            },
        },
    },
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./tests/setup.ts",
    },
});
