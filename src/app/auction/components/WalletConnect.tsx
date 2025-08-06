"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnect() {
  return (
    <div className="flex items-center">
      <ConnectButton.Custom>
        {({ account, chain, openAccountModal, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          const ready = mounted && authenticationStatus !== "loading";
          const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

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
                                  if (!connected) {
                    return (
                      <button onClick={openConnectModal} type="button" className="bg-black text-white px-6 py-3 font-mono text-xs uppercase tracking-widest border border-black hover:bg-emerald-700 transition-colors">
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button onClick={openChainModal} type="button" className="bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest border border-black hover:bg-emerald-50 transition-colors">
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-0 border border-black">
                      <button onClick={openChainModal} type="button" className="bg-white text-black px-4 py-3 font-mono text-xs uppercase tracking-widest border-r border-black hover:bg-emerald-50 transition-colors">
                        {chain.hasIcon && <div className="inline-block w-4 h-4 mr-2">{chain.iconUrl && <img alt={chain.name ?? "Chain icon"} src={chain.iconUrl} className="w-4 h-4" />}</div>}
                        {chain.name}
                      </button>

                      <button onClick={openAccountModal} type="button" className="bg-white text-black px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-emerald-50 transition-colors">
                        {account.displayName}
                        {account.displayBalance ? ` (${account.displayBalance})` : ""}
                      </button>
                    </div>
                  );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}
