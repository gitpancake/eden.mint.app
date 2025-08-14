"use client";

import { useAccount, useConnect } from "wagmi";
import { MiniWalletBadge } from "./MiniWalletBadge";

export function MiniAppWallet() {
  const { isConnected } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return <MiniWalletBadge />;
  }

  return (
    <button onClick={() => connect({ connector: connectors[0] })} className="bg-transparent text-black p-0 m-0 border-0 font-mono text-[10px] uppercase tracking-widest">
      Connect
    </button>
  );
}
