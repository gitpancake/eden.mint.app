import { ForestCell } from "../hooks/useForest";

interface ForestGridProps {
  forest: ForestCell[][];
  gridSize: number;
  planting: { row: number; col: number } | null;
  onPlotClick: (position: { row: number; col: number }) => void;
}

export function ForestGrid({ forest, gridSize, planting, onPlotClick }: ForestGridProps) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: "90vw",
        maxWidth: 900,
        aspectRatio: "1/1",
        gap: 1,
        background: "#fff",
      }}
    >
      {forest.map((row, rowIdx) =>
        row.map((cell, colIdx) => (
          <button
            key={`${rowIdx}-${colIdx}`}
            className={`relative flex items-end justify-center border border-emerald-200 bg-white hover:bg-emerald-50 transition h-0 pb-[100%] overflow-hidden group${
              planting && planting.row === rowIdx && planting.col === colIdx ? " z-10 bg-emerald-50" : ""
            }`}
            style={{ aspectRatio: "1/1" }}
            onClick={() => onPlotClick({ row: rowIdx, col: colIdx })}
          >
            {cell.tree ? (
              <pre
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] leading-[10px] font-mono select-none pointer-events-none whitespace-pre uppercase tracking-widest ${
                  cell.protectedUntil && cell.protectedUntil > Date.now() ? "text-yellow-500" : "text-emerald-700"
                }`}
              >
                {cell.tree}
              </pre>
            ) : null}
          </button>
        ))
      )}
    </div>
  );
}
