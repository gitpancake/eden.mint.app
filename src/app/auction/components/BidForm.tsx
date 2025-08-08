"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useAccount, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface BidFormProps {
  currentBid: bigint;
  auctionActive: boolean;
  auctionEnded: boolean;
  isWinner: boolean;
  canSettle: boolean;
  onBidSuccess?: () => void;
  onSettleSuccess?: () => void;
}

export function BidForm({ currentBid, auctionActive, auctionEnded, isWinner, canSettle, onBidSuccess, onSettleSuccess }: BidFormProps) {
  const { isConnected } = useAccount();
  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Calculate minimum bid (current bid + 0.001 ETH)
  const minBidIncrement = parseEther("0.001");
  const minBid = currentBid + minBidIncrement;
  const minBidFormatted = formatEther(minBid);

  const handlePlaceBid = async () => {
    if (!bidAmount || !isConnected) return;

    try {
      setIsSubmitting(true);
      const bidValue = parseEther(bidAmount);

      if (bidValue <= currentBid) {
        alert(`Bid must be higher than ${formatEther(currentBid)} ETH`);
        return;
      }

      await writeContract({
        ...AUCTION_CONTRACT_CONFIG,
        functionName: "placeBid",
        value: bidValue,
      });

      // Reset form on successful submission
      setBidAmount("");
      onBidSuccess?.();
    } catch (err) {
      console.error("Error placing bid:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettleAuction = async () => {
    if (!isConnected) return;

    try {
      setIsSubmitting(true);
      await writeContract({
        ...AUCTION_CONTRACT_CONFIG,
        functionName: "settleAuction",
      });
      onSettleSuccess?.();
    } catch (err) {
      console.error("Error settling auction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="border border-black p-6 bg-white">
        <div className="text-center">
          <div className="font-mono text-sm text-black mb-4 uppercase tracking-wide">Connect your wallet to participate in the auction</div>
          <div className="font-mono text-xs text-black">You&apos;ll need ETH to place bids</div>
        </div>
      </div>
    );
  }

  if (!auctionActive) {
    return (
      <div className="border border-black p-6 bg-white">
        <div className="text-center font-mono text-sm text-black uppercase tracking-wide">No active auction</div>
      </div>
    );
  }

  // Show settle button if auction can be settled
  if (canSettle) {
    return (
      <div className="border border-black p-6 bg-white">
        <div className="text-center mb-4">
          <div className="font-mono text-xl font-bold text-black mb-2 uppercase tracking-widest">Auction Ready to Settle</div>
          <div className="font-mono text-xs text-black mb-4 uppercase tracking-wide">This auction has ended and can be settled. Anyone can trigger settlement.</div>
        </div>

        <button
          onClick={handleSettleAuction}
          disabled={isSubmitting || isPending || isConfirming}
          className="w-full bg-black text-white py-4 px-6 font-mono text-sm font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-black"
        >
          {isSubmitting || isPending || isConfirming ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isPending ? "Confirm in wallet..." : isConfirming ? "Settling..." : "Processing..."}
            </div>
          ) : (
            "⚡ Settle Auction & Start Next"
          )}
        </button>
      </div>
    );
  }

  // Show auction ended message for non-winners
  if (auctionEnded) {
    return (
      <div className="border border-black p-6 bg-white">
        <div className="text-center">
          <div className="font-mono text-xl font-bold text-black mb-2 uppercase tracking-widest">Auction Ended</div>
          <div className="font-mono text-xs text-black uppercase tracking-wide">Waiting for settlement</div>
        </div>
      </div>
    );
  }

  // Main bidding form
  return (
    <div className="border border-black p-6 bg-white">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-mono text-xs text-black font-bold uppercase tracking-widest">Your Bid (ETH)</label>
          <div className="font-mono text-xs text-black">Min: {minBidFormatted} ETH</div>
        </div>

        <div className="relative">
          <input
            type="number"
            step="0.001"
            min={minBidFormatted}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Minimum ${minBidFormatted} ETH`}
            className="w-full bg-white border border-black px-4 py-3 font-mono text-black placeholder-gray-500 focus:border-emerald-700 focus:outline-none"
            disabled={isSubmitting || isPending || isConfirming}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 font-mono text-xs text-black">ETH</div>
        </div>
      </div>

      {/* Current bid info */}
      {currentBid > BigInt(0) && (
        <div className="mb-4 p-3 border border-emerald-200 bg-emerald-50">
          <div className="font-mono text-xs text-black">
            Current highest bid: <span className="font-bold">{formatEther(currentBid)} ETH</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 border border-black bg-white">
          <div className="font-mono text-xs text-black">{error.message || "Transaction failed"}</div>
        </div>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className="mb-4 p-3 border border-emerald-200 bg-emerald-50">
          <div className="font-mono text-xs text-emerald-700">Transaction successful! 🎉</div>
        </div>
      )}

      <button
        onClick={handlePlaceBid}
        disabled={!bidAmount || isSubmitting || isPending || isConfirming || parseFloat(bidAmount) < parseFloat(minBidFormatted)}
        className="w-full bg-black text-white py-4 px-6 font-mono text-sm font-bold uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-black"
      >
        {isSubmitting || isPending || isConfirming ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {isPending ? "Confirm in wallet..." : isConfirming ? "Placing bid..." : "Processing..."}
          </div>
        ) : currentBid === BigInt(0) ? (
          "🚀 Place First Bid"
        ) : (
          "💎 Place Bid"
        )}
      </button>

      <div className="mt-4 font-mono text-xs text-black text-center">
        <div>💡 Previous bidders are automatically refunded when outbid</div>
        <div className="mt-1">🔒 Your funds are safe - no manual claims needed</div>
      </div>
    </div>
  );
}
