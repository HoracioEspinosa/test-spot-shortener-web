import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
		host: true,
		proxy: {
			"/api": {
				target: "http://34.201.25.56:8000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
