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

    if (nftBalance > BigInt(0)) {
      console.log(`User has ${nftBalance} NFTs, fetching token details...`);

      // Get all auction IDs to find which auctions the user won
      const allAuctionIds = (await readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "getAllAuctionIds",
      })) as bigint[];

      // For each auction, check if this user was the winner
      for (const auctionId of allAuctionIds) {
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
          }
        } catch (auctionError) {
          console.error(`Error fetching auction ${auctionId}:`, auctionError);
        }
      }

      console.log(`Found ${userNFTs.length} NFTs owned by user`);
    }

    const dashboardData = {
      userAddress,
      balance: {
        value: balance.toString(),
        formatted: (Number(balance) / 1e18).toFixed(4),
        symbol: "ETH",
      },
      nftBalance: nftBalance.toString(),
      userNFTs,
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
