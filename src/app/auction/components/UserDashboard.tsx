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
    if (nftBalance && nftBalance > BigInt(0)) {
      setUserNFTs(mockUserNFTs.slice(0, Number(nftBalance)));
    } else {
      setUserNFTs([]);
    }

    setLoading(false);
  }, [nftBalance]);

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-8 bg-white text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-4">Connect Your Wallet</h2>
          <p className="font-mono text-sm text-black">Connect your wallet to view your NFTs, bids, and auction activity.</p>
        </div>
      </div>
    );
  }

  const isCurrentHighestBidder = currentAuction && address && currentAuction.highestBidder.toLowerCase() === address.toLowerCase();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Account Overview */}
      <div className="border border-black p-8 bg-white">
        <h2 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-6">Account Overview</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* ETH Balance */}
          <div className="border border-emerald-200 bg-emerald-50 p-6">
            <div className="font-mono text-xs text-black mb-2 uppercase tracking-wide">ETH Balance</div>
            <div className="font-mono text-2xl font-bold text-black">{balance ? formatEther(balance.value) : "0.00"} ETH</div>
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

          {/* Current Status */}
          <div className="border border-emerald-200 bg-emerald-50 p-6">
            <div className="font-mono text-xs text-black mb-2 uppercase tracking-wide">Current Status</div>
            <div className="font-mono text-lg font-bold">
              {canClaimNFT ? (
                <span className="text-emerald-700">🏆 Can Claim NFT</span>
              ) : isCurrentHighestBidder ? (
                <span className="text-black">🔥 Highest Bidder</span>
              ) : (
                <span className="text-black">👀 Watching</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Auction Status */}
      {(isCurrentHighestBidder || canClaimNFT) && (
        <div className="border border-black p-8 bg-white">
          <h3 className="font-mono text-xl font-bold text-black uppercase tracking-widest mb-4">🎯 Active Participation</h3>

          {canClaimNFT && (
            <div className="border border-emerald-200 bg-emerald-50 p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-emerald-700 uppercase tracking-wide">🏆 You Won!</div>
                  <div className="font-mono text-xs text-black mt-1">You can claim your NFT from the current auction</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-emerald-700">{currentAuction ? formatEther(currentAuction.highestBid) : "0"} ETH</div>
                  <div className="font-mono text-xs text-black">Winning bid</div>
                </div>
              </div>
            </div>
          )}

          {isCurrentHighestBidder && !canClaimNFT && (
            <div className="border border-black bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-black uppercase tracking-wide">🔥 Highest Bidder</div>
                  <div className="font-mono text-xs text-black mt-1">You&apos;re currently winning the auction!</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-black">{currentAuction ? formatEther(currentAuction.highestBid) : "0"} ETH</div>
                  <div className="font-mono text-xs text-black">Your bid</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
            <div className="text-6xl mb-4">🎨</div>
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

        <div className="space-y-4">
          {/* Mock transaction history */}
          <div className="flex items-center justify-between py-3 border-b border-black">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border border-emerald-200 bg-emerald-50 flex items-center justify-center">
                <span className="text-emerald-700 text-sm">🏆</span>
              </div>
              <div>
                <div className="font-mono font-bold text-black uppercase tracking-wide">Won Auction #1</div>
                <div className="font-mono text-xs text-black">2 days ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-emerald-700">+1 NFT</div>
              <div className="font-mono text-xs text-black">0.5 ETH</div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-black">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border border-black bg-white flex items-center justify-center">
                <span className="text-black text-sm">💎</span>
              </div>
              <div>
                <div className="font-mono font-bold text-black uppercase tracking-wide">Placed Bid</div>
                <div className="font-mono text-xs text-black">3 days ago</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-black">0.3 ETH</div>
              <div className="font-mono text-xs text-black">Outbid & refunded</div>
            </div>
          </div>

          <div className="text-center py-4">
            <button className="font-mono text-xs font-bold text-black hover:text-emerald-700 uppercase tracking-widest">View All Activity →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
