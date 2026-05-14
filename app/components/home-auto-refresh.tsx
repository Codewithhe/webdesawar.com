"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type HomeAutoRefreshProps = {
  intervalMs?: number;
};

export default function HomeAutoRefresh({ intervalMs = 60_000 }: HomeAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, router]);

  return null;
}
