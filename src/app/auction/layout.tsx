import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
const title = "Solienne — Rolling Daily Auction";
const description = "Bid on Solienne artwork in a rolling on-chain auction. Refundable bids, instant event updates, and periodic rest windows.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/auction" },
  openGraph: {
    title,
    description,
    url: siteUrl ? `${siteUrl}/auction` : undefined,
    siteName: "Eden",
    type: "website",
    images: [
      {
        url: "/auction/opengraph-image",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/auction/opengraph-image"],
  },
};

export default function AuctionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
