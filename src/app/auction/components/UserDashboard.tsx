"use client";

import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { AUCTION_CONTRACT_CONFIG } from "../config/contract";

interface UserNFT {
  tokenId: number;
  name: string;
  image: string;
  auctionId: number;
  winningBid: bigint;
}

export function UserDashboard() {
  const { address, isConnected } = useAccount();
  const [userNFTs, setUserNFTs] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(true);

  // Get user's ETH balance
  const { data: balance } = useBalance({
    address,
  });

  // Get user's NFT balance
  const { data: nftBalance } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  // Get current auction info to check if user is current highest bidder
  const { data: currentAuction } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "getCurrentAuction",
  });

  const { data: canClaimNFT } = useReadContract({
    ...AUCTION_CONTRACT_CONFIG,
    functionName: "canClaimNFT",
  });

  useEffect(() => {
    // In a real implementation, you would:
    // 1. Query the contract for tokens owned by the user
    // 2. Fetch metadata for each token
    // 3. Match tokens to their winning auctions

    // For now, we'll simulate some data
    const mockUserNFTs: UserNFT[] = [
      {
        tokenId: 1,
        name: "Threshold Portrait",
        image: "https://d14i3advvh2bvd.cloudfront.net/b5f221c09779718dec0034605c0fb76374538a01cc3ee9161f8fb03a0f7007b1.png",
        auctionId: 1,
        winningBid: BigInt("500000000000000000"), // 0.5 ETH
      },
    ];

    // Only show NFTs if user actually has some
    if (nftBalance && nftBalance > 0n) {
      setUserNFTs(mockUserNFTs.slice(0, Number(nftBalance)));
    } else {
      setUserNFTs([]);
    }

    setLoading(false);
  }, [nftBalance]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your NFTs, bids, and auction activity.</p>
        </div>
      </div>
    );
  }

  const isCurrentHighestBidder = currentAuction && address && currentAuction.highestBidder.toLowerCase() === address.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Account Overview */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h2 className="text-2xl font-bold text-white mb-6">Account Overview</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ETH Balance */}
          <div className="bg-black/40 rounded-lg p-6 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">ETH Balance</div>
            <div className="text-2xl font-bold text-white">{balance ? formatEther(balance.value) : "0.00"} ETH</div>
            <div className="text-xs text-gray-500 mt-1">
              {balance?.formatted} {balance?.symbol}
            </div>
          </div>

          {/* NFTs Owned */}
          <div className="bg-black/40 rounded-lg p-6 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">NFTs Owned</div>
            <div className="text-2xl font-bold text-white">{nftBalance?.toString() || "0"}</div>
            <div className="text-xs text-gray-500 mt-1">Auction NFTs</div>
          </div>

          {/* Current Status */}
          <div className="bg-black/40 rounded-lg p-6 border border-white/10">
            <div className="text-sm text-gray-400 mb-2">Current Status</div>
            <div className="text-lg font-bold">
              {canClaimNFT ? (
                <span className="text-green-400">🏆 Can Claim NFT</span>
              ) : isCurrentHighestBidder ? (
                <span className="text-blue-400">🔥 Highest Bidder</span>
              ) : (
                <span className="text-gray-400">👀 Watching</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Auction Status */}
      {(isCurrentHighestBidder || canClaimNFT) && (
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30">
          <h3 className="text-xl font-bold text-white mb-4">🎯 Active Participation</h3>

          {canClaimNFT && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-400 font-semibold">🏆 You Won!</div>
                  <div className="text-sm text-gray-300 mt-1">You can claim your NFT from the current auction</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">{currentAuction ? formatEther(currentAuction.highestBid) : "0"} ETH</div>
                  <div className="text-xs text-gray-400">Winning bid</div>
                </div>
              </div>
            </div>
          )}

          {isCurrentHighestBidder && !canClaimNFT && (
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-blue-400 font-semibold">🔥 Highest Bidder</div>
                  <div className="text-sm text-gray-300 mt-1">You're currently winning the auction!</div>
                </div>
                <div className="text-right">
                  <div className="text-blue-400 font-bold">{currentAuction ? formatEther(currentAuction.highestBid) : "0"} ETH</div>
                  <div className="text-xs text-gray-400">Your bid</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Owned NFTs */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Your NFT Collection</h3>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : userNFTs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userNFTs.map((nft) => (
              <div key={nft.tokenId} className="bg-black/40 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
                <div className="aspect-square bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjEyIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+Cg==";
                    }}
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-1">{nft.name}</h4>
                  <div className="text-sm text-gray-400 mb-2">Token #{nft.tokenId}</div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-500">Won for</div>
                      <div className="text-green-400 font-semibold">{formatEther(nft.winningBid)} ETH</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Auction</div>
                      <div className="text-white">#{nft.auctionId}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎨</div>
            <h4 className="text-xl font-bold text-white mb-2">No NFTs Yet</h4>
            <p className="text-gray-400 mb-6">Win an auction to add NFTs to your collection!</p>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // This would switch to the auction tab in the parent component
                window.dispatchEvent(new CustomEvent("switchTab", { detail: "auction" }));
              }}
              className="inline-flex items-center bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              View Current Auction →
            </a>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

        <div className="space-y-4">
          {/* Mock transaction history */}
          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">🏆</span>
              </div>
              <div>
                <div className="text-white font-medium">Won Auction #1</div>
                <div className="text-sm text-gray-400">2 days ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-green-400 font-semibold">+1 NFT</div>
              <div className="text-xs text-gray-400">0.5 ETH</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-sm">💎</span>
              </div>
              <div>
                <div className="text-white font-medium">Placed Bid</div>
                <div className="text-sm text-gray-400">3 days ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-blue-400 font-semibold">0.3 ETH</div>
              <div className="text-xs text-gray-400">Outbid & refunded</div>
            </div>
          </div>

          <div className="text-center py-4">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">View All Activity →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
