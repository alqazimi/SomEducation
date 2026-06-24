type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

interface Window {
  __pwaBootstrap?: boolean;
  __pwaDeferredInstall?: BeforeInstallPromptEvent | null;
  __pwaInstallNow?: () => boolean;
}
