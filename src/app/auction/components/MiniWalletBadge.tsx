"use client";

import { useAccount, useChainId, useConnect } from "wagmi";

export function MiniWalletBadge() {
  const { address, isConnected } = useAccount();
  useChainId();
  const { connect, connectors, status } = useConnect();

  const isMini = typeof window !== "undefined" && !!(window as any).farcaster?.miniapp;
  if (!isMini) return null;
  if (!isConnected || !address) return null;

  const short = `${address.slice(0, 4)}…${address.slice(-4)}`;

  function openWalletSwitcher() {
    try {
      // Re-invoking the Mini App connector will surface the Farcaster wallet switch UI
      if (status !== "pending" && connectors && connectors[0]) {
        connect({ connector: connectors[0] });
      }
    } catch {
      // no-op
    }
  }

  return (
    <button onClick={openWalletSwitcher} className="flex items-center gap-1 bg-transparent border-0 p-0 m-0">
      <span className="font-mono text-[10px] leading-none uppercase tracking-widest text-black">{short}</span>
    </button>
  );
}
