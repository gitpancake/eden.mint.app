"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  startTime: bigint;
  endTime: bigint;
  auctionActive: boolean;
  className?: string;
}

export function CountdownTimer({ startTime, endTime, auctionActive, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    total: number;
  }>({ minutes: 0, seconds: 0, total: 0 });
  const [totalDuration, setTotalDuration] = useState<number>(0);

  useEffect(() => {
    const updateTimer = () => {
      if (!auctionActive || endTime === BigInt(0)) {
        setTimeLeft({ minutes: 0, seconds: 0, total: 0 });
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const endTimeSeconds = Number(endTime);
      const startTimeSeconds = Number(startTime);
      const difference = endTimeSeconds - now;
      const duration = Math.max(0, endTimeSeconds - startTimeSeconds);
      setTotalDuration(duration);

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
  }, [startTime, endTime, auctionActive]);

  if (!auctionActive) {
    return (
      <div className={`text-center ${className}`}>
        <div className="font-mono text-2xl font-bold text-gray-400 uppercase tracking-widest">⏸️ Auction Inactive</div>
        <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">Waiting for auction to become active</div>
      </div>
    );
  }

  if (timeLeft.total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="font-mono text-2xl font-bold text-black uppercase tracking-widest">🔥 Auction Ended</div>
        <div className="font-mono text-xs text-black mt-1 uppercase tracking-wide">Anyone can settle now</div>
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
          style={{ width: `${totalDuration > 0 ? Math.min(100, (timeLeft.total / totalDuration) * 100) : 0}%` }}
        />
      </div>
    </div>
  );
}
