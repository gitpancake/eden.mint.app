import { ImageResponse } from "next/og";
import { createPublicClient, http } from "viem";
import { readContract } from "viem/actions";
import { baseSepolia } from "viem/chains";
import { AUCTION_CONTRACT_CONFIG } from "./config/contract";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

type AuctionStruct = {
  auctionId: bigint;
  tokenId: bigint;
  startTime: bigint;
  endTime: bigint;
  highestBidder: `0x${string}`;
  highestBid: bigint;
  settled: boolean;
  exists: boolean;
};

async function fetchAuctionState(): Promise<{ auctionActive: boolean; current: AuctionStruct | null; canSettle: boolean }> {
  try {
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

    const [auctionActive, current, canSettle] = await Promise.all([
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "auctionActive",
      }) as Promise<boolean>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "getCurrentAuction",
      }) as Promise<AuctionStruct>,
      readContract(client, {
        address: AUCTION_CONTRACT_CONFIG.address,
        abi: AUCTION_CONTRACT_CONFIG.abi,
        functionName: "canSettleAuction",
      }) as Promise<boolean>,
    ]);

    return { auctionActive, current, canSettle };
  } catch {
    return { auctionActive: false, current: null, canSettle: false };
  }
}

function formatEth(value: bigint): string {
  if (value === BigInt(0)) return "0";
  // Simple fixed 4 decimals formatter without pulling extra libs
  const s = value.toString();
  const whole = s.length > 18 ? s.slice(0, s.length - 18) : "0";
  const frac = s.padStart(19, "0").slice(-18, -14); // 4 decimals
  return `${whole}.${frac}`.replace(/\.0+$/, "");
}

export default async function OpengraphImage() {
  const { auctionActive, current, canSettle } = await fetchAuctionState();

  const status = (() => {
    if (!auctionActive) return "No active auction";
    const now = Math.floor(Date.now() / 1000);
    const ended = current && Number(current.endTime) > 0 && now >= Number(current.endTime);
    if (ended) return canSettle ? "Ended · Ready to settle" : "Ended · Awaiting settlement";
    if (current?.highestBid === BigInt(0)) return "Live · Awaiting first bid";
    return "Live Auction";
  })();

  const auctionId = current?.auctionId ? Number(current.auctionId) : undefined;
  const tokenId = current?.tokenId ? Number(current.tokenId) : undefined;
  const highestBid = current?.highestBid ?? BigInt(0);
  const highestBidder = current?.highestBidder ?? ("0x0000000000000000000000000000000000000000" as const);
  const bidderShort = `${highestBidder.slice(0, 6)}…${highestBidder.slice(-4)}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          color: "#000000",
          border: "8px solid #000000",
          padding: 48,
          boxSizing: "border-box",
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2 }}>Rolling NFT Auctions</div>
            <div style={{ fontSize: 24, textTransform: "uppercase" }}>{status}</div>
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 24 }}>
            <div style={{ flex: 1, border: "4px solid #000", display: "flex", alignItems: "center", justifyContent: "center", height: 360 }}>
              <div style={{ fontSize: 28, fontWeight: 700 }}>Token #{tokenId ?? "-"}</div>
            </div>
            <div style={{ flex: 1, border: "4px solid #000", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 16, textTransform: "uppercase" }}>Auction</div>
              <div style={{ fontSize: 48, fontWeight: 800 }}>#{auctionId ?? "-"}</div>
              <div style={{ height: 1, background: "#000" }} />
              <div style={{ fontSize: 16, textTransform: "uppercase" }}>Current Highest</div>
              <div style={{ fontSize: 40, fontWeight: 800 }}>{formatEth(highestBid)} ETH</div>
              <div style={{ fontSize: 20 }}>{highestBid ? bidderShort : "No bids yet"}</div>
            </div>
          </div>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 18, textTransform: "uppercase" }}>Share • Collect • Settle On-Chain</div>
            <div style={{ fontSize: 18 }}>eden — daily auctions</div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
