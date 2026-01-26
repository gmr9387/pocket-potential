import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  // Show iOS instructions
  if (isIOS) {
    return (
      <Card className="fixed bottom-20 left-4 right-4 z-40 animate-fade-in md:left-auto md:right-4 md:w-80">
        <CardHeader className="pb-2 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Smartphone className="w-5 h-5" />
            Install FundFinder
          </CardTitle>
          <CardDescription>Add to your home screen for the best experience</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <ol className="text-sm space-y-2 text-muted-foreground">
            <li>1. Tap the Share button in Safari</li>
            <li>2. Scroll down and tap "Add to Home Screen"</li>
            <li>3. Tap "Add" to install</li>
          </ol>
        </CardContent>
      </Card>
    );
  }

  // Show install button for other browsers
  if (!isInstallable) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 z-40 animate-fade-in md:left-auto md:right-4 md:w-80">
      <CardHeader className="pb-2 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-6 w-6"
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Smartphone className="w-5 h-5" />
          Install FundFinder
        </CardTitle>
        <CardDescription>Get the full app experience on your device</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <Button onClick={handleInstall} className="w-full" variant="gradient">
          <Download className="w-4 h-4 mr-2" />
          Install App
        </Button>
      </CardContent>
    </Card>
  );
};

export default PWAInstallPrompt;
