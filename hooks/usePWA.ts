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

      // Listen for controller change (means new SW took over)
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!needRefresh) {
          // If we didn't trigger it manually, it might be auto claim.
          // But usually we want to just reload if controller changes to ensure latest assets.
          // window.location.reload(); // Optional: Auto reload
        }
      });

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
  }, []);

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
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistration()
        .then((registration) => {
          if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
            // Allow some time for SW to activate then reload
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            window.location.reload();
          }
        })
        .catch(() => {
          window.location.reload();
        });
    } else {
      window.location.reload();
    }
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
