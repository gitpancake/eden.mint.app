"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: bigint;
  auctionStarted: boolean;
  firstAuctionEverStarted?: boolean;
  className?: string;
}

export function CountdownTimer({ endTime, auctionStarted, firstAuctionEverStarted = false, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    total: number;
  }>({ minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const updateTimer = () => {
      if (!auctionStarted || endTime === BigInt(0)) {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const endTimeSeconds = Number(endTime);
      const difference = endTimeSeconds - now;

      if (difference > 0) {
        const minutes = Math.floor(difference / 60);
        const seconds = difference % 60;
        setTimeLeft({ minutes, seconds, total: difference });
      } else {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endTime, auctionStarted]);

  if (!auctionStarted) {
    return (
      <div className={`text-center ${className}`}>
        {!firstAuctionEverStarted ? (
          <>
            <div className="font-mono text-2xl font-bold text-emerald-700 uppercase tracking-widest">🚀 Ready to Launch</div>
            <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">First bid ever will start the auction system</div>
          </>
        ) : (
          <>
            <div className="font-mono text-2xl font-bold text-black uppercase tracking-widest">⏳ Waiting for first bid</div>
            <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">First bid starts the 5-minute timer</div>
          </>
        )}
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="font-mono text-2xl font-bold text-black uppercase tracking-widest">🔥 Auction Ended</div>
        <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">Winner can claim their NFT</div>
      </div>
    );
  }

  const isUrgent = timeLeft.total <= 60; // Last minute
  const isCritical = timeLeft.total <= 30; // Last 30 seconds

  return (
    <div className={`text-center ${className}`}>
      <div className={`font-mono text-3xl font-bold uppercase tracking-widest ${isCritical ? "text-black animate-pulse" : isUrgent ? "text-black" : "text-emerald-700"}`}>
        {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </div>
      <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">{isCritical ? "🚨 Final seconds!" : isUrgent ? "⚡ Less than a minute!" : "⏰ Time remaining"}</div>

      {/* Progress bar */}
      <div className="w-full border border-black h-2 mt-3 bg-white">
        <div
          className={`h-full transition-all duration-1000 ${isCritical ? "bg-black" : isUrgent ? "bg-black" : "bg-emerald-700"}`}
          style={{ width: `${Math.min(100, (timeLeft.total / 300) * 100)}%` }}
        />
      </div>
    </div>
  );
}
