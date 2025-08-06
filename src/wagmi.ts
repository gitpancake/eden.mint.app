import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { baseSepolia } from "wagmi/chains";
import { http } from "viem";

// Custom Base Sepolia chain configuration with hardcoded RPC
const baseSepoliaCustom = {
  ...baseSepolia,
  rpcUrls: {
    default: {
      http: ["https://base-sepolia.g.allthatnode.com/archive/evm/7240935353c842e89d9a3d159d1fba64"],
    },
    public: {
      http: ["https://base-sepolia.g.allthatnode.com/archive/evm/7240935353c842e89d9a3d159d1fba64"],
    },
  },
};

export const config = getDefaultConfig({
  appName: "Rolling NFT Auctions",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [baseSepoliaCustom],
  transports: {
    [baseSepoliaCustom.id]: http("https://base-sepolia.g.allthatnode.com/archive/evm/7240935353c842e89d9a3d159d1fba64"),
  },
  ssr: true,
});
