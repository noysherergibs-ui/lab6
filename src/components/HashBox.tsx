import { colors, fonts } from "../theme";

// The violet hash( ) machine. (x, y) is its centre.
export const HASH_W = 340;
export const HASH_H = 150;

export const HashBox: React.FC<{ x: number; y: number; pulse?: number; opacity?: number; scale?: number }> = ({
  x,
  y,
  pulse = 0,
  opacity = 1,
  scale = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x - HASH_W / 2,
      top: y - HASH_H / 2,
      width: HASH_W,
      height: HASH_H,
      borderRadius: 24,
      border: `5px solid ${colors.hash}`,
      backgroundColor: `rgba(139,92,246,${0.15 + pulse * 0.35})`,
      boxShadow: `0 0 ${20 + pulse * 60}px rgba(139,92,246,${0.3 + pulse * 0.5})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.mono,
      fontSize: 60,
      fontWeight: 700,
      color: colors.text,
      opacity,
      transform: `scale(${scale * (1 + pulse * 0.06)})`,
      boxSizing: "border-box",
    }}
  >
    hash( )
  </div>
);
