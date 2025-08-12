"use client";

import { useMemo } from "react";
import { useAccount, useReadContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface OwnerControlsProps {
  owner: `0x${string}` | undefined;
}

export function OwnerControls({ owner }: OwnerControlsProps) {
  const { address } = useAccount();
  const isOwner = useMemo(() => owner && address && owner.toLowerCase() === address.toLowerCase(), [owner, address]);

  const { data: auctionDuration } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "AUCTION_DURATION",
  });
  const { data: restDuration } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "REST_DURATION",
  });

  if (!isOwner || !auctionDuration || !restDuration) return null;

  return (
    <div className="border border-black p-6 bg-white">
      <div className="font-mono text-sm font-bold text-black uppercase tracking-widest mb-4">Owner Controls</div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="font-mono text-xs text-black uppercase tracking-widest">
          Auction duration
          <div className="font-mono text-sm text-black mt-1">{Number(auctionDuration) / 60} minutes</div>
        </div>
        <div className="font-mono text-xs text-black uppercase tracking-widest">
          Rest duration
          <div className="font-mono text-sm text-black mt-1">{Number(restDuration) / 60} minutes</div>
        </div>
      </div>
    </div>
  );
}
