"use client";
import { useEffect, useState } from "react";
import { AuctionCard } from "./auction/components/AuctionCard";
import { AuctionHistory } from "./auction/components/AuctionHistory";
import { MiniWalletBadge } from "./auction/components/MiniWalletBadge";
import { useNotification } from "./auction/components/Notification";
import { UserDashboard } from "./auction/components/UserDashboard";
import { WalletConnect } from "./auction/components/WalletConnect";
import { useAuctionEventsWithNotifications } from "./auction/hooks/useAuctionEvents";
import { useMiniAppReady } from "./hooks/useMiniAppReady";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"auction" | "history" | "dashboard">("auction");
  const { addNotification, NotificationContainer } = useNotification();
  useMiniAppReady();

  useAuctionEventsWithNotifications(addNotification);

  useEffect(() => {
    const handleTabSwitch = (event: CustomEvent) => {
      if (event.detail === "auction") {
        setActiveTab("auction");
      }
    };
    window.addEventListener("switchTab", handleTabSwitch as EventListener);
    return () => window.removeEventListener("switchTab", handleTabSwitch as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header: compact on mobile, full on desktop */}
        <div className="md:hidden flex justify-between items-center mb-6 border-b border-black pb-6">
          <div className="font-mono text-xl font-bold text-black uppercase tracking-widest">Abraham</div>
          <div className="ml-auto">{typeof window !== "undefined" && (window as any).farcaster?.miniapp ? <MiniWalletBadge /> : <WalletConnect />}</div>
        </div>

        <div className="hidden md:flex flex-col md:flex-row justify-between items-center mb-8 border-b border-black pb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-black uppercase tracking-widest mb-2">Rolling NFT Auctions</h1>
            <p className="font-mono text-sm text-black uppercase tracking-wide">Continuous art auctions with automatic bidder refunds</p>
          </div>
          <WalletConnect />
        </div>

        {/* Desktop nav (above content). Hidden on mobile */}
        <div className="hidden md:flex space-x-0 mb-8 border border-black w-fit mx-auto">
          <button
            onClick={() => setActiveTab("auction")}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-r border-black transition-all ${
              activeTab === "auction" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"
            }`}
          >
            Current Auction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-widest border-r border-black transition-all ${
              activeTab === "history" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"
            }`}
          >
            Auction History
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 font-mono text-xs uppercase tracking-widest transition-all ${activeTab === "dashboard" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"}`}
          >
            My Dashboard
          </button>
        </div>

        <div className="max-w-6xl mx-auto">
          {activeTab === "auction" && <AuctionCard />}
          {activeTab === "history" && <AuctionHistory />}
          {activeTab === "dashboard" && <UserDashboard />}
        </div>

        {/* Mobile nav (below content) with smaller text */}
        <div className="md:hidden flex space-x-0 mt-6 mb-8 border border-black w-fit mx-auto">
          <button
            onClick={() => setActiveTab("auction")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border-r border-black transition-all ${
              activeTab === "auction" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"
            }`}
          >
            Current Auction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest border-r border-black transition-all ${
              activeTab === "history" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"
            }`}
          >
            Auction History
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-all ${activeTab === "dashboard" ? "bg-black text-white" : "bg-white text-black hover:bg-emerald-50"}`}
          >
            My Dashboard
          </button>
        </div>

        <div className="mt-12 border border-black p-6">
          <h3 className="font-mono text-lg font-bold text-black uppercase tracking-widest mb-6">How Auctions Work</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="border border-emerald-200 p-4 bg-emerald-50">
              <div className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-2">1. Continuous Flow</div>
              <p className="font-mono text-xs text-black">Auctions run back-to-back. When one ends and is settled, the next begins automatically unless a scheduled rest is due.</p>
            </div>
            <div className="border border-emerald-200 p-4 bg-emerald-50">
              <div className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-2">2. Refundable Bids</div>
              <p className="font-mono text-xs text-black">Outbid bids are automatically refunded by the contract. Funds are never stuck between bids.</p>
            </div>
            <div className="border border-emerald-200 p-4 bg-emerald-50">
              <div className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-2">3. Settlement & Mint</div>
              <p className="font-mono text-xs text-black">Once the timer ends, anyone can settle. Settlement mints the NFT to the winner and sends proceeds to the payout address.</p>
            </div>
            <div className="border border-emerald-200 p-4 bg-emerald-50">
              <div className="font-mono text-xs font-bold text-black uppercase tracking-widest mb-2">4. Rest Windows</div>
              <p className="font-mono text-xs text-black">
                After several auctions, a rest is scheduled. When the rest time elapses, anyone can start the next auction and becomes initial highest bidder at 0.
              </p>
            </div>
          </div>
        </div>
      </div>

      <NotificationContainer />
    </div>
  );
}
