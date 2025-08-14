"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useEffect as useReactEffect } from "react";
import { useAccount, useConnect } from "wagmi";

export function useMiniAppReady(): void {
  useEffect(() => {
    let isMounted = true;
    let retryTimeoutId: number | null = null;
    let attemptIndex = 0;
    const retryDelaysMs = [0, 150, 500, 1000, 2000];

    const tryReady = async () => {
      if (!isMounted) return;
      try {
        await sdk.actions.ready();
        cleanup();
      } catch {
        if (!isMounted) return;
        if (attemptIndex < retryDelaysMs.length - 1) {
          attemptIndex += 1;
          retryTimeoutId = window.setTimeout(tryReady, retryDelaysMs[attemptIndex]);
        }
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tryReady();
      }
    };

    const cleanup = () => {
      if (retryTimeoutId !== null) {
        clearTimeout(retryTimeoutId);
        retryTimeoutId = null;
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("load", tryReady);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("load", tryReady);
    retryTimeoutId = window.setTimeout(tryReady, retryDelaysMs[attemptIndex]);

    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);

  // Attempt to autoconnect using the Mini App connector when in Mini App
  useReactEffect(() => {
    try {
      const isMini = typeof window !== "undefined" && !!(window as any).farcaster?.miniapp;
      if (!isMini) return;
    } catch {
      return;
    }
  }, []);

  // If in Mini App and not yet connected, try connecting with the first connector (Mini App connector is first)
  const { isConnected } = useAccount();
  const { connect, connectors, status } = useConnect();
  useReactEffect(() => {
    const isMini = typeof window !== "undefined" && !!(window as any).farcaster?.miniapp;
    if (!isMini) return;
    if (isConnected) return;
    if (status === "pending") return;
    if (!connectors || connectors.length === 0) return;
    const primary = connectors[0];
    try {
      connect({ connector: primary });
    } catch {
      // ignore
    }
  }, []);
}
