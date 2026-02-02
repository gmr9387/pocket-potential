import { Link, LinkProps } from "react-router-dom";
import { useCallback } from "react";

// Route to module mapping for prefetching
const routeModules: Record<string, () => Promise<unknown>> = {
  "/": () => import("@/pages/Index"),
  "/auth": () => import("@/pages/Auth"),
  "/dashboard": () => import("@/pages/Dashboard"),
  "/programs": () => import("@/pages/Programs"),
  "/results": () => import("@/pages/Results"),
  "/how-it-works": () => import("@/pages/HowItWorks"),
  "/faq": () => import("@/pages/FAQ"),
  "/documents": () => import("@/pages/DocumentVault"),
  "/community": () => import("@/pages/Community"),
  "/admin": () => import("@/pages/AdminDashboard"),
  "/profile": () => import("@/pages/Profile"),
};

interface PrefetchLinkProps extends LinkProps {
  to: string;
}

/**
 * A Link component that prefetches the target route's module on hover
 * for instant navigation experience
 */
const PrefetchLink = ({ to, children, onMouseEnter, ...props }: PrefetchLinkProps) => {
  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Get the base path without query params
      const basePath = to.split("?")[0];
      
      // Prefetch the route module if it exists
      const prefetchModule = routeModules[basePath];
      if (prefetchModule) {
        prefetchModule();
      }

      // Call original onMouseEnter if provided
      if (onMouseEnter) {
        onMouseEnter(e);
      }
    },
    [to, onMouseEnter]
  );

  return (
    <Link to={to} onMouseEnter={handleMouseEnter} {...props}>
      {children}
    </Link>
  );
};

export default PrefetchLink;
