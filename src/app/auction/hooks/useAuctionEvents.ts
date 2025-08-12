"use client";

import { formatEther } from "viem";
import { useAccount, useWatchContractEvent } from "wagmi";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface UseAuctionEventsProps {
  onBidPlaced?: (data: { bidder: string; amount: bigint; auctionId: bigint }) => void;
  onBidRefunded?: (data: { bidder: string; amount: bigint; auctionId: bigint }) => void;
  onAuctionSettled?: (data: { winner: string; amount: bigint; tokenId: bigint; auctionId: bigint }) => void;
  onAuctionStarted?: (data: { auctionId: bigint; tokenId: bigint; endTime: bigint }) => void;
  onRestScheduled?: (data: { nextAuctionEarliestStartTime: bigint }) => void;
  onAuctionDurationUpdated?: (data: { newDuration: bigint }) => void;
  onRestDurationUpdated?: (data: { newDuration: bigint }) => void;
  onAuctionsCompleted?: () => void;
}

export function useAuctionEvents({
  onBidPlaced,
  onBidRefunded,
  onAuctionSettled,
  onAuctionStarted,
  onRestScheduled,
  onAuctionDurationUpdated,
  onRestDurationUpdated,
  onAuctionsCompleted,
}: UseAuctionEventsProps = {}) {
  const { address } = useAccount();

  // Watch for bid placed events
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "BidPlaced",
    onLogs(logs) {
      logs.forEach((log) => {
        const { auctionId, bidder, amount } = log.args;
        if (auctionId && bidder && amount) {
          onBidPlaced?.({ bidder, amount, auctionId });

          if (address && bidder.toLowerCase() === address.toLowerCase()) {
            console.log(`Your bid of ${formatEther(amount)} ETH was placed successfully.`);
          }
        }
      });
    },
  });

  // Watch for bid refunded events
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "BidRefunded",
    onLogs(logs) {
      logs.forEach((log) => {
        const { auctionId, bidder, amount } = log.args;
        if (auctionId && bidder && amount) {
          onBidRefunded?.({ bidder, amount, auctionId });

          if (address && bidder.toLowerCase() === address.toLowerCase()) {
            console.log(`Your bid of ${formatEther(amount)} ETH was refunded (outbid).`);
          }
        }
      });
    },
  });

  // Watch for auction settled events
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionSettled",
    onLogs(logs) {
      logs.forEach((log) => {
        const { auctionId, winner, amount, tokenId } = log.args;
        if (auctionId && winner && amount && tokenId) {
          onAuctionSettled?.({ winner, amount, tokenId, auctionId });

          if (address && winner.toLowerCase() === address.toLowerCase()) {
            console.log(`You won auction #${auctionId.toString()} for ${formatEther(amount)} ETH.`);
          }
        }
      });
    },
  });

  // Watch for new auction started events
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionStarted",
    onLogs(logs) {
      logs.forEach((log) => {
        const { auctionId, tokenId, endTime } = log.args;
        if (auctionId && tokenId && endTime) {
          onAuctionStarted?.({ auctionId, tokenId, endTime });
          console.log(`New auction #${auctionId.toString()} started for Token #${tokenId.toString()}.`);
        }
      });
    },
  });

  // Rest scheduled
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "RestScheduled",
    onLogs(logs) {
      logs.forEach((log) => {
        const { nextAuctionEarliestStartTime } = log.args as { nextAuctionEarliestStartTime: bigint };
        if (nextAuctionEarliestStartTime) {
          onRestScheduled?.({ nextAuctionEarliestStartTime });
          console.log(`Rest scheduled. Next auction earliest start at ${nextAuctionEarliestStartTime.toString()}.`);
        }
      });
    },
  });

  // Auctions completed
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionsCompleted",
    onLogs() {
      onAuctionsCompleted?.();
      console.log("All auctions completed.");
    },
  });

  // Durations updated
  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "AuctionDurationUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        const { newDuration } = log.args as { newDuration: bigint };
        if (newDuration) onAuctionDurationUpdated?.({ newDuration });
      });
    },
  });

  useWatchContractEvent({
    ...AUCTION_CONTRACT_CONFIG,
    eventName: "RestDurationUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        const { newDuration } = log.args as { newDuration: bigint };
        if (newDuration) onRestDurationUpdated?.({ newDuration });
      });
    },
  });
}

// Enhanced hook with notifications
export function useAuctionEventsWithNotifications(addNotification?: (notification: { type: "success" | "error" | "info" | "warning"; title: string; message: string; duration?: number }) => void) {
  const { address } = useAccount();

  return useAuctionEvents({
    onBidPlaced: ({ bidder, amount }) => {
      if (address && bidder.toLowerCase() === address.toLowerCase()) {
        addNotification?.({
          type: "success",
          title: "Bid Placed Successfully",
          message: `Your bid of ${formatEther(amount)} ETH is now the highest bid.`,
          duration: 5000,
        });
      } else {
        addNotification?.({
          type: "info",
          title: "New Bid Placed",
          message: `Someone bid ${formatEther(amount)} ETH. The auction is heating up!`,
          duration: 4000,
        });
      }
    },

    onBidRefunded: ({ bidder, amount }) => {
      if (address && bidder.toLowerCase() === address.toLowerCase()) {
        addNotification?.({
          type: "warning",
          title: "You've Been Outbid",
          message: `Your ${formatEther(amount)} ETH bid was refunded. Place a higher bid to win!`,
          duration: 6000,
        });
      }
    },

    onAuctionSettled: ({ winner, amount, tokenId }) => {
      if (address && winner.toLowerCase() === address.toLowerCase()) {
        addNotification?.({
          type: "success",
          title: "Congratulations! You Won",
          message: `You won Token #${tokenId.toString()} for ${formatEther(amount)} ETH.`,
          duration: 8000,
        });
      } else {
        addNotification?.({
          type: "info",
          title: "Auction Ended",
          message: `Token #${tokenId.toString()} sold for ${formatEther(amount)} ETH.`,
          duration: 5000,
        });
      }
    },

    onAuctionStarted: ({ auctionId, tokenId }) => {
      addNotification?.({
        type: "info",
        title: "New Auction Started",
        message: `Auction #${auctionId.toString()} for Token #${tokenId.toString()} is now live!`,
        duration: 5000,
      });
    },
  });
}
