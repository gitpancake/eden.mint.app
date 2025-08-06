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
  canClaim: boolean;
  canExpire: boolean;
  onBidSuccess?: () => void;
  onClaimSuccess?: () => void;
  onExpireSuccess?: () => void;
}

export function BidForm({ currentBid, auctionActive, auctionEnded, isWinner, canClaim, canExpire, onBidSuccess, onClaimSuccess, onExpireSuccess }: BidFormProps) {
  const { address, isConnected } = useAccount();
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

  const handleClaimNFT = async () => {
    if (!isConnected) return;

    try {
      setIsSubmitting(true);
      await writeContract({
        ...AUCTION_CONTRACT_CONFIG,
        functionName: "claimNFT",
      });
      onClaimSuccess?.();
    } catch (err) {
      console.error("Error claiming NFT:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExpireAuction = async () => {
    if (!isConnected) return;

    try {
      setIsSubmitting(true);
      await writeContract({
        ...AUCTION_CONTRACT_CONFIG,
        functionName: "expireAuction",
      });
      onExpireSuccess?.();
    } catch (err) {
      console.error("Error expiring auction:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center">
          <div className="text-gray-400 mb-4">Connect your wallet to participate in the auction</div>
                      <div className="text-sm text-gray-500">You&apos;ll need ETH on Base Sepolia to place bids</div>
        </div>
      </div>
    );
  }

  if (!auctionActive) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center text-gray-400">No active auction</div>
      </div>
    );
  }

  // Show claim button for winner
  if (auctionEnded && isWinner && canClaim) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center mb-4">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-xl font-bold text-green-400 mb-2">Congratulations! You won!</div>
          <div className="text-gray-400 text-sm mb-4">Claim your NFT to mint it and start the next auction</div>
        </div>

        <button
          onClick={handleClaimNFT}
          disabled={isSubmitting || isPending || isConfirming}
          className="w-full bg-green-500 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || isPending || isConfirming ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              {isPending ? "Confirm in wallet..." : isConfirming ? "Claiming..." : "Processing..."}
            </div>
          ) : (
            "🏆 Claim NFT & Start Next Auction"
          )}
        </button>
      </div>
    );
  }

  // Show expire button if auction can be expired
  if (canExpire) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center mb-4">
          <div className="text-xl font-bold text-yellow-400 mb-2">Auction Expired</div>
          <div className="text-gray-400 text-sm mb-4">No bids were placed. Anyone can expire this auction to start the next one.</div>
        </div>

        <button
          onClick={handleExpireAuction}
          disabled={isSubmitting || isPending || isConfirming}
          className="w-full bg-yellow-500 text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting || isPending || isConfirming ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
              {isPending ? "Confirm in wallet..." : isConfirming ? "Expiring..." : "Processing..."}
            </div>
          ) : (
            "⏰ Expire Auction & Start Next"
          )}
        </button>
      </div>
    );
  }

  // Show auction ended message for non-winners
  if (auctionEnded) {
    return (
      <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
        <div className="text-center">
          <div className="text-xl font-bold text-red-400 mb-2">Auction Ended</div>
          <div className="text-gray-400 text-sm">Waiting for winner to claim NFT and start next auction</div>
        </div>
      </div>
    );
  }

  // Main bidding form
  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="text-white font-medium">Your Bid (ETH)</label>
          <div className="text-sm text-gray-400">Min: {minBidFormatted} ETH</div>
        </div>

        <div className="relative">
          <input
            type="number"
            step="0.001"
            min={minBidFormatted}
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Minimum ${minBidFormatted} ETH`}
            className="w-full bg-black/50 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-white/40 focus:outline-none"
            disabled={isSubmitting || isPending || isConfirming}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">ETH</div>
        </div>
      </div>

      {/* Current bid info */}
      {currentBid > 0n && (
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="text-sm text-blue-400">
            Current highest bid: <span className="font-semibold">{formatEther(currentBid)} ETH</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="text-sm text-red-400">{error.message || "Transaction failed"}</div>
        </div>
      )}

      {/* Success message */}
      {isSuccess && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="text-sm text-green-400">Transaction successful! 🎉</div>
        </div>
      )}

      <button
        onClick={handlePlaceBid}
        disabled={!bidAmount || isSubmitting || isPending || isConfirming || parseFloat(bidAmount) < parseFloat(minBidFormatted)}
        className="w-full bg-white text-black py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting || isPending || isConfirming ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
            {isPending ? "Confirm in wallet..." : isConfirming ? "Placing bid..." : "Processing..."}
          </div>
        ) : (
          "💎 Place Bid"
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        <div>💡 Previous bidders are automatically refunded when outbid</div>
        <div className="mt-1">🔒 Your funds are safe - no manual claims needed</div>
      </div>
    </div>
  );
}
