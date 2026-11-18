import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Buckets } from "../components/Buckets";
import { colors, fonts } from "../theme";

// Scene 8 — Recap in three lines, then the closing card.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const lines = [
  { n: "1", strong: "Hash", rest: " the key → a number", color: colors.hash, at: 0.1 },
  { n: "2", strong: "Modulo", rest: " the size → a bucket", color: colors.filled, at: 0.24 },
  { n: "3", strong: "Collisions", rest: " → chain;  too full → resize", color: colors.warn, at: 0.4 },
];

export const Scene8Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const at = (f: number) => Math.round(f * d);

  const closeAt = at(0.66);
  const recapOut = interpolate(frame, [closeAt - 10, closeAt], [1, 0], clamp);
  const closeIn = spring({ frame: frame - closeAt, fps, config: { damping: 200 } });
  const fadeOut = interpolate(frame, [d - 20, d - 2], [1, 0], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      {/* Recap */}
      <div style={{ position: "absolute", top: 260, left: 360, opacity: recapOut }}>
        {lines.map((l) => {
          const p = spring({ frame: frame - at(l.at), fps, config: { damping: 200 } });
          return (
            <div
              key={l.n}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                marginBottom: 60,
                fontSize: 64,
                opacity: p,
                transform: `translateX(${(1 - p) * -50}px)`,
              }}
            >
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45,
                  border: `5px solid ${l.color}`,
                  color: l.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.mono,
                  fontWeight: 700,
                  fontSize: 48,
                  flexShrink: 0,
                }}
              >
                {l.n}
              </div>
              <div style={{ whiteSpace: "pre" }}>
                <span style={{ color: l.color, fontWeight: 800 }}>{l.strong}</span>
                <span>{l.rest}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Closing card */}
      {frame >= closeAt - 2 ? (
        <AbsoluteFill style={{ opacity: closeIn * fadeOut }}>
          <div
            style={{
              position: "absolute",
              top: 250,
              width: "100%",
              textAlign: "center",
              fontSize: 160,
              fontWeight: 800,
              letterSpacing: -4,
              transform: `translateY(${(1 - closeIn) * 30}px)`,
            }}
          >
            Hash Maps
          </div>
          <Buckets
            entries={[[], [{ key: '"Carol"' }], [], [{ key: '"Alice"' }], [], [], [{ key: '"Bob"' }]]}
            appear={(i) => spring({ frame: frame - closeAt - 4 - i * 2, fps, config: { damping: 200 } })}
          />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
