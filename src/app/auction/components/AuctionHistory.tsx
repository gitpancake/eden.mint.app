"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useReadContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG, type Auction } from "../config/contract";

interface HistoricalAuction extends Auction {
  bids?: Array<{
    bidder: string;
    amount: bigint;
    timestamp: bigint;
  }>;
}

export function AuctionHistory() {
  const [selectedAuction, setSelectedAuction] = useState<number | null>(null);
  const [historicalAuctions, setHistoricalAuctions] = useState<HistoricalAuction[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all auction IDs
  const { data: allAuctionIds, isLoading: idsLoading } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "getAllAuctionIds",
  });

  // Fetch auction details for each ID
  useEffect(() => {
    const fetchAuctionHistory = async () => {
      if (!allAuctionIds || allAuctionIds.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const auctions: HistoricalAuction[] = [];

      try {
        // Fetch auction data for each ID (excluding current auction)
        const historicalIds = allAuctionIds.slice(0, -1).reverse(); // Most recent first, excluding current

        for (const auctionId of historicalIds.slice(0, 10)) {
          // Limit to last 10 for performance
          try {
            // This would need to be implemented with a multicall or batch read in a real app
            // For now, we'll simulate the data structure
            const auction: HistoricalAuction = {
              auctionId: auctionId,
              tokenId: auctionId, // Assuming tokenId matches auctionId for simplicity
              startTime: BigInt(Date.now() / 1000 - 86400), // Mock data
              endTime: BigInt(Date.now() / 1000 - 86100),
              highestBidder: "0x742d35Cc6634C0532925a3b8D1B9E7C6F0A1234",
              highestBid: BigInt(Math.floor(Math.random() * 1000000000000000000)), // Random bid
              settled: true,
              exists: true,
            };
            auctions.push(auction);
          } catch (error) {
            console.error(`Error fetching auction ${auctionId}:`, error);
          }
        }

        setHistoricalAuctions(auctions);
      } catch (error) {
        console.error("Error fetching auction history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionHistory();
  }, [allAuctionIds]);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (idsLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Auction History</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 rounded-lg h-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!historicalAuctions || historicalAuctions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-white mb-4">No Auction History</h2>
          <p className="text-gray-400">This is the first auction, or no auctions have been completed yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Auction History</h2>

        <div className="space-y-4">
          {historicalAuctions.map((auction) => (
            <div key={auction.auctionId.toString()} className="bg-black/40 rounded-lg p-6 border border-white/10 hover:border-white/20 transition-colors">
              <div className="grid md:grid-cols-4 gap-4 items-center">
                {/* NFT Preview */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🖼️</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">Auction #{auction.auctionId.toString()}</div>
                    <div className="text-sm text-gray-400">Token #{auction.tokenId.toString()}</div>
                  </div>
                </div>

                {/* Winner */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Winner</div>
                  <div className="font-medium text-white">
                    {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                  </div>
                </div>

                {/* Final Bid */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Final Bid</div>
                  <div className="font-bold text-green-400">{formatEther(auction.highestBid)} ETH</div>
                </div>

                {/* End Date */}
                <div>
                  <div className="text-sm text-gray-400 mb-1">Ended</div>
                  <div className="text-sm text-white">{formatDate(auction.endTime)}</div>
                </div>
              </div>

              {/* Expandable details */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setSelectedAuction(selectedAuction === Number(auction.auctionId) ? null : Number(auction.auctionId))}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                >
                  {selectedAuction === Number(auction.auctionId) ? "Hide" : "View"} Details
                </button>

                {selectedAuction === Number(auction.auctionId) && (
                  <div className="mt-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Started:</span>
                        <span className="ml-2 text-white">{formatDate(auction.startTime)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Duration:</span>
                        <span className="ml-2 text-white">{Math.floor(Number(auction.endTime - auction.startTime) / 60)} minutes</span>
                      </div>
                    </div>

                    {/* Mock bid history */}
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Bid History:</div>
                      <div className="bg-black/30 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">
                            {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                          </span>
                          <span className="text-green-400 font-medium">{formatEther(auction.highestBid)} ETH (Winning bid)</span>
                        </div>
                        {/* Add more mock bids */}
                        <div className="flex justify-between text-sm opacity-60">
                          <span className="text-gray-400">0x123...abc</span>
                          <span className="text-white">{formatEther(auction.highestBid - BigInt(100000000000000000))} ETH</span>
                        </div>
                      </div>
                    </div>

                    {/* View NFT button */}
                    <div className="pt-2">
                      <a
                        href={`${process.env.NEXT_PUBLIC_NFT_BASE_URI || window.location.origin}/${auction.tokenId.toString()}/metadata.json`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        View NFT Metadata →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Load more button (if there are more auctions) */}
        {allAuctionIds && allAuctionIds.length > historicalAuctions.length + 1 && (
          <div className="text-center mt-6">
            <button className="bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-colors">Load More Auctions</button>
          </div>
        )}
      </div>
    </div>
  );
}
