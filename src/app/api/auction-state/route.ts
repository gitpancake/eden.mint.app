import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { AUCTION_CONTRACT_CONFIG } from "../../auction/config/contract";

// Reusable client for server-side reads
const client = createPublicClient({
  chain: {
    ...baseSepolia,
    rpcUrls: {
      default: { http: [process.env.NEXT_PUBLIC_RPC_URL!] },
      public: { http: [process.env.NEXT_PUBLIC_RPC_URL!] },
    },
  },
  transport: http(process.env.NEXT_PUBLIC_RPC_URL!),
});

export async function GET() {
  try {
    const [view, payoutAddress, owner, genesisStarted] = await Promise.all([
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "getCurrentAuctionView",
      }) as Promise<
        [
          bigint, // auctionId
          bigint, // tokenId
          bigint, // startTime
          bigint, // endTime
          `0x${string}`, // highestBidder
          bigint, // highestBid
          boolean, // settled
          boolean, // exists
          boolean, // isAuctionActive
          boolean, // hasStarted
          boolean, // hasEnded
          boolean, // canSettleNow
          boolean, // nextTokenUriSeeded
          bigint // totalBids
        ]
      >,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "payoutAddress",
      }) as Promise<`0x${string}`>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "owner",
      }) as Promise<`0x${string}`>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "genesisStarted",
      }) as Promise<boolean>,
    ]);

    const [auctionId, tokenId, startTime, endTime, highestBidder, highestBid, settled, exists, isAuctionActive, hasStarted, hasEnded, canSettleNow, nextTokenUriSeeded, totalBids] = view;

    return NextResponse.json({
      auctionActive: isAuctionActive,
      currentAuctionId: auctionId.toString(),
      currentAuction: {
        auctionId: auctionId.toString(),
        tokenId: tokenId.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        highestBidder,
        highestBid: highestBid.toString(),
        settled,
        exists,
        hasStarted,
        hasEnded,
        canSettle: canSettleNow,
        totalBids: totalBids.toString(),
      },
      canSettleAuction: canSettleNow,
      payoutAddress,
      owner,
      genesisStarted,
      nextTokenUriSeeded,
    });
  } catch (error) {
    console.error("Error fetching auction state:", error);
    return NextResponse.json({ error: "Failed to fetch auction state", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
