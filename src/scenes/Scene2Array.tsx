import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUCKET_TOP, Buckets, bucketLayout } from "../components/Buckets";
import { colors, fonts } from "../theme";

// Scene 2 — The idea: an array is fast when you know the index.

const TARGET = 5;

export const Scene2Array: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { cx } = bucketLayout(8);

  const captionIn = spring({ frame: frame - 45, fps, config: { damping: 200 } });

  // The arrow drops onto bucket 5 at ~40% of the scene.
  const jumpAt = Math.round(durationInFrames * 0.4);
  const jump = spring({ frame: frame - jumpAt, fps, config: { damping: 14, mass: 0.6 } });
  const lit = frame >= jumpAt + 6;
  const pulse = lit ? spring({ frame: frame - jumpAt - 6, fps, config: { damping: 10 } }) : 0;
  const resultIn = spring({ frame: frame - jumpAt - 15, fps, config: { damping: 200 } });

  const arrowY = interpolate(jump, [0, 1], [-200, BUCKET_TOP - 210]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      <div
        style={{
          position: "absolute",
          top: 120,
          width: "100%",
          textAlign: "center",
          fontSize: 56,
          color: colors.muted,
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 20}px)`,
        }}
      >
        arrays are fast <span style={{ color: colors.text, fontWeight: 600 }}>if you know the index</span>
      </div>

      <Buckets
        appear={(i) => spring({ frame: frame - i * 4, fps, config: { damping: 200 } })}
        highlight={lit ? TARGET : null}
        pulse={pulse}
      />

      {/* Arrow that jumps straight to bucket 5 */}
      <svg
        width={80}
        height={130}
        viewBox="0 0 80 130"
        style={{ position: "absolute", left: cx(TARGET) - 40, top: arrowY, opacity: frame >= jumpAt ? 1 : 0 }}
      >
        <line x1={40} y1={0} x2={40} y2={95} stroke={colors.filled} strokeWidth={10} strokeLinecap="round" />
        <polygon points="10,85 70,85 40,128" fill={colors.filled} />
      </svg>

      {/* array[5] -> 1 step */}
      <div
        style={{
          position: "absolute",
          top: 860,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 64,
          opacity: resultIn,
          transform: `translateY(${(1 - resultIn) * 20}px)`,
        }}
      >
        <span style={{ color: colors.text }}>array[</span>
        <span style={{ color: colors.filled, fontWeight: 700 }}>5</span>
        <span style={{ color: colors.text }}>]</span>
        <span style={{ color: colors.muted }}>{"  →  "}</span>
        <span style={{ color: colors.filled, fontWeight: 700 }}>1 step</span>
      </div>
    </AbsoluteFill>
  );
};
