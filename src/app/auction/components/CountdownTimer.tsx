"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  endTime: bigint;
  auctionStarted: boolean;
  className?: string;
}

export function CountdownTimer({ endTime, auctionStarted, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    total: number;
  }>({ minutes: 0, seconds: 0, total: 0 });

  useEffect(() => {
    const updateTimer = () => {
      if (!auctionStarted || endTime === 0n) {
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
        <div className="text-2xl font-mono text-yellow-400">⏳ Waiting for first bid</div>
        <div className="text-sm text-gray-400 mt-1">First bid starts the 5-minute timer</div>
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-mono text-red-400">🔥 Auction Ended</div>
        <div className="text-sm text-gray-400 mt-1">Winner can claim their NFT</div>
      </div>
    );
  }

  const isUrgent = timeLeft.total <= 60; // Last minute
  const isCritical = timeLeft.total <= 30; // Last 30 seconds

  return (
    <div className={`text-center ${className}`}>
      <div className={`text-3xl font-mono font-bold ${isCritical ? "text-red-400 animate-pulse" : isUrgent ? "text-orange-400" : "text-green-400"}`}>
        {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
      </div>
      <div className="text-sm text-gray-400 mt-1">{isCritical ? "🚨 Final seconds!" : isUrgent ? "⚡ Less than a minute!" : "⏰ Time remaining"}</div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${isCritical ? "bg-red-400" : isUrgent ? "bg-orange-400" : "bg-green-400"}`}
          style={{ width: `${Math.min(100, (timeLeft.total / 300) * 100)}%` }}
        />
      </div>
    </div>
  );
}
