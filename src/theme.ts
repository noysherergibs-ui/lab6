import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const inter = loadInter("normal", { weights: ["400", "600", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const colors = {
  bg: "#0f172a",
  text: "#f8fafc",
  muted: "#94a3b8",
  key: "#f59e0b", // amber: keys
  hash: "#8b5cf6", // violet: hash function
  slot: "#475569", // slate: empty bucket outline
  filled: "#14b8a6", // teal: occupied bucket
  warn: "#f43f5e", // rose: collisions / warnings
};

export const fonts = {
  sans: inter.fontFamily,
  mono: mono.fontFamily,
};
