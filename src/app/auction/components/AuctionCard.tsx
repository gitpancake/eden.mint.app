"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { AUCTION_CONTRACT_CONFIG, type Auction } from "../config/contract";
import { BidForm } from "./BidForm";
import { CountdownTimer } from "./CountdownTimer";
import { NFTPreview } from "./NFTPreview";

export function AuctionCard() {
  const { address } = useAccount();
  const [, setRefreshTrigger] = useState(0);

  // Read current auction data
  const {
    data: currentAuction,
    isLoading: auctionLoading,
    refetch: refetchAuction,
  } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "getCurrentAuction",
  });

  const { data: auctionActive } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "auctionActive",
  });

  const { data: auctionStarted } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "auctionStarted",
  });

  const { data: canClaimNFT } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "canClaimNFT",
  });

  const { data: canExpireAuction } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "canExpireAuction",
  });

  // Watch for contract events to trigger re-fetching
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "BidPlaced",
    onLogs() {
      refetchAuction();
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionSettled",
    onLogs() {
      refetchAuction();
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionStarted",
    onLogs() {
      refetchAuction();
      setRefreshTrigger((prev) => prev + 1);
    },
  });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAuction();
    }, 10000);

    return () => clearInterval(interval);
  }, [refetchAuction]);

  if (auctionLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <div className="animate-pulse">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-700 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentAuction || !auctionActive) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Active Auction</h2>
          <p className="text-gray-400">There&apos;s no auction currently running. Check back soon for the next artwork!</p>
        </div>
      </div>
    );
  }

  const auction = currentAuction as Auction;
  const isWinner = address && auction.highestBidder.toLowerCase() === address.toLowerCase();
  const auctionEnded = auctionStarted && auction.endTime > BigInt(0) && BigInt(Math.floor(Date.now() / 1000)) >= auction.endTime;

  const getAuctionStatus = () => {
    if (!auctionStarted) {
      return { text: "Waiting for first bid", color: "text-yellow-400", icon: "⏳" };
    } else if (auctionEnded) {
      if (isWinner && canClaimNFT) {
        return { text: "You won! Claim your NFT", color: "text-green-400", icon: "🏆" };
      } else if (canExpireAuction) {
        return { text: "Auction expired", color: "text-red-400", icon: "⏰" };
      } else {
        return { text: "Auction ended", color: "text-red-400", icon: "🔥" };
      }
    } else {
      return { text: "Live auction", color: "text-green-400", icon: "🔴" };
    }
  };

  const status = getAuctionStatus();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Auction #{auction.auctionId.toString()}</h1>
            <div className={`flex items-center ${status.color} font-medium`}>
              <span className="mr-2">{status.icon}</span>
              {status.text}
            </div>
          </div>

          {/* Live indicator */}
          {!auctionEnded && auctionStarted && (
            <div className="flex items-center bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-red-400 text-sm font-medium">LIVE</span>
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
            <CountdownTimer endTime={auction.endTime} auctionStarted={Boolean(auctionStarted)} className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10" />

            {/* Current Bid Info */}
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Current Bid</h3>
              {auction.highestBid > BigInt(0) ? (
                <div>
                  <div className="text-3xl font-bold text-white mb-2">{formatEther(auction.highestBid)} ETH</div>
                  <div className="text-sm text-gray-400">
                    by {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                    {isWinner && <span className="text-green-400 ml-2">(You)</span>}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-bold text-gray-400 mb-2">No bids yet</div>
                  <div className="text-sm text-gray-500">Be the first to bid and start the auction!</div>
                </div>
              )}
            </div>

            {/* Auction Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Token ID</div>
                <div className="text-xl font-bold text-white">#{auction.tokenId.toString()}</div>
              </div>
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                <div className="text-sm text-gray-400 mb-1">Auction ID</div>
                <div className="text-xl font-bold text-white">#{auction.auctionId.toString()}</div>
              </div>
            </div>

            {/* Bidding Form */}
            <BidForm
              currentBid={auction.highestBid}
              auctionActive={Boolean(auctionActive)}
              auctionEnded={Boolean(auctionEnded)}
              isWinner={Boolean(isWinner)}
              canClaim={Boolean(canClaimNFT)}
              canExpire={Boolean(canExpireAuction)}
              onBidSuccess={() => {
                refetchAuction();
                setRefreshTrigger((prev) => prev + 1);
              }}
              onClaimSuccess={() => {
                refetchAuction();
                setRefreshTrigger((prev) => prev + 1);
              }}
              onExpireSuccess={() => {
                refetchAuction();
                setRefreshTrigger((prev) => prev + 1);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
