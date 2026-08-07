import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker } from "./lib/registerServiceWorker";
import { runAutoBackupOnLaunch } from "./lib/autoBackup";

createRoot(document.getElementById("root")!).render(<App />);

void registerServiceWorker();

// Sauvegarde automatique des données (différée pour ne pas bloquer le démarrage)
setTimeout(() => runAutoBackupOnLaunch(), 3000);
