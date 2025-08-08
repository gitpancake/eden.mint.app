"use client";

import { useState } from "react";
import useSWR from "swr";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useAuctionEvents } from "../hooks/useAuctionEvents";

// Types for server response
interface ServerUserNFT {
  tokenId: string;
  name: string;
  image: string;
  auctionId: string;
  winningBid: string; // BigInt as string from server
}

interface UserDashboardResponse {
  userAddress: string;
  balance: {
    value: string;
    formatted: string;
    symbol: string;
  };
  nftBalance: string;
  userNFTs: ServerUserNFT[];
  recentActivity?: Array<{
    type: "bid" | "won" | "outbid";
    auctionId: string;
    tokenId: string;
    amount?: string;
    timestamp: string;
    note?: string;
  }>;
}

// Client-side types (with BigInt)
interface ClientUserNFT {
  tokenId: number;
  name: string;
  image: string;
  auctionId: number;
  winningBid: bigint;
}

// Fetcher function for SWR
const fetcher = async (url: string): Promise<UserDashboardResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
};

export function UserDashboard() {
  const { address, isConnected } = useAccount();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Use SWR for server-side data fetching with caching
  const {
    data: serverData,
    error,
    isLoading: loading,
    mutate,
  } = useSWR<UserDashboardResponse>(address ? `/api/user-dashboard?address=${address}&refresh=${refreshTrigger}` : null, fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  // Event-driven refresh for immediate updates when the user bids, is outbid, or wins
  useAuctionEvents({
    onBidPlaced: ({ bidder }) => {
      if (address && bidder.toLowerCase() === address.toLowerCase()) mutate();
    },
    onBidRefunded: ({ bidder }) => {
      if (address && bidder.toLowerCase() === address.toLowerCase()) mutate();
    },
    onAuctionSettled: ({ winner }) => {
      if (address && winner.toLowerCase() === address.toLowerCase()) mutate();
    },
  });

  // Convert server data to client data
  const balance = serverData
    ? {
        value: BigInt(serverData.balance.value),
        formatted: serverData.balance.formatted,
        symbol: serverData.balance.symbol,
      }
    : null;

  const nftBalance = serverData ? BigInt(serverData.nftBalance) : BigInt(0);

  const userNFTs: ClientUserNFT[] =
    serverData?.userNFTs.map((nft) => ({
      tokenId: parseInt(nft.tokenId),
      name: nft.name,
      image: nft.image,
      auctionId: parseInt(nft.auctionId),
      winningBid: BigInt(nft.winningBid),
    })) || [];

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white text-center">
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-4">Connect Your Wallet</h2>
          <p className="font-mono text-sm text-black">Connect your wallet to view your NFTs, bids, and auction activity.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white text-center">
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-4">Error Loading Dashboard</h2>
          <p className="font-mono text-sm text-black">Failed to fetch dashboard data from the server.</p>
          <p className="font-mono text-xs text-black mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
          <button
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="mt-4 bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors border border-black"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Account overview skeleton */}
        <div className="border border-black p-8 bg-white">
          <div className="animate-pulse">
            <div className="h-8 border border-emerald-200 bg-emerald-50 w-1/3 mb-6"></div>
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-emerald-200 bg-emerald-50 p-6">
                  <div className="h-4 border border-emerald-200 bg-emerald-50 w-1/2 mb-2"></div>
                  <div className="h-8 border border-emerald-200 bg-emerald-50 w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Owned NFTs skeleton */}
        <div className="border border-black p-8 bg-white">
          <div className="h-6 border border-emerald-200 bg-emerald-50 w-1/2 mb-6 animate-pulse"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-emerald-200 bg-emerald-50 p-6 animate-pulse">
                <div className="aspect-square border border-emerald-200 bg-emerald-50 mb-4"></div>
                <div className="h-4 border border-emerald-200 bg-emerald-50 mb-2"></div>
                <div className="h-3 border border-emerald-200 bg-emerald-50 w-2/3"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent activity skeleton */}
        <div className="border border-black p-8 bg-white">
          <div className="h-6 border border-emerald-200 bg-emerald-50 w-1/3 mb-4 animate-pulse"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-10 border border-emerald-200 bg-emerald-50 mb-2 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Account Overview */}
      <div className="border border-black p-8 bg-white">
        <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-6">Account Overview</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ETH Balance */}
          <div className="border border-emerald-200 bg-emerald-50 p-6">
            <div className="font-mono text-xs text-black mb-2 uppercase tracking-wide">ETH Balance</div>
            <div className="font-mono text-2xl font-bold text-black">{balance ? parseFloat(formatEther(balance.value)).toFixed(2) : "0.00"} ETH</div>
            <div className="font-mono text-xs text-black mt-1">
              {balance?.formatted} {balance?.symbol}
            </div>
          </div>

          {/* NFTs Owned */}
          <div className="border border-emerald-200 bg-emerald-50 p-6">
            <div className="font-mono text-xs text-black mb-2 uppercase tracking-wide">NFTs Owned</div>
            <div className="font-mono text-2xl font-bold text-black">{nftBalance?.toString() || "0"}</div>
            <div className="font-mono text-xs text-black mt-1">Auction NFTs</div>
          </div>
        </div>
      </div>

      {/* Owned NFTs */}
      <div className="border border-black p-8 bg-white">
        <h3 className="font-mono text-xl font-bold text-black uppercase tracking-widest mb-6">Your NFT Collection</h3>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square border border-emerald-200 bg-emerald-50 mb-4"></div>
                <div className="h-4 border border-emerald-200 bg-emerald-50 mb-2"></div>
                <div className="h-3 border border-emerald-200 bg-emerald-50 w-2/3"></div>
              </div>
            ))}
          </div>
        ) : userNFTs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNFTs.map((nft) => (
              <div key={nft.tokenId} className="border border-black p-4 bg-white hover:bg-emerald-50 transition-colors">
                <div className="aspect-square border border-black bg-white overflow-hidden mb-4">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmZmZmZmIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjMDAwMDAwIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg==";
                    }}
                  />
                </div>

                <div>
                  <h4 className="font-mono font-bold text-black mb-1 uppercase tracking-wide">{nft.name}</h4>
                  <div className="font-mono text-xs text-black mb-2">Token #{nft.tokenId}</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-mono text-xs text-black uppercase tracking-wide">Won for</div>
                      <div className="font-mono text-sm font-bold text-emerald-700">{formatEther(nft.winningBid)} ETH</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-black uppercase tracking-wide">Auction</div>
                      <div className="font-mono text-sm font-bold text-black">#{nft.auctionId}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h4 className="font-mono text-xl font-bold text-black uppercase tracking-widest mb-2">No NFTs Yet</h4>
            <p className="font-mono text-sm text-black mb-6">Win an auction to add NFTs to your collection!</p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // This would switch to the auction tab in the parent component
                window.dispatchEvent(new CustomEvent("switchTab", { detail: "auction" }));
              }}
              className="inline-flex items-center bg-black text-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors border border-black"
            >
              View Current Auction →
            </a>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="border border-black p-8 bg-white">
        <h3 className="font-mono text-xl font-bold text-black uppercase tracking-widest mb-6">Recent Activity</h3>

        <div className="space-y-2">
          {(serverData?.recentActivity || []).length === 0 && <div className="font-mono text-xs text-black">No recent activity.</div>}

          {(serverData?.recentActivity || []).map((evt, idx) => {
            const amount = evt.amount ? `${formatEther(BigInt(evt.amount))} ETH` : "";
            const ts = new Date(Number(evt.timestamp) * (evt.timestamp.length > 10 ? 1 : 1000)).toLocaleString();
            const left = evt.type === "won" ? `Won auction #${evt.auctionId}` : evt.type === "outbid" ? `Outbid on auction #${evt.auctionId}` : `Bid placed on auction #${evt.auctionId}`;
            const right = evt.type === "won" ? `+1 NFT · ${amount}` : amount || evt.note || "";
            return (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-black">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="font-mono font-bold text-black uppercase tracking-wide">{left}</div>
                    <div className="font-mono text-xs text-black">{ts}</div>
                  </div>
                </div>
                <div className="text-right">{right && <div className="font-mono text-xs text-black">{right}</div>}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
