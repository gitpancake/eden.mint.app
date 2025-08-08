"use client";

import { useEffect, useState } from "react";

interface RestCountdownProps {
  readyAt: bigint; // unix seconds
  onReady?: () => void;
}

export function RestCountdown({ readyAt, onReady }: RestCountdownProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(readyAt) - now;
      setRemaining(Math.max(0, diff));
      if (diff <= 0) onReady?.();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [readyAt, onReady]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  if (remaining <= 0) {
    return (
      <div className="text-center border border-black p-6 bg-white">
        <div className="font-mono text-xl font-bold text-black uppercase tracking-widest">Rest complete</div>
        <div className="font-mono text-xs text-black mt-1">Anyone can start the next auction now.</div>
      </div>
    );
  }

  return (
    <div className="text-center border border-black p-6 bg-white">
      <div className="font-mono text-xl font-bold text-black uppercase tracking-widest">Next auction can start in</div>
      <div className="font-mono text-3xl font-bold text-black mt-2">
        {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </div>
    </div>
  );
}
