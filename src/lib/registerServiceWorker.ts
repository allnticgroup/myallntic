const APP_SERVICE_WORKER_PATH = "/sw.js";

const PREVIEW_HOSTS = [
  "lovableproject.com",
  "lovableproject-dev.com",
  "beta.lovable.dev",
];

function isPreviewHost(hostname: string) {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    PREVIEW_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))
  );
}

function isInsideIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function shouldDisableAppServiceWorker() {
  return (
    !import.meta.env.PROD ||
    isInsideIframe() ||
    isPreviewHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off"
  );
}

async function unregisterAppServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const appScope = new URL("/", window.location.origin).href;
  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.allSettled(
    registrations
      .filter((registration) => {
        const scriptUrls = [
          registration.active?.scriptURL,
          registration.installing?.scriptURL,
          registration.waiting?.scriptURL,
        ].filter(Boolean);

        return (
          registration.scope === appScope ||
          scriptUrls.some((scriptUrl) => {
            try {
              return new URL(scriptUrl as string).pathname === APP_SERVICE_WORKER_PATH;
            } catch {
              return false;
            }
          })
        );
      })
      .map((registration) => registration.unregister()),
  );
}

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  if (shouldDisableAppServiceWorker()) {
    await unregisterAppServiceWorkers();
    return;
  }

  const { registerSW } = await import("virtual:pwa-register");

  registerSW({
    immediate: true,
    onRegisterError(error) {
      console.error("PWA service worker registration failed", error);
    },
  });
}