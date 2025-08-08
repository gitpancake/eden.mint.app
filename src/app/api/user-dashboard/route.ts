import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { AUCTION_CONTRACT_CONFIG } from "../../auction/config/contract";

// Create a reusable client for contract calls
const client = createPublicClient({
  chain: {
    ...baseSepolia,
    rpcUrls: {
      default: {
        http: [process.env.NEXT_PUBLIC_RPC_URL!],
      },
      public: {
        http: [process.env.NEXT_PUBLIC_RPC_URL!],
      },
    },
  },
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("address");

    if (!userAddress) {
      return NextResponse.json({ error: "Address parameter required" }, { status: 400 });
    }

    console.log(`Fetching dashboard data for user: ${userAddress}`);

    // Get user's ETH balance
    const balance = await client.getBalance({
      address: userAddress as `0x${string}`,
    });

    // Get user's NFT balance
    const nftBalance = (await readContract(client, {
      address: AUCTION_CONTRACT_CONFIG.address,
      abi: AUCTION_CONTRACT_CONFIG.abi,
      functionName: "balanceOf",
      args: [userAddress as `0x${string}`],
    })) as bigint;

    // Fetch actual NFTs owned by the user
    const userNFTs = [];
    const recentActivity: Array<{
      type: "bid" | "won" | "outbid";
      auctionId: string;
      tokenId: string;
      amount?: string;
      timestamp: string;
      note?: string;
    }> = [];

    if (nftBalance > BigInt(0)) {
      console.log(`User has ${nftBalance} NFTs, fetching token details...`);

      // Get all auction IDs (limit to most recent N for activity)
      const allAuctionIds = (await readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "getAllAuctionIds",
      })) as bigint[];

      const recentIds = allAuctionIds.slice(-50); // limit server work

      // For each auction, check if this user was the winner and collect bid activity
      for (const auctionId of recentIds) {
        try {
          // Get auction data
          const auctionResult = await readContract(client, {
            address: AUCTION_CONTRACT_CONFIG.address,
            abi: AUCTION_CONTRACT_CONFIG.abi,
            functionName: "auctions",
            args: [auctionId],
          });
          const auctionData = auctionResult as unknown as [bigint, bigint, bigint, bigint, `0x${string}`, bigint, boolean, boolean];

          const [, tokenId, , , highestBidder, highestBid, settled] = auctionData;

          // Check if this user won this auction and it's settled
          if (settled && highestBidder.toLowerCase() === userAddress.toLowerCase()) {
            console.log(`User won auction ${auctionId} for token ${tokenId}`);

            // Fetch NFT metadata using the same format as auction components
            try {
              const baseURI = process.env.NEXT_PUBLIC_NFT_BASE_URI || "http://localhost:3000";
              const metadataUrl = `${baseURI}/${tokenId.toString()}/metadata.json`;

              const metadataResponse = await fetch(metadataUrl);
              let metadata = null;

              if (metadataResponse.ok) {
                metadata = await metadataResponse.json();
              }

              userNFTs.push({
                tokenId: tokenId.toString(),
                name: metadata?.name || `Auction NFT #${tokenId}`,
                image: metadata?.image || `${baseURI}/${tokenId.toString()}/image.png`,
                auctionId: auctionId.toString(),
                winningBid: highestBid.toString(),
              });
            } catch (metadataError) {
              console.error(`Error fetching metadata for token ${tokenId}:`, metadataError);
              // Add NFT with basic info even if metadata fetch fails
              const baseURI = process.env.NEXT_PUBLIC_NFT_BASE_URI || "http://localhost:3000";
              userNFTs.push({
                tokenId: tokenId.toString(),
                name: `Auction NFT #${tokenId}`,
                image: `${baseURI}/${tokenId.toString()}/image.png`,
                auctionId: auctionId.toString(),
                winningBid: highestBid.toString(),
              });
            }

            // Add win activity
            recentActivity.push({
              type: "won",
              auctionId: auctionId.toString(),
              tokenId: tokenId.toString(),
              amount: highestBid.toString(),
              timestamp: Date.now().toString(), // approximate; could use endTime if needed
              note: "Auction settled: NFT minted",
            });
          }

          // Fetch bids for this auction and record user bids/outbids
          const bidsData = (await readContract(client, {
            address: AUCTION_CONTRACT_CONFIG.address,
            abi: AUCTION_CONTRACT_CONFIG.abi,
            functionName: "getAuctionBids",
            args: [auctionId],
          })) as Array<{ bidder: `0x${string}`; amount: bigint; timestamp: bigint }>;
          // De-duplicate by timestamp+amount for cleaner feed
          const userBids = bidsData.filter((b) => b.bidder.toLowerCase() === userAddress.toLowerCase());
          const seen = new Set<string>();
          userBids.forEach((b) => {
            const key = `${auctionId.toString()}-${b.timestamp.toString()}-${b.amount.toString()}`;
            if (seen.has(key)) return;
            seen.add(key);
            const isWinningBid = highestBidder.toLowerCase() === userAddress.toLowerCase() && b.amount === highestBid;
            recentActivity.push({
              type: isWinningBid ? "bid" : "outbid",
              auctionId: auctionId.toString(),
              tokenId: tokenId.toString(),
              amount: b.amount.toString(),
              timestamp: b.timestamp.toString(),
              note: isWinningBid ? "Currently winning" : "Outbid and refunded",
            });
          });
        } catch (auctionError) {
          console.error(`Error fetching auction ${auctionId}:`, auctionError);
        }
      }

      console.log(`Found ${userNFTs.length} NFTs owned by user`);
    }

    // Sort activity by timestamp desc and keep top 10
    recentActivity.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    const activity = recentActivity.slice(0, 10);

    const dashboardData = {
      userAddress,
      balance: {
        value: balance.toString(),
        formatted: (Number(balance) / 1e18).toFixed(4),
        symbol: "ETH",
      },
      nftBalance: nftBalance.toString(),
      userNFTs,
      recentActivity: activity,
    };

    console.log(`Successfully fetched dashboard data for ${userAddress}`);
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
