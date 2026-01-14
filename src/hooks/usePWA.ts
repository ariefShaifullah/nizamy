import { useState, useEffect } from "react";
import { useToast } from "../components/ui/Toast.tsx";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // 1. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Detect Standalone (Installed Mode)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // 3. Capture Install Prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from automatically showing the prompt
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Handle Service Worker Updates
    if ("serviceWorker" in navigator) {
      const checkForUpdates = () => {
        navigator.serviceWorker
          .getRegistration()
          .then((registration) => {
            if (registration) {
              registration
                .update()
                .catch((e) => console.debug("SW update check failed", e)); // Force check
              if (registration.waiting) {
                setNeedRefresh(true);
              }
            }
          })
          .catch((err) => {
            console.debug("Could not get SW registration:", err);
          });
      };

      // Periodically check for updates (e.g., every hour)
      const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

      // Initial check
      checkForUpdates();

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt
        );
        clearInterval(interval);
      };
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, [needRefresh]);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      showToast("Terima kasih telah menginstal aplikasi!", "success");
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const updateServiceWorker = () => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        // Add a listener to reload the page once the new service worker has taken control
        const handleControllerChange = () => {
          window.location.reload();
        };

        navigator.serviceWorker.addEventListener(
          "controllerchange",
          handleControllerChange,
          { once: true } // Automatically remove the listener after it fires
        );

        // Send a message to the waiting service worker to trigger skipWaiting()
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    });
  };

  return {
    isInstallable,
    isIOS,
    isStandalone,
    needRefresh,
    installApp,
    updateServiceWorker,
  };
};
