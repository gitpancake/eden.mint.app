import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { http, webSocket } from "viem";
import { baseSepolia } from "wagmi/chains";

// Custom Base Sepolia chain configuration with hardcoded RPC
const baseSepoliaCustom = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL!],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL!],
    },
  },
};

export const config = getDefaultConfig({
  appName: "Rolling NFT Auctions",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [baseSepoliaCustom],
  transports: {
    [baseSepoliaCustom.id]: process.env.NEXT_PUBLIC_WEBSOCKET_RPC_URL ? webSocket(process.env.NEXT_PUBLIC_WEBSOCKET_RPC_URL!) : http(process.env.NEXT_PUBLIC_RPC_URL!),
  },
  ssr: true,
});
