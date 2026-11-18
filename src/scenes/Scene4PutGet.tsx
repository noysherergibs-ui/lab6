import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUCKET_TOP, Buckets, Entry, bucketLayout } from "../components/Buckets";
import { HASH_H, HashBox } from "../components/HashBox";
import { colors, fonts } from "../theme";

// Scene 4 — put() stores pairs by hashing the key; get() hashes again and jumps straight there.

const BOX_X = 960;
const BOX_Y = 250;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Put = { key: string; value: string; bucket: number; from: number; to: number };

export const Scene4PutGet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const { cx } = bucketLayout(8);

  // Each put is a little faster than the last.
  const puts: Put[] = [
    { key: "Alice", value: "555-1234", bucket: 3, from: 0.03, to: 0.24 },
    { key: "Bob", value: "555-8765", bucket: 6, from: 0.26, to: 0.42 },
    { key: "Carol", value: "555-2468", bucket: 1, from: 0.44, to: 0.57 },
  ].map((p) => ({ ...p, from: Math.round(p.from * d), to: Math.round(p.to * d) }));

  const getStart = Math.round(d * 0.62);
  const getHashed = Math.round(d * 0.7);
  const getJump = Math.round(d * 0.75);
  const getFound = Math.round(d * 0.8);

  // Which entries are in the buckets right now?
  const entries: Entry[][] = [];
  for (const p of puts) {
    if (frame >= p.to) entries[p.bucket] = [{ key: `"${p.key}"`, value: p.value }];
  }

  // Box pulses whenever a key reaches it.
  const arrivals = [...puts.map((p) => p.from + (p.to - p.from) * 0.4), getHashed - 4];
  const pulse = Math.max(
    0,
    ...arrivals.map((a) => (frame >= a ? Math.max(0, 1 - (frame - a) / 15) : 0)),
  );

  // Operation log (top left)
  const ops = [...puts.map((p) => ({ text: `put("${p.key}", …)`, at: p.from })), { text: 'get("Bob")', at: getStart }];
  const currentOp = ops.reduce((acc, o, i) => (frame >= o.at ? i : acc), -1);

  const bucketPulse = frame >= getJump ? spring({ frame: frame - getJump, fps, config: { damping: 10 } }) : 0;
  const found = spring({ frame: frame - getFound, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      <HashBox x={BOX_X} y={BOX_Y} pulse={pulse} />

      {/* Operation log */}
      <div style={{ position: "absolute", left: 80, top: 70, fontFamily: fonts.mono, fontSize: 34, lineHeight: 1.6 }}>
        {ops.map((o, i) =>
          frame >= o.at ? (
            <div
              key={o.text}
              style={{
                color: i === currentOp ? colors.text : colors.muted,
                opacity: i === currentOp ? 1 : 0.6,
              }}
            >
              <span style={{ color: i === currentOp ? colors.filled : "transparent" }}>▸ </span>
              {o.text}
            </div>
          ) : null,
        )}
      </div>

      <Buckets entries={entries} highlight={frame >= getJump ? 6 : null} pulse={bucketPulse} />

      {/* Flying put cards */}
      {puts.map((p) => {
        if (frame < p.from || frame >= p.to) return null;
        const t = (frame - p.from) / (p.to - p.from);
        // phase 1: left -> into the box; phase 2: out of the box -> bucket
        let x: number;
        let y: number;
        let scale: number;
        if (t < 0.4) {
          const u = easeInOut(t / 0.4);
          x = interpolate(u, [0, 1], [330, BOX_X]);
          y = BOX_Y;
          scale = interpolate(u, [0, 0.8, 1], [1, 1, 0.3]);
        } else if (t < 0.55) {
          x = BOX_X;
          y = BOX_Y;
          scale = 0; // inside the box
        } else {
          const u = easeInOut((t - 0.55) / 0.45);
          x = interpolate(u, [0, 1], [BOX_X, cx(p.bucket)]);
          // curved path: drop out of the bottom of the box, arc into the bucket
          y = interpolate(u, [0, 1], [BOX_Y + HASH_H / 2, BUCKET_TOP + 40]) - Math.sin(u * Math.PI) * 60;
          scale = interpolate(u, [0, 0.3, 1], [0.55, 0.8, 0.6]);
        }
        const showIndex = t >= 0.45;
        return (
          <div key={p.key}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `translate(-50%, -50%) scale(${scale})`,
                padding: "14px 26px",
                borderRadius: 14,
                border: `3px solid ${colors.key}`,
                backgroundColor: "#1e293b",
                fontFamily: fonts.mono,
                fontSize: 40,
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ color: colors.key }}>"{p.key}"</span>
              <span style={{ color: colors.muted }}> → {p.value}</span>
            </div>
            {/* index read-out to the right of the box */}
            <div
              style={{
                position: "absolute",
                left: BOX_X + 220,
                top: BOX_Y - 44,
                fontFamily: fonts.mono,
                fontSize: 72,
                fontWeight: 700,
                color: colors.filled,
                opacity: showIndex ? 1 : 0,
              }}
            >
              {p.bucket}
            </div>
          </div>
        );
      })}

      {/* get("Bob"): key into box */}
      {frame >= getStart && frame < getHashed ? (
        <div
          style={{
            position: "absolute",
            left: interpolate(easeInOut((frame - getStart) / (getHashed - getStart)), [0, 1], [330, BOX_X]),
            top: BOX_Y,
            transform: `translate(-50%, -50%) scale(${interpolate(frame, [getHashed - 6, getHashed], [1, 0.3], clamp)})`,
            fontFamily: fonts.mono,
            fontSize: 56,
            fontWeight: 700,
            color: colors.key,
          }}
        >
          "Bob"
        </div>
      ) : null}

      {/* get: index read-out and arrow straight to bucket 6 */}
      {frame >= getHashed ? (
        <>
          <div
            style={{
              position: "absolute",
              left: BOX_X + 220,
              top: BOX_Y - 44,
              fontFamily: fonts.mono,
              fontSize: 72,
              fontWeight: 700,
              color: colors.filled,
            }}
          >
            6
          </div>
          <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
            <path
              d={`M ${BOX_X + 240} ${BOX_Y + 50} Q ${cx(6)} ${BOX_Y + 80} ${cx(6)} ${BUCKET_TOP - 64}`}
              fill="none"
              stroke={colors.filled}
              strokeWidth={6}
              strokeDasharray={600}
              strokeDashoffset={interpolate(frame, [getHashed + 2, getJump], [600, 0], clamp)}
              strokeLinecap="round"
            />
          </svg>
        </>
      ) : null}

      {/* get: value lifts out and glows */}
      {frame >= getFound ? (
        <div
          style={{
            position: "absolute",
            left: cx(6),
            top: interpolate(found, [0, 1], [BUCKET_TOP + 60, BUCKET_TOP + 230]),
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            opacity: found,
          }}
        >
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 60,
              fontWeight: 700,
              color: colors.filled,
              textShadow: `0 0 ${24 * found}px rgba(20,184,166,0.9)`,
            }}
          >
            555-8765
          </div>
          <div style={{ fontSize: 30, color: colors.muted, marginTop: 6 }}>no searching</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
