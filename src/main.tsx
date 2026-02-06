import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";
import { initWebVitals } from "./lib/webVitals";

createRoot(document.getElementById("root")!).render(<App />);

// Initialize Core Web Vitals monitoring after app renders
initWebVitals();
