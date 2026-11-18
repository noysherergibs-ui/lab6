import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUCKET_H, BUCKET_TOP, Buckets, Entry, bucketLayout } from "../components/Buckets";
import { HashBox } from "../components/HashBox";
import { colors, fonts } from "../theme";

// Scene 6 — Load factor rises to 0.75, so the array doubles and every key is re-hashed.

const BOX_X = 960;
const BOX_Y = 250;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Item = { key: string; old: number; chainPos: number; arrive?: number; next: number };

// Where each key sits before (8 buckets) and after (16 buckets) the resize.
const items: Item[] = [
  { key: "Carol", old: 1, chainPos: 0, next: 9 },
  { key: "Alice", old: 3, chainPos: 0, next: 3 },
  { key: "Dave", old: 3, chainPos: 1, next: 11 },
  { key: "Bob", old: 6, chainPos: 0, next: 6 },
  { key: "Erin", old: 3, chainPos: 2, arrive: 0.12, next: 5 },
  { key: "Frank", old: 6, chainPos: 1, arrive: 0.38, next: 14 },
];

// Centre y of an entry at chain position j under an 8-bucket row
const chainY = (j: number) => (j === 0 ? BUCKET_TOP + BUCKET_H / 2 : BUCKET_TOP + BUCKET_H + 30 + (j - 1) * 96 + 30);

export const Scene6Resize: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const at = (f: number) => Math.round(f * d);
  const l8 = bucketLayout(8);
  const l16 = bucketLayout(16);

  const RAIN = at(0.08); // frames a raining key takes to fall
  const gaugeFocus = at(0.28);
  const resizeStart = at(0.58);
  const resizeEnd = at(0.86);
  const STAGGER = 5;
  const flight = resizeEnd - resizeStart - STAGGER * (items.length - 1);

  const landed = (it: Item) => it.arrive === undefined || frame >= at(it.arrive) + RAIN;
  const resizing = frame >= resizeStart;
  const done = frame >= resizeEnd;

  // Entries shown inside the buckets (not in flight)
  const old: Entry[][] = [];
  const next: Entry[][] = [];
  if (!resizing) {
    for (const it of items) {
      if (landed(it)) (old[it.old] ??= [])[it.chainPos] = { key: `"${it.key}"` };
    }
  } else {
    items.forEach((it, i) => {
      if (frame >= resizeStart + i * STAGGER + flight) (next[it.next] ??= []).push({ key: `"${it.key}"` });
    });
  }

  const count = resizing ? items.length : items.filter(landed).length;
  const buckets = done ? 16 : 8;
  const load = count / buckets;
  const tooFull = load >= 0.75;

  // Gauge display value animates smoothly
  const shownLoad = done
    ? interpolate(frame, [resizeEnd, resizeEnd + 12], [0.75, 0.375], clamp)
    : load;

  const oldRowOpacity = interpolate(frame, [resizeStart, resizeStart + 12], [1, 0], clamp);
  const boxIn = interpolate(frame, [resizeStart - 15, resizeStart], [0, 1], clamp) *
    interpolate(frame, [resizeEnd + 10, resizeEnd + 30], [1, 0], clamp);
  const gaugePulse = spring({ frame: frame - gaugeFocus, fps, config: { damping: 10 } }) *
    interpolate(frame, [gaugeFocus + 15, gaugeFocus + 30], [1, 0], clamp);
  const boxPulse = resizing && !done ? 0.5 + 0.5 * Math.sin(frame * 0.6) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      <HashBox x={BOX_X} y={BOX_Y} opacity={boxIn} pulse={boxPulse} />

      {/* Load factor gauge */}
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 60,
          width: 460,
          transform: `scale(${1 + gaugePulse * 0.08})`,
          transformOrigin: "top right",
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 600 }}>load factor</div>
        <div style={{ fontSize: 28, color: colors.muted, marginBottom: 14 }}>entries ÷ buckets</div>
        <div style={{ position: "relative", height: 26, borderRadius: 13, backgroundColor: "#1e293b" }}>
          <div
            style={{
              width: `${Math.min(1, shownLoad) * 100}%`,
              height: "100%",
              borderRadius: 13,
              backgroundColor: tooFull && !done ? colors.warn : colors.filled,
            }}
          />
          {/* 0.75 threshold mark */}
          <div style={{ position: "absolute", left: "75%", top: -8, width: 4, height: 42, backgroundColor: colors.muted }} />
          <div style={{ position: "absolute", left: "75%", top: 38, transform: "translateX(-50%)", fontSize: 22, color: colors.muted, fontFamily: fonts.mono }}>
            0.75
          </div>
        </div>
        <div
          style={{
            marginTop: 44,
            fontFamily: fonts.mono,
            fontSize: 40,
            color: tooFull && !done ? colors.warn : colors.text,
          }}
        >
          {count} ÷ {buckets} = {shownLoad.toFixed(shownLoad === 0.375 ? 3 : 2)}
        </div>
      </div>

      {/* 8-bucket row before the resize, 16-bucket row after */}
      <div style={{ opacity: oldRowOpacity }}>
        <Buckets entries={old} />
      </div>
      {resizing ? (
        <Buckets
          count={16}
          entries={next}
          appear={(i) => spring({ frame: frame - resizeStart - 6 - i, fps, config: { damping: 200 } })}
        />
      ) : null}

      {/* Keys raining in */}
      {items.map((it) => {
        if (it.arrive === undefined) return null;
        const s = at(it.arrive);
        if (frame < s || frame >= s + RAIN) return null;
        const u = interpolate(frame, [s, s + RAIN], [0, 1], clamp);
        const y = interpolate(u * u, [0, 1], [-60, chainY(it.chainPos)]);
        return <FlyingKey key={it.key} text={it.key} x={l8.cx(it.old)} y={y} scale={0.9} />;
      })}

      {/* Re-hash flights: old spot -> hash box -> new spot */}
      {resizing && !done
        ? items.map((it, i) => {
            const s = resizeStart + i * STAGGER;
            if (frame < s || frame >= s + flight) return null;
            const t = (frame - s) / flight;
            let x: number;
            let y: number;
            let blur = 0;
            let opacity = 1;
            if (t < 0.45) {
              const u = easeInOut(t / 0.45);
              x = interpolate(u, [0, 1], [l8.cx(it.old), BOX_X]);
              y = interpolate(u, [0, 1], [chainY(it.chainPos), BOX_Y]);
              blur = u * 6;
              opacity = interpolate(u, [0.8, 1], [1, 0], clamp);
            } else {
              const u = easeInOut((t - 0.45) / 0.55);
              x = interpolate(u, [0, 1], [BOX_X, l16.cx(it.next)]);
              y = interpolate(u, [0, 1], [BOX_Y, BUCKET_TOP + BUCKET_H / 2]);
              blur = (1 - u) * 6;
              opacity = interpolate(u, [0, 0.2], [0, 1], clamp);
            }
            return <FlyingKey key={it.key} text={it.key} x={x} y={y} scale={0.75} blur={blur} opacity={opacity} />;
          })
        : null}

      {/* Captions */}
      <div
        style={{
          position: "absolute",
          top: 960,
          width: "100%",
          textAlign: "center",
          fontSize: 44,
          color: done ? colors.filled : colors.warn,
          opacity: tooFull && !resizing ? 1 : done ? interpolate(frame, [resizeEnd + 10, resizeEnd + 25], [0, 1], clamp) : 0,
        }}
      >
        {done ? "16 buckets: chains are short again" : "too full: lookups slow down"}
      </div>
    </AbsoluteFill>
  );
};

const FlyingKey: React.FC<{ text: string; x: number; y: number; scale?: number; blur?: number; opacity?: number }> = ({
  text,
  x,
  y,
  scale = 1,
  blur = 0,
  opacity = 1,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      padding: "10px 22px",
      borderRadius: 12,
      border: `3px solid ${colors.key}`,
      backgroundColor: "#1e293b",
      fontFamily: fonts.mono,
      fontSize: 36,
      color: colors.key,
      whiteSpace: "nowrap",
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      opacity,
    }}
  >
    "{text}"
  </div>
);
