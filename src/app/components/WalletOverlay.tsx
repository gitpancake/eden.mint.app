import { ScrambleText } from "./ScrambleText";

interface WalletOverlayProps {
  isConnected: boolean;
  address: string | undefined;
  balance: { formatted: string; symbol: string } | undefined;
  isPending: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletOverlay({ isConnected, address, balance, isPending, onConnect, onDisconnect }: WalletOverlayProps) {
  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
      {!isConnected ? (
        <button
          className="font-mono text-xs tracking-widest border-b-0 border-black hover:text-emerald-400 transition bg-transparent px-0 py-0 rounded-none shadow-none uppercase text-black"
          onClick={onConnect}
          disabled={isPending}
        >
          <ScrambleText text={isPending ? "CONNECTING..." : "CONNECT WALLET"} />
        </button>
      ) : (
        <>
          <span className="font-mono text-xs uppercase tracking-widest text-black">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "ADDRESS"}</span>
          <span className="font-mono text-xs ml-2 uppercase tracking-widest text-black">{balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "..."}</span>
          <button
            className="font-mono text-xs ml-2 uppercase tracking-widest text-black hover:text-emerald-400 transition bg-transparent px-0 py-0 rounded-none shadow-none border-0"
            onClick={onDisconnect}
          >
            <ScrambleText text="DISCONNECT" />
          </button>
        </>
      )}
    </div>
  );
}
