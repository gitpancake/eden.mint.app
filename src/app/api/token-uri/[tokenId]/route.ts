import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import { AUCTION_CONTRACT_CONFIG } from "../../../auction/config/contract";

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

const TOKEN_URI_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  try {
    const { tokenId } = await params;
    if (!tokenId || isNaN(Number(tokenId))) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }

    // Call tokenURI directly with a minimal ABI to avoid ABI drift issues
    const tokenUri = await client.readContract({
      address: AUCTION_CONTRACT_CONFIG.address,
      abi: TOKEN_URI_ABI,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    return NextResponse.json({ tokenUri });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to read tokenURI", details: message }, { status: 500 });
  }
}
