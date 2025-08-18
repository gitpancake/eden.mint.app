"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { formatEther } from "viem";
import { resolveIpfsUriToGateway } from "../../utils/ipfs";

// Types for server response
interface ServerBid {
  bidder: `0x${string}`;
  amount: string; // BigInt as string from server
  timestamp: string; // BigInt as string from server
}

interface ServerAuction {
  auctionId: string;
  tokenId: string;
  startTime: string;
  endTime: string;
  highestBidder: `0x${string}`;
  highestBid: string;
  settled: boolean;
  exists: boolean;
  bids: ServerBid[];
}

interface AuctionHistoryResponse {
  auctions: ServerAuction[];
  totalAuctionIds: number;
  currentAuctionId: string;
  historicalCount: number;
}

// Client-side types (with BigInt)
interface ClientBid {
  bidder: `0x${string}`;
  amount: bigint;
  timestamp: bigint;
}

interface ClientAuction {
  auctionId: bigint;
  tokenId: bigint;
  startTime: bigint;
  endTime: bigint;
  highestBidder: `0x${string}`;
  highestBid: bigint;
  settled: boolean;
  exists: boolean;
  bids: ClientBid[];
}

// NFT Thumbnail component
function NFTThumbnail({ tokenId }: { tokenId: bigint }) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNFTImage = async () => {
      try {
        // Use the API endpoint for metadata
        const metadataUrl = `/api/metadata/${tokenId.toString()}`;

        const response = await fetch(metadataUrl);
        if (response.ok) {
          const metadata = await response.json();
          if (metadata.image) {
            setImageSrc(resolveIpfsUriToGateway(metadata.image));
          } else {
            setImageSrc(""); // Will use fallback
          }
        } else {
          console.warn(`Failed to fetch metadata for token ${tokenId}: ${response.status}`);
          setImageSrc(""); // Will use fallback
        }
      } catch (error) {
        console.error(`Error fetching NFT metadata for token ${tokenId}:`, error);
        setImageSrc(""); // Will use fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTImage();
  }, [tokenId]);

  if (isLoading) {
    return (
      <div className="w-12 h-12 md:w-16 md:h-16 border border-black bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="w-12 h-12 md:w-16 md:h-16 border border-black bg-white overflow-hidden">
      {imageSrc ? (
        <img src={imageSrc} alt={`NFT #${tokenId.toString()}`} className="w-full h-full object-cover" onError={() => setImageSrc("")} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-black">
          <span className="text-[8px] md:text-xs">[ image ]</span>
        </div>
      )}
    </div>
  );
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<AuctionHistoryResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch auction history");
  }
  return response.json();
};

export function AuctionHistory() {
  const [selectedAuction, setSelectedAuction] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(3); // Start with 3 auctions

  // Use SWR for server-side data fetching with caching
  const {
    data: serverData,
    error,
    isLoading: loading,
  } = useSWR<AuctionHistoryResponse>("/api/auction-history", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Convert server data (strings) to client data (BigInt)
  const historicalAuctions: ClientAuction[] =
    serverData?.auctions.map((auction) => ({
      auctionId: BigInt(auction.auctionId),
      tokenId: BigInt(auction.tokenId),
      startTime: BigInt(auction.startTime),
      endTime: BigInt(auction.endTime),
      highestBidder: auction.highestBidder,
      highestBid: BigInt(auction.highestBid),
      settled: auction.settled,
      exists: auction.exists,
      bids: auction.bids.map((bid) => ({
        bidder: bid.bidder,
        amount: BigInt(bid.amount),
        timestamp: BigInt(bid.timestamp),
      })),
    })) || [];

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-4">Error Loading Auctions</h2>
          <p className="font-mono text-sm text-black">Failed to fetch auction data from the server.</p>
          <p className="font-mono text-xs text-black mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white">
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-6">Auction History</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="border border-emerald-200 bg-emerald-50 h-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show "No Auction History" when we have confirmed there are no auctions from the server
  if (!loading && (!historicalAuctions || historicalAuctions.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white text-center">
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-4">No Auction History</h2>
          <p className="font-mono text-sm text-black">No auctions have been completed yet. The first auction will appear here once it&apos;s finished.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="border border-black p-4 md:p-8 bg-white">
        <h2 className="font-mono text-lg md:text-2xl font-bold text-black uppercase tracking-widest mb-4 md:mb-6">Auction History</h2>

        <div className="space-y-3 md:space-y-4">
          {historicalAuctions.slice(0, displayCount).map((auction) => (
            <div key={auction.auctionId.toString()} className="border border-black p-3 md:p-6 bg-white hover:bg-emerald-50 transition-colors">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-center">
                {/* NFT Preview */}
                <div className="flex items-center space-x-2 md:space-x-4 col-span-2 md:col-span-1">
                  <NFTThumbnail tokenId={auction.tokenId} />
                  <div>
                    <div className="font-mono text-xs md:text-sm font-bold text-black uppercase tracking-wide">Auction #{auction.auctionId.toString()}</div>
                  </div>
                </div>

                {/* Winner */}
                <div className="col-span-1">
                  <div className="font-mono text-[10px] md:text-xs text-black mb-1 uppercase tracking-wide">Winner</div>
                  <div className="font-mono text-xs md:text-sm font-bold text-black">
                    {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
                  </div>
                </div>

                {/* Final Bid */}
                <div className="col-span-1">
                  <div className="font-mono text-[10px] md:text-xs text-black mb-1 uppercase tracking-wide">Final Bid</div>
                  <div className="font-mono text-xs md:text-sm font-bold text-emerald-700">{parseFloat(formatEther(auction.highestBid)).toFixed(2)} ETH</div>
                </div>

                {/* End Date */}
                <div className="col-span-2 md:col-span-1">
                  <div className="font-mono text-[10px] md:text-xs text-black mb-1 uppercase tracking-wide">Ended</div>
                  <div className="font-mono text-[10px] md:text-xs text-black">{formatDate(auction.endTime)}</div>
                </div>
              </div>

              {/* Expandable details */}
              <div className="mt-4 pt-4 border-t border-black">
                <button
                  onClick={() => setSelectedAuction(selectedAuction === Number(auction.auctionId) ? null : Number(auction.auctionId))}
                  className="font-mono text-xs font-bold text-black hover:text-emerald-700 uppercase tracking-widest"
                >
                  {selectedAuction === Number(auction.auctionId) ? "Hide" : "View"} Details
                </button>

                {selectedAuction === Number(auction.auctionId) && (
                  <div className="mt-4 space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-mono text-xs text-black uppercase tracking-wide">Started:</span>
                        <span className="ml-2 font-mono text-xs text-black">{formatDate(auction.startTime)}</span>
                      </div>
                      <div>
                        <span className="font-mono text-xs text-black uppercase tracking-wide">Duration:</span>
                        <span className="ml-2 font-mono text-xs text-black">{Math.floor(Number(auction.endTime - auction.startTime) / 60)} minutes</span>
                      </div>
                    </div>

                    {/* Real bid history from contract */}
                    <div>
                      <div className="font-mono text-xs text-black mb-2 uppercase tracking-wide">Bid History ({auction.bids.length} bids):</div>
                      <div className="border border-emerald-200 bg-emerald-50 p-4 space-y-2 max-h-40 overflow-y-auto">
                        {auction.bids
                          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp)) // Most recent first
                          .map((bid, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs text-black">
                                  {bid.bidder.slice(0, 6)}...{bid.bidder.slice(-4)}
                                </span>
                                {bid.bidder === auction.highestBidder && <span className="font-mono text-xs text-emerald-700 font-bold">winner</span>}
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-xs font-bold text-emerald-700">{parseFloat(formatEther(bid.amount)).toFixed(2)} ETH</span>
                                <div className="font-mono text-xs text-black">{formatDate(bid.timestamp)}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* View NFT button */}
                    <div className="pt-2">
                      <a
                        href={`/api/metadata/${auction.tokenId.toString()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-mono text-xs font-bold text-black hover:text-emerald-700 uppercase tracking-widest"
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

        {/* Load more button (if there are more auctions to show) */}
        {historicalAuctions.length > displayCount && (
          <div className="text-center mt-4 md:mt-6">
            <button
              onClick={() => setDisplayCount((prev) => prev + 3)}
              className="bg-black text-white px-4 md:px-6 py-2 md:py-3 font-mono text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors border border-black"
            >
              Load More Auctions
            </button>
          </div>
        )}

        {/* Debug info */}
        {process.env.NODE_ENV === "development" && serverData && (
          <div className="mt-8 p-4 border border-emerald-200 bg-emerald-50">
            <div className="font-mono text-xs text-black mb-2">Debug Info:</div>
            <div className="font-mono text-xs text-black">Total auction IDs: {serverData.totalAuctionIds}</div>
            <div className="font-mono text-xs text-black">Current auction ID: {serverData.currentAuctionId}</div>
            <div className="font-mono text-xs text-black">Historical auctions available: {serverData.historicalCount}</div>
            <div className="font-mono text-xs text-black">
              Historical auctions shown: {Math.min(displayCount, historicalAuctions.length)} / {historicalAuctions.length}
            </div>
            <div className="font-mono text-xs text-black">Using server-side data fetching with SWR caching</div>
          </div>
        )}
      </div>
    </div>
  );
}
