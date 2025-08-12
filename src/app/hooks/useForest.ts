import { useState } from "react";
import { generateAsciiTree, seededRandom } from "../utils/treeUtils";

export interface ForestCell {
  tree: string | null;
  plantedAt: number | null;
  protectedUntil: number | null;
  history: { event: string; timestamp: string }[];
}

export function useForest(gridSize: number) {
  const [forest, setForest] = useState<ForestCell[][]>(
    Array.from({ length: gridSize }, () =>
      Array.from({ length: gridSize }, () => ({
        tree: null,
        plantedAt: null,
        protectedUntil: null,
        history: [{ event: "Empty plot", timestamp: "" }],
      }))
    )
  );

  function handlePlant(row: number, col: number) {
    setForest((forest) => {
      if (forest[row]?.[col]?.tree) return forest; // already planted
      const newForest = forest.map((arr) => arr.map((cell) => ({ ...cell })));
      const now = Date.now();
      if (newForest[row] && newForest[row][col]) {
        newForest[row][col] = {
          tree: generateAsciiTree(now + row * 100 + col),
          plantedAt: now,
          protectedUntil: null,
          history: [{ event: "Tree planted", timestamp: new Date(now).toLocaleString() }],
        };
      }
      return newForest;
    });
  }

  function handleProtect(row: number, col: number) {
    setForest((forest) => {
      if (!forest[row]?.[col]?.tree) return forest;
      const newForest = forest.map((arr) => arr.map((cell) => ({ ...cell })));
      const now = Date.now();
      // Protect for 10 days
      if (newForest[row] && newForest[row][col]) {
        newForest[row][col].protectedUntil = now + 10 * 24 * 60 * 60 * 1000;
        newForest[row][col].history = [{ event: "Tree protected", timestamp: new Date(now).toLocaleString() }, ...newForest[row][col].history];
      }
      return newForest;
    });
  }

  function handleBurn(row: number, col: number) {
    setForest((forest) => {
      let _treesBurned = 0;
      let _fireCaught = false;
      const newForest = forest.map((arr) => arr.map((cell) => ({ ...cell })));
      const now = Date.now();
      const fireQueue = [{ row, col, seed: now }];
      const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

      if (!newForest[row]?.[col]?.tree || (newForest[row]?.[col]?.protectedUntil && newForest[row]?.[col]?.protectedUntil > now)) {
        return forest;
      }

      if (Math.random() >= 0.5) {
        return forest;
      }

      _fireCaught = true;

      while (fireQueue.length > 0) {
        const next = fireQueue.shift();
        if (!next) continue;

        const { row: r, col: c, seed } = next;
        if (visited[r]?.[c] || !newForest[r]?.[c]) continue;
        visited[r][c] = true;

        if (newForest[r]?.[c]?.tree && (!newForest[r]?.[c]?.protectedUntil || newForest[r]?.[c]?.protectedUntil < now)) {
          if (newForest[r] && newForest[r][c]) {
            newForest[r][c].tree = null;
            newForest[r][c].plantedAt = null;
            newForest[r][c].protectedUntil = null;
            newForest[r][c].history = [{ event: "Tree burned", timestamp: new Date(now).toLocaleString() }, ...newForest[r][c].history];
          }
          _treesBurned++;

          const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
          ];

          for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            const spreadSeed = seed + dr * 1000 + dc * 10000;

            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !visited[nr]?.[nc] && newForest[nr]?.[nc]) {
              if (newForest[nr]?.[nc]?.protectedUntil && newForest[nr]?.[nc]?.protectedUntil > now) break;
              if (!newForest[nr]?.[nc]?.tree) break;
              if (seededRandom(spreadSeed) < 0.5) break;
              fireQueue.push({ row: nr, col: nc, seed: spreadSeed });
              break;
            }
          }
        }
      }

      return newForest;
    });
  }

  return { forest, handlePlant, handleProtect, handleBurn };
}
