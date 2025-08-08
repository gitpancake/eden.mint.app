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
    const [
      auctionActive,
      currentAuctionId,
      currentAuction,
      canSettleAuction,
      canClaimNFT,
      auctionsSinceLastRest,
      nextAuctionEarliestStartTime,
      auctionDuration,
      restDuration,
      payoutAddress,
      owner,
      genesisStarted,
      restInterval,
    ] = await Promise.all([
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "auctionActive",
      }) as Promise<boolean>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "currentAuctionId",
      }) as Promise<bigint>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "getCurrentAuction",
      }) as Promise<{
        auctionId: bigint;
        tokenId: bigint;
        startTime: bigint;
        endTime: bigint;
        highestBidder: `0x${string}`;
        highestBid: bigint;
        settled: boolean;
        exists: boolean;
      }>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "canSettleAuction",
      }) as Promise<boolean>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "canClaimNFT",
      }) as Promise<boolean>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "auctionsSinceLastRest",
      }) as Promise<bigint>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "nextAuctionEarliestStartTime",
      }) as Promise<bigint>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "auctionDuration",
      }) as Promise<bigint>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "restDuration",
      }) as Promise<bigint>,
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
      // REST_INTERVAL is a public constant but not exposed in the ABI we ship; derive from events/state if needed in future
      Promise.resolve(BigInt(6)),
    ]);

    const { auctionId, tokenId, startTime, endTime, highestBidder, highestBid, settled, exists } = currentAuction;

    return NextResponse.json({
      auctionActive,
      currentAuctionId: currentAuctionId.toString(),
      currentAuction: {
        auctionId: auctionId.toString(),
        tokenId: tokenId.toString(),
        startTime: startTime.toString(),
        endTime: endTime.toString(),
        highestBidder,
        highestBid: highestBid.toString(),
        settled,
        exists,
      },
      canSettleAuction,
      canClaimNFT,
      auctionsSinceLastRest: auctionsSinceLastRest.toString(),
      nextAuctionEarliestStartTime: nextAuctionEarliestStartTime.toString(),
      auctionDuration: auctionDuration.toString(),
      restDuration: restDuration.toString(),
      payoutAddress,
      owner,
      genesisStarted,
      restInterval: restInterval.toString(),
    });
  } catch (error) {
    console.error("Error fetching auction state:", error);
    return NextResponse.json({ error: "Failed to fetch auction state", details: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
