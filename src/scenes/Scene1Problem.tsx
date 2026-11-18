import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Scene 1 — The problem: a linear search through a plain list is slow.

const entries = [
  ["Alice", "555-1234"],
  ["Bob", "555-8765"],
  ["Carol", "555-2468"],
  ["Erin", "555-3141"],
  ["Frank", "555-2718"],
  ["Grace", "555-1618"],
  ["Heidi", "555-4040"],
  ["Ivan", "555-9001"],
  ["Judy", "555-7777"],
  ["Mallory", "555-0420"],
  ["Oscar", "555-6060"],
  ["Dave", "555-1357"],
];

const CARD_H = 62;
const GAP = 12;
const LIST_TOP = 96;
const LIST_LEFT = 560;
const CARD_W = 520;

export const Scene1Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title: in, hold, slide up and out.
  const titleIn = spring({ frame, fps, config: { damping: 200 } });
  const titleOut = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // List appears after the title leaves.
  const listStart = 70;
  // Search steps through every card, finishing at ~80% of the scene.
  const searchStart = listStart + 40;
  const searchEnd = Math.max(searchStart + 60, durationInFrames * 0.8);
  const stepFrames = (searchEnd - searchStart) / (entries.length - 1);
  const rawStep = (frame - searchStart) / stepFrames;
  const current = frame < searchStart ? -1 : Math.min(entries.length - 1, Math.floor(rawStep));
  const found = frame >= searchEnd;
  const checked = current + 1;

  const foundPulse = found ? spring({ frame: frame - searchEnd, fps, config: { damping: 12 } }) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      {/* Title card */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: titleIn * (1 - titleOut),
          transform: `translateY(${(1 - titleIn) * 40 - titleOut * 300}px)`,
        }}
      >
        <div style={{ fontSize: 160, fontWeight: 800, letterSpacing: -4 }}>Hash Maps</div>
        <div style={{ fontSize: 48, color: colors.muted, fontStyle: "italic", marginTop: 8 }}>
          finding things instantly
        </div>
      </AbsoluteFill>

      {/* The phone-book list */}
      {entries.map(([name, phone], i) => {
        const appear = spring({ frame: frame - listStart - i * 2, fps, config: { damping: 200 } });
        const isCurrent = i === current && !found;
        const isDave = i === entries.length - 1 && found;
        const passed = i < current;
        const border = isDave ? colors.filled : isCurrent ? colors.key : colors.slot;
        return (
          <div
            key={name}
            style={{
              position: "absolute",
              left: LIST_LEFT,
              top: LIST_TOP + i * (CARD_H + GAP),
              width: CARD_W,
              height: CARD_H,
              borderRadius: 12,
              border: `3px solid ${border}`,
              backgroundColor: isDave ? "rgba(20,184,166,0.18)" : isCurrent ? "rgba(245,158,11,0.15)" : "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 28px",
              boxSizing: "border-box",
              fontFamily: fonts.mono,
              fontSize: 30,
              opacity: appear * (passed ? 0.45 : 1),
              transform: `translateX(${(1 - appear) * -60}px) scale(${isDave ? 1 + foundPulse * 0.06 : 1})`,
            }}
          >
            <span style={{ color: colors.key }}>{name}</span>
            <span style={{ color: colors.muted }}>{phone}</span>
          </div>
        );
      })}

      {/* Magnifying glass that follows the current card */}
      {current >= 0 ? (
        <svg
          width={90}
          height={90}
          viewBox="0 0 90 90"
          style={{
            position: "absolute",
            left: LIST_LEFT - 120,
            top: LIST_TOP + current * (CARD_H + GAP) - 14,
          }}
        >
          <circle cx={36} cy={36} r={24} fill="none" stroke={found ? colors.filled : colors.key} strokeWidth={7} />
          <line x1={54} y1={54} x2={80} y2={80} stroke={found ? colors.filled : colors.key} strokeWidth={9} strokeLinecap="round" />
        </svg>
      ) : null}

      {/* Looking-for label and counter */}
      <div
        style={{
          position: "absolute",
          left: 1200,
          top: 300,
          opacity: interpolate(frame, [listStart + 10, listStart + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        <div style={{ fontSize: 40, color: colors.muted }}>looking for</div>
        <div style={{ fontSize: 72, fontFamily: fonts.mono, color: colors.key, fontWeight: 700 }}>"Dave"</div>
        <div style={{ fontSize: 40, color: colors.muted, marginTop: 60 }}>checked</div>
        <div
          style={{
            fontSize: 140,
            fontFamily: fonts.mono,
            fontWeight: 700,
            color: found ? colors.warn : colors.text,
            transform: `scale(${1 + foundPulse * 0.15})`,
            transformOrigin: "left center",
          }}
        >
          {Math.max(0, checked)}
        </div>
        <div style={{ fontSize: 34, color: found ? colors.warn : colors.muted, opacity: found ? 1 : 0 }}>
          one by one…
        </div>
      </div>
    </AbsoluteFill>
  );
};
