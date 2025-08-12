"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { formatEther } from "viem";
import { useAccount, useChainId, useReadContract, useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG, type Auction } from "../config/contract";
import { useAuctionEvents } from "../hooks/useAuctionEvents";
import { BidForm } from "./BidForm";
import { CountdownTimer } from "./CountdownTimer";
import { NFTPreview } from "./NFTPreview";
import { OwnerControls } from "./OwnerControls";
// import { RestCountdown } from "./RestCountdown";

export function AuctionCard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const fetcher = async (url: string) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const { data, isLoading, mutate } = useSWR("/api/auction-state", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    keepPreviousData: true,
    shouldRetryOnError: false,
  });

  // Client-side fallbacks for critical reads when SSR fails or is delayed
  const { data: ownerOnChain } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "owner",
    chainId,
  });
  const { data: genesisStartedOnChain } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "genesisStarted",
    chainId,
  });

  const currentAuction: Auction | null = useMemo(() => {
    if (!data?.currentAuction || !data.auctionActive) return null;
    return {
      auctionId: BigInt(data.currentAuction.auctionId),
      tokenId: BigInt(data.currentAuction.tokenId),
      startTime: BigInt(data.currentAuction.startTime),
      endTime: BigInt(data.currentAuction.endTime),
      highestBidder: data.currentAuction.highestBidder,
      highestBid: BigInt(data.currentAuction.highestBid),
      settled: data.currentAuction.settled,
      exists: data.currentAuction.exists,
    } as Auction;
  }, [data]);

  const auctionActive: boolean = Boolean(data?.auctionActive);
  const canSettleAuction: boolean = Boolean(data?.canSettleAuction);
  const hasStarted: boolean = Boolean(data?.currentAuction?.hasStarted);
  const hasEnded: boolean = Boolean(data?.currentAuction?.hasEnded);
  const nextTokenUriSeeded: boolean = Boolean(data?.nextTokenUriSeeded);
  // const auctionsSinceLastRest: bigint = BigInt(data?.auctionsSinceLastRest || 0);
  const owner: `0x${string}` | undefined = (data?.owner as `0x${string}` | undefined) ?? ownerOnChain;
  const genesisStarted: boolean = (data?.genesisStarted as boolean | undefined) ?? Boolean(genesisStartedOnChain);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  // Genesis preflight simulation must be declared before any conditional return
  const isOwnerAddr = owner && address && owner.toLowerCase() === address.toLowerCase();
  const simulateGenesis = useSimulateContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "startGenesisAuction",
    account: address as `0x${string}` | undefined,
    chainId,
    query: { enabled: true },
  });
  const missingUriGenesis = Boolean(
    !genesisStarted && isOwnerAddr && simulateGenesis.error && (simulateGenesis.error.message?.includes("MissingTokenURI") || String(simulateGenesis.error).includes("MissingTokenURI"))
  );

  useAuctionEvents({
    onBidPlaced: () => mutate(),
    onBidRefunded: () => mutate(),
    onAuctionSettled: () => mutate(),
    onAuctionStarted: () => mutate(),
    onRestScheduled: () => mutate(),
    onAuctionDurationUpdated: () => mutate(),
    onRestDurationUpdated: () => mutate(),
  });

  // no-op: rely on SWR refreshInterval and events; avoid key changes to prevent flicker

  // Local clock to switch UI states exactly at boundaries without network calls
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!data && isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square border border-emerald-200 bg-emerald-50" />
              <div className="space-y-4">
                <div className="h-8 border border-emerald-200 bg-emerald-50 w-3/4" />
                <div className="h-4 border border-emerald-200 bg-emerald-50 w-1/2" />
                <div className="h-20 border border-emerald-200 bg-emerald-50" />
                <div className="h-12 border border-emerald-200 bg-emerald-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auctionActive) {
    // Dormant pre-genesis
    if (!genesisStarted) {
      return (
        <div className="max-w-4xl mx-auto">
          <div className="border border-black p-8 text-center bg-white space-y-4">
            <h2 className="font-mono text-xl font-bold text-black uppercase tracking-widest">Auctions not live yet</h2>
            <p className="font-mono text-sm text-black">Waiting for the owner to start the genesis auction.</p>
            <OwnerControls owner={owner} />
            {isOwnerAddr && (
              <button
                onClick={async () => {
                  await writeContract({ ...AUCTION_CONTRACT_CONFIG, functionName: "startGenesisAuction" });
                  mutate();
                }}
                disabled={isPending || isConfirming || missingUriGenesis || !nextTokenUriSeeded}
                className="mx-auto mt-2 bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors border border-black"
              >
                Start Genesis Auction
              </button>
            )}
            {isOwnerAddr && (!nextTokenUriSeeded || missingUriGenesis) && <div className="font-mono text-xs text-black">Seed token URI for tokenId 0 before starting genesis.</div>}
          </div>
        </div>
      );
    }

    // Paused flow: awaiting next token URI seeding
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 text-center bg-white space-y-4">
          <h2 className="font-mono text-xl font-bold text-black uppercase tracking-widest">Paused: awaiting metadata</h2>
          <p className="font-mono text-sm text-black">Owner needs to seed metadata for the next token. Once seeded, retry settlement to resume auctions.</p>
          <button
            onClick={async () => {
              await writeContract({ ...AUCTION_CONTRACT_CONFIG, functionName: "settleAuction" });
              mutate();
            }}
            disabled={isPending || isConfirming}
            className="mx-auto mt-2 bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors border border-black"
          >
            Retry Settle
          </button>
          <OwnerControls owner={owner} />
        </div>
      </div>
    );
  }

  if (!currentAuction) {
    return null;
  }
  const auction = currentAuction as Auction;
  const isWinner = address && auction.highestBidder.toLowerCase() === address.toLowerCase();
  const currentTime = BigInt(Math.floor(nowMs / 1000));
  const auctionEnded = Boolean(hasEnded || (auction.endTime > BigInt(0) && currentTime >= auction.endTime));
  const preStart = !hasStarted || currentTime < auction.startTime;
  const canBid = Boolean(auctionActive) && !auctionEnded && !preStart;

  const getAuctionStatus = () => {
    if (!auctionActive) {
      return { text: "Auction inactive", color: "text-gray-400" };
    } else if (auctionEnded) {
      if (canSettleAuction) {
        return { text: "Auction ended. Anyone can settle.", color: "text-orange-400" };
      } else {
        return { text: "Auction ended; awaiting settlement", color: "text-red-400" };
      }
    } else if (auction.highestBid === BigInt(0)) {
      return { text: "Awaiting first bid", color: "text-yellow-400" };
    } else {
      return { text: "Live auction", color: "text-green-400" };
    }
  };

  const status = getAuctionStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border border-black p-8 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-black pb-6">
          <div>
            <h1 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-2">Auction #{auction.auctionId.toString()}</h1>
            <div
              className={`flex items-center font-mono text-xs uppercase tracking-widest ${
                status.color === "text-yellow-400" ? "text-black" : status.color === "text-green-400" ? "text-emerald-700" : "text-black"
              }`}
            >
              {status.text}
            </div>
          </div>

          {/* Live indicator */}
          {!auctionEnded && auctionActive && auction.highestBid > BigInt(0) && (
            <div className="flex items-center border border-emerald-700 px-4 py-2 bg-emerald-50">
              <div className="w-2 h-2 bg-emerald-700 rounded-full animate-pulse mr-2"></div>
              <span className="text-emerald-700 font-mono text-xs font-bold uppercase tracking-widest">LIVE</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left side - NFT Preview */}
          <div>
            <NFTPreview tokenId={auction.tokenId} />
          </div>

          {/* Right side - Auction Details & Bidding */}
          <div className="space-y-6">
            {/* Countdown Timer */}
            <CountdownTimer startTime={auction.startTime} endTime={auction.endTime} auctionActive={Boolean(auctionActive)} className="border border-black p-6 bg-white" />

            {/* Current Bid Info */}
            <div className="border border-black p-6 bg-white">
              <h3 className="font-mono text-sm font-bold text-black uppercase tracking-widest mb-4">Current Bid</h3>
              {auction.highestBid > BigInt(0) ? (
                <div>
                  <div className="font-mono text-3xl font-bold text-black mb-2">{formatEther(auction.highestBid)} ETH</div>
                  <div className="font-mono text-xs text-black">
                    by {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                    {isWinner && <span className="text-emerald-700 ml-2 font-bold">(You)</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="font-mono text-2xl font-bold text-black mb-2">No bids yet</div>
                  <div className="font-mono text-xs text-black">Be the first to bid and start the auction!</div>
                </div>
              )}
              {/* Initial highest bidder (0) notice – only after start time */}
              {!auctionEnded && auction.highestBid === BigInt(0) && isWinner && currentTime >= auction.startTime && (
                <div className="mt-4 p-3 border border-emerald-200 bg-emerald-50 font-mono text-xs text-emerald-700">Place a bid to set the opening price.</div>
              )}
            </div>

            {/* Bidding Form */}
            <BidForm
              currentBid={auction.highestBid}
              auctionActive={Boolean(auctionActive)}
              auctionEnded={Boolean(auctionEnded)}
              canSettle={Boolean(canSettleAuction)}
              canBid={canBid}
              preStart={preStart}
              onBidSuccess={() => mutate()}
              onSettleSuccess={() => mutate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
