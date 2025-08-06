import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: { tokenId: string } }) {
  const { tokenId } = params;
  // Basic validation for tokenId (optional)
  if (!tokenId || isNaN(Number(tokenId))) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  // Construct metadata
  const metadata = {
    name: `Ancient Tree #${tokenId}`,
    description: "A unique tree planted in the community forest. Celebrate the majesty of ancient trees and help grow our community forest.",
    image: `${request.nextUrl.origin}/assets/${tokenId}.png`,
    attributes: [
      {
        trait_type: "Community",
        value: "Forest",
      },
      {
        trait_type: "Tree ID",
        value: tokenId,
      },
    ],
  };

  return NextResponse.json(metadata);
}
