import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator && window.navigator.standalone === true)
  );
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (!installPrompt || installed) return null;

  const installApp = async () => {
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setInstalled(true);
    }

    setInstallPrompt(null);
  };

  return (
    <button
      type="button"
      onClick={installApp}
      className="fixed right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg transition-smooth hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
      style={{ bottom: "calc(4.75rem + env(safe-area-inset-bottom, 0px))" }}
      aria-label="Installer ALLNTIC"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      <span>Installer</span>
    </button>
  );
}