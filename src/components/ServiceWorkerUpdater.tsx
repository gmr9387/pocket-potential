import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RefreshCw, X } from "lucide-react";

const ServiceWorkerUpdater = () => {
  const [showUpdate, setShowUpdate] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log("SW Registered:", swUrl);
      // Check for updates every hour
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error("SW registration error:", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      setShowUpdate(true);
    }
  }, [needRefresh]);

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    setNeedRefresh(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-fade-in">
      <Alert className="border-primary/50 bg-background shadow-lg">
        <RefreshCw className="h-4 w-4 text-primary" />
        <AlertTitle className="flex items-center justify-between">
          Update Available
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p className="text-sm text-muted-foreground mb-3">
            A new version of FundFinder is available with improvements and bug fixes.
          </p>
          <Button onClick={handleUpdate} size="sm" variant="gradient" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ServiceWorkerUpdater;
