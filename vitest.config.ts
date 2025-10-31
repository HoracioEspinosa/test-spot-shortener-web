import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitest.dev/config/
export default defineConfig(() => ({
	plugins: [react()],
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		css: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/test/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/mockData",
				"**/.{idea,git,cache,output,temp}",
			],
		},
	},
	// Vitest extends Vite config; keep resolve aliases for tests
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
}));
