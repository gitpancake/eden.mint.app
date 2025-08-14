import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ tokenId: string }> }) {
  const { tokenId } = await params;
  // Basic validation for tokenId (optional)
  if (!tokenId || isNaN(Number(tokenId))) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  // Construct metadata
  const metadata = {
    name: `Auction NFT #${tokenId}`,
    description: "An NFT minted via the on-chain auction.",
    image: `${request.nextUrl.origin}/assets/${tokenId}.png`,
    attributes: [
      {
        trait_type: "Source",
        value: "Auction",
      },
      {
        trait_type: "Token ID",
        value: tokenId,
      },
    ],
  };

  return NextResponse.json(metadata);
}
