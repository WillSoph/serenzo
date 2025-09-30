// app/ga-ads-tracking.tsx
"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global { interface Window { dataLayer: any[]; gtag: (...args:any[]) => void } }

export default function GaAdsTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!window.gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    window.gtag("event", "page_view", { page_path: url });
  }, [pathname, searchParams]);

  return null;
}
