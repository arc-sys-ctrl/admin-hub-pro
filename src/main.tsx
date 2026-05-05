import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { resolvedApiBaseUrl } from "./lib/api";

console.info(`[CRM] API base URL: ${resolvedApiBaseUrl}`);

createRoot(document.getElementById("root")!).render(<App />);
