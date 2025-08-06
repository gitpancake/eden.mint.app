"use client";

import { KeyboardEvent, useEffect, useState } from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import { ForestGrid } from "./components/ForestGrid";
import { Notification } from "./components/Notification";
import { PlotPanel } from "./components/PlotPanel";
import { WalletOverlay } from "./components/WalletOverlay";
import { useForest } from "./hooks/useForest";
import { useMobile } from "./hooks/useMobile";
import { useNotification } from "./hooks/useNotification";

const GRID_SIZE = 20;

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const [planting, setPlanting] = useState<{ row: number; col: number } | null>(null);
  const isMobile = useMobile();
  const { forest, handlePlant, handleProtect, handleBurn } = useForest(GRID_SIZE);
  const { notification, showNotification } = useNotification();

  // Handle spacebar planting
  useEffect(() => {
    if (!planting) return;

    function handleKeyDown(e: Event) {
      const ke = e as unknown as KeyboardEvent;
      if ((ke.key === " " || ke.key === "Spacebar") && planting) {
        const { row, col } = planting;
        const cell = forest[row][col];
        const now = Date.now();
        const isProtected = cell.protectedUntil && cell.protectedUntil > now;

        if (!cell.tree && !isProtected) {
          handlePlant(row, col);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [planting, forest, handlePlant]);

  return (
    <div className="relative min-h-screen w-full bg-white flex items-center justify-center">
      {/* Wallet Status Overlay */}
      <WalletOverlay isConnected={isConnected} address={address} balance={balance} isPending={isPending} onConnect={() => connect({ connector: connectors[0] })} onDisconnect={disconnect} />

      {/* Notification */}
      <Notification message={notification} />

      {/* Forest Grid */}
      <ForestGrid forest={forest} gridSize={GRID_SIZE} planting={planting} onPlotClick={setPlanting} />

      {/* Plot Control Panel */}
      {planting && (
        <PlotPanel
          planting={planting}
          cell={forest[planting.row][planting.col]}
          isMobile={isMobile}
          onClose={() => setPlanting(null)}
          onPlant={() => handlePlant(planting.row, planting.col)}
          onProtect={() => handleProtect(planting.row, planting.col)}
          onBurn={() => handleBurn(planting.row, planting.col)}
          onNotification={showNotification}
        />
      )}
    </div>
  );
}
