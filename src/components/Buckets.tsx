import { colors, fonts } from "../theme";

// The bucket array. It sits in the same place in every scene so viewers can track it.

export const BUCKET_TOP = 600;
export const BUCKET_H = 120;
const ROW_W = { 8: 1448, 16: 1760 } as Record<number, number>;
const GAP = 24;

export const bucketLayout = (count: number) => {
  const rowW = ROW_W[count] ?? 1448;
  const gap = count > 8 ? 12 : GAP;
  const w = (rowW - gap * (count - 1)) / count;
  const left = (1920 - rowW) / 2;
  return { w, gap, left, x: (i: number) => left + i * (w + gap), cx: (i: number) => left + i * (w + gap) + w / 2 };
};

export type Entry = { key: string; value?: string; dim?: boolean; mark?: "yes" | "no" };

type Props = {
  count?: number;
  // entries[i] is the chain in bucket i (first entry sits inside the bucket, the rest hang below)
  entries?: Entry[][];
  // 0..1 per bucket: how far it has drawn in
  appear?: (i: number) => number;
  highlight?: number | null;
  highlightColor?: string;
  // extra per-bucket lift / scale animation for the highlighted bucket
  pulse?: number;
};

export const Buckets: React.FC<Props> = ({
  count = 8,
  entries = [],
  appear = () => 1,
  highlight = null,
  highlightColor = colors.filled,
  pulse = 0,
}) => {
  const { w, x } = bucketLayout(count);
  const small = count > 8;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = appear(i);
        const chain = entries[i] ?? [];
        const occupied = chain.length > 0;
        const isHi = highlight === i;
        const border = isHi ? highlightColor : occupied ? colors.filled : colors.slot;
        return (
          <div key={i} style={{ position: "absolute", left: x(i), top: BUCKET_TOP, width: w, opacity: a }}>
            {/* index label above the bucket */}
            <div
              style={{
                position: "absolute",
                top: -52,
                width: w,
                textAlign: "center",
                fontFamily: fonts.mono,
                fontSize: small ? 26 : 34,
                color: isHi ? highlightColor : colors.muted,
                fontWeight: isHi ? 700 : 400,
              }}
            >
              {i}
            </div>
            {/* the bucket */}
            <div
              style={{
                width: w,
                height: BUCKET_H,
                boxSizing: "border-box",
                borderRadius: 14,
                border: `4px solid ${border}`,
                backgroundColor: isHi
                  ? `${highlightColor}33`
                  : occupied
                    ? "rgba(20,184,166,0.15)"
                    : "rgba(30,41,59,0.6)",
                transform: `scaleY(${a}) scale(${isHi ? 1 + pulse * 0.08 : 1})`,
                transformOrigin: "bottom center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {chain[0] ? <EntryLabel e={chain[0]} small={small} /> : null}
              {chain[0]?.mark ? <MarkBadge mark={chain[0].mark} /> : null}
            </div>
            {/* chained entries hang below */}
            {chain.slice(1).map((e) => (
              <div key={e.key} style={{ position: "relative", height: small ? 70 : 96 }}>
                <svg width={w} height={30} style={{ display: "block" }}>
                  <line x1={w / 2} y1={2} x2={w / 2} y2={24} stroke={colors.filled} strokeWidth={4} />
                  <polygon points={`${w / 2 - 8},18 ${w / 2 + 8},18 ${w / 2},28`} fill={colors.filled} />
                </svg>
                <div
                  style={{
                    minHeight: small ? 40 : 60,
                    padding: small ? "2px 0" : "6px 0",
                    boxSizing: "border-box",
                    position: "relative",
                    borderRadius: 10,
                    border: `3px solid ${colors.filled}`,
                    backgroundColor: "rgba(20,184,166,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EntryLabel e={e} small={small} />
                  {e.mark ? <MarkBadge mark={e.mark} /> : null}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
};

const EntryLabel: React.FC<{ e: Entry; small: boolean }> = ({ e, small }) => (
  <div
    style={{
      fontFamily: fonts.mono,
      fontSize: small ? 20 : 28,
      color: colors.key,
      opacity: e.dim ? 0.4 : 1,
      textAlign: "center",
      lineHeight: 1.15,
    }}
  >
    {e.key}
    {e.value && !small ? (
      <div style={{ fontSize: 20, color: colors.muted, marginTop: 4 }}>{e.value}</div>
    ) : null}
  </div>
);

// Check / cross badge on the top-right corner of an entry.
const MarkBadge: React.FC<{ mark: "yes" | "no" }> = ({ mark }) => (
  <div
    style={{
      position: "absolute",
      top: -16,
      right: -16,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: mark === "yes" ? colors.filled : colors.warn,
      color: colors.bg,
      fontSize: 26,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.sans,
    }}
  >
    {mark === "yes" ? "✓" : "✕"}
  </div>
);
