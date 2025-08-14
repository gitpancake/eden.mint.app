// import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { farcasterMiniApp as miniAppConnector } from "@farcaster/miniapp-wagmi-connector";
import "@rainbow-me/rainbowkit/styles.css";
import { http, webSocket } from "viem";
import { createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

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

// Build a Wagmi config that supports both web wallets and the Farcaster Mini App wallet
export const config = createConfig({
  chains: [baseSepoliaCustom],
  transports: {
    [baseSepoliaCustom.id]: process.env.NEXT_PUBLIC_WEBSOCKET_RPC_URL ? webSocket(process.env.NEXT_PUBLIC_WEBSOCKET_RPC_URL!) : http(process.env.NEXT_PUBLIC_RPC_URL!),
  },
  connectors: [
    // Mini App embedded wallet
    miniAppConnector(),
    // Standard web connectors
    injected({ shimDisconnect: true }),
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!, showQrModal: true }),
  ],
  ssr: true,
});
