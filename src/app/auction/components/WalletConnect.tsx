"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatEther } from "viem";
import { useAccount, useBalance, useChainId } from "wagmi";

export function WalletConnect() {
  const chainId = useChainId();
  const { address } = useAccount();

  const { data: liveBalance } = useBalance({ address, chainId });

  return (
    <div className="flex items-center">
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");
          const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 767px)").matches;

          return (
            <div
              {...(!ready && {
                "aria-hidden": true,
                style: {
                  opacity: 0,
                  pointerEvents: "none",
                  userSelect: "none",
                },
              })}
            >
              {(() => {
                if (isMobile) {
                  // Mobile: minimal UI — address only, no borders/padding/chain
                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} type="button" className="bg-transparent text-black p-0 m-0 border-0 font-mono text-[10px] uppercase tracking-widest">
                        Connect
                      </button>
                    );
                  }
                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} type="button" className="bg-transparent text-black p-0 m-0 border-0 font-mono text-[10px] uppercase tracking-widest">
                        Wrong Network
                      </button>
                    );
                  }
                  const short = account.address ? `${account.address.slice(0, 4)}…${account.address.slice(-4)}` : account.displayName;
                  return (
                    <button onClick={openAccountModal} type="button" className="bg-transparent text-black p-0 m-0 border-0 font-mono text-[10px] leading-none uppercase tracking-widest">
                      {short}
                    </button>
                  );
                } else {
                  // Desktop: original full UI
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        type="button"
                        className="bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest border border-black hover:bg-emerald-700 transition-colors"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest border border-black hover:bg-emerald-50 transition-colors"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  const displayBal = liveBalance ? ` (${Number(formatEther(liveBalance.value)).toFixed(3)} ${liveBalance.symbol})` : "";
                  return (
                    <div className="flex items-center gap-0 border border-black">
                      <button
                        onClick={openChainModal}
                        type="button"
                        className="bg-white text-black px-4 py-3 font-mono text-xs uppercase tracking-widest border-r border-black hover:bg-emerald-50 transition-colors"
                      >
                        {chain.hasIcon && <div className="inline-block w-4 h-4 mr-2">{chain.iconUrl && <img alt={chain.name ?? "Chain icon"} src={chain.iconUrl} className="w-4 h-4" />}</div>}
                        {chain.name}
                      </button>

                      <button onClick={openAccountModal} type="button" className="bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                        {account.displayName}
                        {displayBal}
                      </button>
                    </div>
                  );
                }
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
