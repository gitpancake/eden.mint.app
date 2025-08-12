import { ForestCell } from "../hooks/useForest";
import { getMockPlotData } from "../utils/treeUtils";
import { ScrambleText } from "./ScrambleText";

interface PlotPanelProps {
  planting: { row: number; col: number };
  cell: ForestCell;
  isMobile: boolean;
  onClose: () => void;
  onPlant: () => void;
  onProtect: () => void;
  onBurn: () => void;
  onNotification: (message: string) => void;
}

export function PlotPanel({ planting, cell, isMobile, onClose, onPlant, onProtect, onBurn, onNotification: _onNotification }: PlotPanelProps) {
  const now = Date.now();
  const isProtected = cell.protectedUntil && cell.protectedUntil > now;
  const data = getMockPlotData(planting.row, planting.col, cell.plantedAt || undefined);
  const planted = !!cell.tree;

  return (
    <div
      className={`fixed z-30 bg-white border border-black transition-all duration-300 flex flex-col
        ${isMobile ? "left-0 right-0 bottom-0 top-auto max-h-[50vh]" : "top-0 right-0 bottom-0 w-[300px] max-w-full"}
      `}
      style={{
        borderWidth: 1,
        borderColor: "#000",
        background: "#fff",
        padding: 0,
        transform: isMobile ? "translateY(0)" : "translateX(0)",
      }}
    >
      <button
        className="absolute top-2 right-3 font-mono text-xs uppercase tracking-widest text-black hover:text-emerald-400 transition bg-transparent px-0 py-0 rounded-none shadow-none border-none"
        onClick={onClose}
        aria-label="Close"
        style={{ background: "none", border: "none", padding: 0 }}
      >
        X
      </button>
      <div className="p-6 pt-10 flex-1 flex flex-col gap-4 overflow-y-auto">
        <div className="font-mono text-xs uppercase tracking-widest text-black mb-2">
          <ScrambleText text={`PLOT (${planting.row + 1}, ${planting.col + 1})`} />
        </div>

        {/* Status */}
        <div className="font-mono text-sm font-bold uppercase tracking-widest mb-2 text-black">
          <ScrambleText text={planted ? (isProtected ? "PROTECTED" : "PLANTED") : data.status === "empty" ? "EMPTY" : data.status === "burned" ? "BURNED" : ""} />
        </div>

        {/* Minimal History */}
        <ul className="font-mono text-xs uppercase tracking-widest text-black space-y-1 mb-4">
          {cell.history.map((h, i) => (
            <li key={i} className="flex justify-between items-center">
              <ScrambleText text={h.event} />
              <span className="ml-2 text-gray-400 text-[10px] normal-case font-normal">
                <ScrambleText text={h.timestamp} />
              </span>
            </li>
          ))}
        </ul>

        {/* Minimal Controls */}
        <div className="flex gap-2">
          {!planted ? (
            <button
              onClick={onPlant}
              className="font-mono text-xs uppercase tracking-widest border-0 hover:text-emerald-400 transition bg-transparent px-0 py-1 rounded-none shadow-none flex-1 text-black"
            >
              <ScrambleText text="Plant" />
            </button>
          ) : isProtected ? (
            <button disabled className="font-mono text-xs uppercase tracking-widest border-0 text-gray-300 bg-transparent px-0 py-1 rounded-none shadow-none flex-1 cursor-not-allowed">
              <ScrambleText text="Protect" />
            </button>
          ) : (
            <button
              onClick={onProtect}
              className="font-mono text-xs uppercase tracking-widest border-0 hover:text-emerald-400 transition bg-transparent px-0 py-1 rounded-none shadow-none flex-1 text-black"
            >
              <ScrambleText text="Protect" />
            </button>
          )}

          {planted && !isProtected ? (
            <button onClick={onBurn} className="font-mono text-xs uppercase tracking-widest border-0 hover:text-red-500 transition bg-transparent px-0 py-1 rounded-none shadow-none flex-1 text-black">
              <ScrambleText text="Burn" />
            </button>
          ) : (
            <button disabled className="font-mono text-xs uppercase tracking-widest border-0 text-gray-300 bg-transparent px-0 py-1 rounded-none shadow-none flex-1 cursor-not-allowed">
              <ScrambleText text="Burn" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
