// ASCII tree generator
export function generateAsciiTree(seed: number): string {
  // Simple deterministic PRNG
  function mulberry32(a: number) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(seed);

  // Canopy
  const leafChars = ["^", "@", "&", "#", "*", "o"];
  const leaf = leafChars[Math.floor(rand() * leafChars.length)];
  const width = 3 + Math.floor(rand() * 3); // 3-5
  const height = 2 + Math.floor(rand() * 2); // 2-3

  const canopy = [];
  for (let i = 0; i < height; i++) {
    const padLen = Math.max(0, Math.floor((width - 1) / 2) - i);
    const pad = " ".repeat(padLen);
    const leavesCount = Math.max(0, width - 2 * (height - 1 - i));
    const leaves = leaf.repeat(leavesCount);
    canopy.push(pad + leaves + pad);
  }

  // Trunk
  const trunkChar = rand() > 0.5 ? "|" : "l";
  const trunkHeight = 1 + Math.floor(rand() * 2); // 1-2
  const trunkPad = " ".repeat(Math.floor(width / 2));
  const trunk = [];
  for (let i = 0; i < trunkHeight; i++) {
    trunk.push(trunkPad + trunkChar + trunkPad);
  }

  return [...canopy, ...trunk].join("\n");
}

// Utility for seeded randomness
export function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Mock function to get plot history/status
export function getMockPlotData(row: number, col: number, plantedAt?: number) {
  if (plantedAt) {
    return {
      status: "planted",
      history: [{ event: "Tree planted", timestamp: new Date(plantedAt).toLocaleString() }],
    };
  }
  return {
    status: "empty",
    history: [{ event: "Empty plot", timestamp: "" }],
  };
}
