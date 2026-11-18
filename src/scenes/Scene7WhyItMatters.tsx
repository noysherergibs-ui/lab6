import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

// Scene 7 — Why it matters: O(1) on average, and every major language has one.

const rows = [
  ["Find", "O(n)", "O(1)"],
  ["Insert", "O(1)", "O(1)"],
  ["Delete", "O(n)", "O(1)"],
];

const langs = [
  { name: "Python", type: "dict", code: '{"Alice": "555-1234"}' },
  { name: "Java", type: "HashMap", code: "new HashMap<>()" },
  { name: "JavaScript", type: "Map", code: "new Map()" },
];

const COL = [300, 300, 420];

export const Scene7WhyItMatters: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const at = (f: number) => Math.round(f * d);
  const pop = (start: number) => spring({ frame: frame - start, fps, config: { damping: 200 } });

  const headerIn = pop(at(0.02));
  const rowIn = [0.08, 0.15, 0.22].map((f) => pop(at(f)));
  const glow = pop(at(0.32));
  const langIn = [0.55, 0.66, 0.78].map((f) => pop(at(f)));

  const tableW = COL.reduce((a, b) => a + b, 0);
  const cell = (w: number, extra: React.CSSProperties = {}): React.CSSProperties => ({
    width: w,
    padding: "18px 0",
    textAlign: "center",
    ...extra,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      {/* Comparison table */}
      <div style={{ position: "absolute", top: 90, left: (1920 - tableW) / 2, width: tableW }}>
        {/* highlight behind the hash map column */}
        <div
          style={{
            position: "absolute",
            left: COL[0] + COL[1],
            top: 0,
            width: COL[2],
            height: 4 * 100,
            borderRadius: 20,
            border: `4px solid ${colors.filled}`,
            backgroundColor: "rgba(20,184,166,0.12)",
            boxShadow: `0 0 ${50 * glow}px rgba(20,184,166,${0.5 * glow})`,
            opacity: glow,
          }}
        />
        <div style={{ display: "flex", fontSize: 44, fontWeight: 600, color: colors.muted, opacity: headerIn, height: 100, alignItems: "center" }}>
          <div style={cell(COL[0])} />
          <div style={cell(COL[1])}>List</div>
          <div style={cell(COL[2], { color: colors.text })}>Hash map</div>
        </div>
        {rows.map(([op, list, map], i) => (
          <div
            key={op}
            style={{
              display: "flex",
              alignItems: "center",
              height: 100,
              borderTop: `2px solid ${colors.slot}`,
              opacity: rowIn[i],
              transform: `translateY(${(1 - rowIn[i]) * 20}px)`,
            }}
          >
            <div style={cell(COL[0], { fontSize: 44, textAlign: "left", paddingLeft: 30 })}>{op}</div>
            <div style={cell(COL[1], { fontSize: 48, fontFamily: fonts.mono, color: list === "O(n)" ? colors.warn : colors.text })}>
              {list}
            </div>
            <div style={cell(COL[2], { fontFamily: fonts.mono })}>
              <span style={{ fontSize: 48, color: colors.filled, fontWeight: 700 }}>{map}</span>
              <span style={{ fontSize: 24, color: colors.muted, fontFamily: fonts.sans }}> on average</span>
            </div>
          </div>
        ))}
      </div>

      {/* Languages */}
      <div style={{ position: "absolute", top: 640, width: "100%", display: "flex", justifyContent: "center", gap: 60 }}>
        {langs.map((l, i) => (
          <div
            key={l.name}
            style={{
              width: 480,
              padding: "28px 0",
              borderRadius: 20,
              border: `3px solid ${colors.slot}`,
              backgroundColor: "#1e293b",
              textAlign: "center",
              opacity: langIn[i],
              transform: `translateY(${(1 - langIn[i]) * 40}px)`,
            }}
          >
            <div style={{ fontSize: 34, color: colors.muted }}>{l.name}</div>
            <div style={{ fontSize: 64, fontFamily: fonts.mono, fontWeight: 700, color: colors.hash, margin: "6px 0 10px" }}>{l.type}</div>
            <div style={{ fontSize: 26, fontFamily: fonts.mono, color: colors.key, fontVariantLigatures: "none" }}>{l.code}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
