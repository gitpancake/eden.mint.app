"use client";

import { useAccount, useChainId } from "wagmi";

export function MiniWalletBadge() {
  const { address, isConnected } = useAccount();
  useChainId();

  const isMini = typeof window !== "undefined" && !!(window as any).farcaster?.miniapp;
  if (!isMini) return null;
  if (!isConnected || !address) return null;

  const short = `${address.slice(0, 4)}…${address.slice(-4)}`;

  return (
    <button className="flex items-center gap-1 bg-transparent border-0 p-0 m-0">
      <span className="font-mono text-[10px] leading-none uppercase tracking-widest text-black">{short}</span>
    </button>
  );
}
