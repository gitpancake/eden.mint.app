import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { base, baseSepolia } from "wagmi/chains";

const isDev = process.env.NODE_ENV === "development";

export const config = getDefaultConfig({
  appName: "Mint NFT App",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
  chains: [isDev ? baseSepolia : base],
  ssr: true,
});
