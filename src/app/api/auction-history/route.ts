import { NextResponse } from "next/server";
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

export async function GET() {
  try {
    console.log("Fetching auction history from server...");

    // Get all auction IDs
    const allAuctionIds = (await readContract(client, {
      address: AUCTION_CONTRACT_CONFIG.address,
      abi: AUCTION_CONTRACT_CONFIG.abi,
      functionName: "getAllAuctionIds",
    })) as bigint[];

    // Get current auction ID to exclude it
    const currentAuctionId = (await readContract(client, {
      address: AUCTION_CONTRACT_CONFIG.address,
      abi: AUCTION_CONTRACT_CONFIG.abi,
      functionName: "currentAuctionId",
    })) as bigint;

    console.log("All auction IDs:", allAuctionIds);
    console.log("Current auction ID:", currentAuctionId);

    if (!allAuctionIds || allAuctionIds.length === 0) {
      return NextResponse.json({ auctions: [] });
    }

    // Filter out current auction and sort by most recent first
    const historicalIds = allAuctionIds.filter((id) => id !== currentAuctionId);
    historicalIds.sort((a, b) => Number(b) - Number(a));

    // Limit to last 10 for performance
    const idsToFetch = historicalIds.slice(0, 10);

    console.log(`Fetching data for ${idsToFetch.length} historical auctions`);

    const auctions = [];

    // Fetch auction data and bids for each auction ID
    for (const auctionId of idsToFetch) {
      try {
        console.log(`Fetching data for auction ID: ${auctionId}`);

        // Get auction data from auctions mapping
        const auctionData = (await readContract(client, {
          address: AUCTION_CONTRACT_CONFIG.address,
          abi: AUCTION_CONTRACT_CONFIG.abi,
          functionName: "auctions",
          args: [auctionId],
        })) as [bigint, bigint, bigint, bigint, `0x${string}`, bigint, boolean, boolean];

        // Get bid data from getAuctionBids
        const bidsData = (await readContract(client, {
          address: AUCTION_CONTRACT_CONFIG.address,
          abi: AUCTION_CONTRACT_CONFIG.abi,
          functionName: "getAuctionBids",
          args: [auctionId],
        })) as Array<{ bidder: `0x${string}`; amount: bigint; timestamp: bigint }>;

        // Parse auction data
        const [parsedAuctionId, tokenId, startTime, endTime, highestBidder, highestBid, settled, exists] = auctionData;

        // Convert bids data
        const bids = bidsData.map((bid) => ({
          bidder: bid.bidder,
          amount: bid.amount.toString(), // Convert BigInt to string for JSON
          timestamp: bid.timestamp.toString(),
        }));

        // Create auction object
        const auction = {
          auctionId: parsedAuctionId.toString(),
          tokenId: tokenId.toString(),
          startTime: startTime.toString(),
          endTime: endTime.toString(),
          highestBidder: highestBidder,
          highestBid: highestBid.toString(),
          settled: settled,
          exists: exists,
          bids: bids,
        };

        // Only add if auction exists (include all settled auctions, even those without bids)
        if (exists) {
          auctions.push(auction);
        }
      } catch (error) {
        console.error(`Error fetching data for auction ${auctionId}:`, error);
      }
    }

    console.log(`Successfully fetched ${auctions.length} historical auctions`);

    return NextResponse.json({
      auctions,
      totalAuctionIds: allAuctionIds.length,
      currentAuctionId: currentAuctionId.toString(),
      historicalCount: historicalIds.length,
    });
  } catch (error) {
    console.error("Error fetching auction history:", error);
    return NextResponse.json({ error: "Failed to fetch auction history", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
