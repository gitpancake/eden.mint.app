"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface OwnerControlsProps {
  owner: `0x${string}` | undefined;
}

export function OwnerControls({ owner }: OwnerControlsProps) {
  const { address } = useAccount();
  const isOwner = useMemo(() => owner && address && owner.toLowerCase() === address.toLowerCase(), [owner, address]);

  const { data: auctionDuration } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "auctionDuration",
  });
  const { data: restDuration } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "restDuration",
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const [auctionMinutes, setAuctionMinutes] = useState(auctionDuration ? Number(auctionDuration) / 60 : 15);
  const [restHours, setRestHours] = useState(restDuration ? Math.round(Number(restDuration) / 3600) : 24);

  useEffect(() => {
    if (auctionDuration) {
      setAuctionMinutes(Number(auctionDuration) / 60);
    }
    if (restDuration) {
      setRestHours(Math.round(Number(restDuration) / 60));
    }
  }, [auctionDuration, restDuration]);

  if (!isOwner || !auctionDuration || !restDuration) return null;

  return (
    <div className="border border-black p-6 bg-white">
      <div className="font-mono text-sm font-bold text-black uppercase tracking-widest mb-4">Owner Controls</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-black uppercase tracking-widest">Auction duration (minutes)</label>
          <input
            type="number"
            min={1}
            value={auctionMinutes}
            onChange={(e) => setAuctionMinutes(Number(e.target.value))}
            className="w-full bg-white border border-black px-3 py-2 font-mono text-black"
          />
          <button
            className="mt-2 bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest border border-black"
            disabled={isPending || isConfirming}
            onClick={async () => {
              const minutes = Math.max(1, Math.round(auctionMinutes));
              const value = BigInt(minutes) * BigInt(60);
              await writeContract({
                ...AUCTION_CONTRACT_CONFIG,
                functionName: "updateAuctionDuration",
                args: [value],
              });
            }}
          >
            {isPending || isConfirming ? "Updating..." : "Update Duration"}
          </button>
        </div>
        <div>
          <label className="font-mono text-xs text-black uppercase tracking-widest">Rest duration (minutes)</label>
          <input type="number" min={1} value={restHours} onChange={(e) => setRestHours(Number(e.target.value))} className="w-full bg-white border border-black px-3 py-2 font-mono text-black" />
          <button
            className="mt-2 bg-black text-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-widest border border-black"
            disabled={isPending || isConfirming}
            onClick={async () => {
              const hours = Math.max(1, Math.round(restHours));
              const restValue = BigInt(hours) * BigInt(3600);
              await writeContract({
                ...AUCTION_CONTRACT_CONFIG,
                functionName: "updateRestDuration",
                args: [restValue],
              });
            }}
          >
            {isPending || isConfirming ? "Updating..." : "Update Rest"}
          </button>
        </div>
      </div>
      {error && <div className="mt-3 font-mono text-xs text-black">{error.message}</div>}
      {isSuccess && <div className="mt-3 font-mono text-xs text-emerald-700">Updated</div>}
    </div>
  );
}
