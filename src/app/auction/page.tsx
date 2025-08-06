"use client";

import { useEffect, useState } from "react";
import { AuctionCard } from "./components/AuctionCard";
import { AuctionHistory } from "./components/AuctionHistory";
import { useNotification } from "./components/Notification";
import { UserDashboard } from "./components/UserDashboard";
import { WalletConnect } from "./components/WalletConnect";
import { useAuctionEventsWithNotifications } from "./hooks/useAuctionEvents";

export default function AuctionPage() {
  const [activeTab, setActiveTab] = useState<"auction" | "history" | "dashboard">("auction");
  const { addNotification, NotificationContainer } = useNotification();

  // Set up event listeners with notifications
  useAuctionEventsWithNotifications(addNotification);

  // Listen for custom tab switching events
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Rolling NFT Auctions</h1>
            <p className="text-gray-300 text-lg">Continuous art auctions with automatic bidder refunds</p>
          </div>
          <WalletConnect />
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-black/20 p-1 rounded-lg w-fit mx-auto">
          <button
            onClick={() => setActiveTab("auction")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === "auction" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          >
            Current Auction
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === "history" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          >
            Auction History
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 rounded-md font-medium transition-all ${activeTab === "dashboard" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
          >
            My Dashboard
          </button>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === "auction" && <AuctionCard />}
          {activeTab === "history" && <AuctionHistory />}
          {activeTab === "dashboard" && <UserDashboard />}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">How Rolling Auctions Work</h3>
          <div className="grid md:grid-cols-4 gap-6 text-gray-300">
            <div>
              <div className="text-purple-400 font-semibold mb-2">1. Pending State</div>
              <p className="text-sm">Each auction waits for its first bid before the timer starts.</p>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-2">2. First Bid Starts Timer</div>
              <p className="text-sm">The 5-minute countdown begins when the first bid is placed.</p>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-2">3. Automatic Refunds</div>
              <p className="text-sm">Previous bidders are automatically refunded when outbid.</p>
            </div>
            <div>
              <div className="text-purple-400 font-semibold mb-2">4. Claim & Continue</div>
              <p className="text-sm">Winners claim their NFT and the next auction begins.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Container */}
      <NotificationContainer />
    </div>
  );
}
