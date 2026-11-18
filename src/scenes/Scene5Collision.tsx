import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUCKET_H, BUCKET_TOP, Buckets, Entry, bucketLayout } from "../components/Buckets";
import { HASH_H, HashBox } from "../components/HashBox";
import { colors, fonts } from "../theme";

// Scene 5 — Collisions: Dave also hashes to 3, so bucket 3 holds a short chain.

const BOX_X = 960;
const BOX_Y = 250;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const Scene5Collision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const { cx } = bucketLayout(8);
  const at = (f: number) => Math.round(f * d);

  const putStart = at(0.03);
  const inBox = at(0.12);
  const outBox = at(0.15);
  const hit = at(0.25);
  const chainAt = at(0.4);
  const chained = chainAt + 18;
  const captionAt = at(0.45);
  const getStart = at(0.62);
  const getHashed = at(0.67);
  const getJump = at(0.72);
  const checkAlice = at(0.78);
  const checkDave = at(0.86);

  const hoverX = cx(3);
  const hoverY = BUCKET_TOP - 150;
  const chainY = BUCKET_TOP + BUCKET_H + 60;

  // Dave's card position
  let dx = 330;
  let dy = BOX_Y;
  let dScale = 1;
  let dVisible = frame >= putStart && frame < chained;
  if (frame < inBox) {
    const u = easeInOut(interpolate(frame, [putStart, inBox], [0, 1], clamp));
    dx = interpolate(u, [0, 1], [330, BOX_X]);
    dScale = interpolate(u, [0, 0.8, 1], [1, 1, 0.3]);
  } else if (frame < outBox) {
    dVisible = false;
  } else if (frame < hit) {
    const u = easeInOut(interpolate(frame, [outBox, hit], [0, 1], clamp));
    dx = interpolate(u, [0, 1], [BOX_X, hoverX]);
    dy = interpolate(u, [0, 1], [BOX_Y + HASH_H / 2, hoverY]);
    dScale = interpolate(u, [0, 1], [0.55, 0.8]);
  } else if (frame < chainAt) {
    // bumped back: a small shake above the occupied bucket
    dx = hoverX + Math.sin((frame - hit) * 1.2) * 10 * Math.max(0, 1 - (frame - hit) / 25);
    dy = hoverY;
    dScale = 0.8;
  } else {
    const u = easeInOut(interpolate(frame, [chainAt, chained], [0, 1], clamp));
    // swing round the side of the bucket into the chain slot below Alice
    dx = hoverX + Math.sin(u * Math.PI) * 170;
    dy = interpolate(u, [0, 1], [hoverY, chainY]);
    dScale = interpolate(u, [0, 1], [0.8, 0.6]);
  }

  // Bucket contents
  const alice: Entry = { key: '"Alice"', value: "555-1234" };
  const dave: Entry = { key: '"Dave"', value: "555-1357" };
  if (frame >= checkAlice) {
    alice.mark = "no";
    alice.dim = frame >= checkDave;
  }
  if (frame >= checkDave) dave.mark = "yes";
  const entries: Entry[][] = [];
  entries[1] = [{ key: '"Carol"', value: "555-2468" }];
  entries[3] = frame >= chained ? [alice, dave] : [alice];
  entries[6] = [{ key: '"Bob"', value: "555-8765" }];

  const colliding = frame >= hit && frame < chained;
  const collisionPop = spring({ frame: frame - hit, fps, config: { damping: 9 } });
  const collisionFade = interpolate(frame, [chainAt, chained], [1, 0], clamp);

  const highlight = colliding ? 3 : frame >= getJump ? 3 : null;
  const highlightColor = colliding ? colors.warn : colors.filled;
  const pulse = colliding
    ? collisionPop
    : frame >= getJump
      ? spring({ frame: frame - getJump, fps, config: { damping: 10 } })
      : 0;

  const boxPulse = Math.max(
    0,
    ...[inBox - 3, getHashed - 3].map((a) => (frame >= a ? Math.max(0, 1 - (frame - a) / 15) : 0)),
  );

  const ops = [
    { text: 'put("Dave", …)', at: putStart },
    { text: 'get("Dave")', at: getStart },
  ];
  const currentOp = ops.reduce((acc, o, i) => (frame >= o.at ? i : acc), -1);
  const captionIn = spring({ frame: frame - captionAt, fps, config: { damping: 200 } });
  const showIndex = (frame >= outBox - 3 && frame < chainAt) || frame >= getHashed;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      <HashBox x={BOX_X} y={BOX_Y} pulse={boxPulse} />

      {/* Operation log */}
      <div style={{ position: "absolute", left: 80, top: 70, fontFamily: fonts.mono, fontSize: 34, lineHeight: 1.6 }}>
        {ops.map((o, i) =>
          frame >= o.at ? (
            <div key={o.text} style={{ color: i === currentOp ? colors.text : colors.muted, opacity: i === currentOp ? 1 : 0.6 }}>
              <span style={{ color: i === currentOp ? colors.filled : "transparent" }}>▸ </span>
              {o.text}
            </div>
          ) : null,
        )}
      </div>

      {/* index read-out */}
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
        3
      </div>

      <Buckets entries={entries} highlight={highlight} highlightColor={highlightColor} pulse={pulse} />

      {/* Collision! */}
      {colliding ? (
        <div
          style={{
            position: "absolute",
            left: hoverX + 215,
            top: hoverY - 45,
            fontSize: 64,
            fontWeight: 800,
            color: colors.warn,
            opacity: collisionFade,
            transform: `scale(${collisionPop}) rotate(-4deg)`,
            transformOrigin: "left center",
          }}
        >
          Collision!
        </div>
      ) : null}

      {/* Dave's card */}
      {dVisible ? (
        <div
          style={{
            position: "absolute",
            left: dx,
            top: dy,
            transform: `translate(-50%, -50%) scale(${dScale})`,
            padding: "14px 26px",
            borderRadius: 14,
            border: `3px solid ${colliding ? colors.warn : colors.key}`,
            backgroundColor: "#1e293b",
            fontFamily: fonts.mono,
            fontSize: 40,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: colors.key }}>"Dave"</span>
          <span style={{ color: colors.muted }}> → 555-1357</span>
        </div>
      ) : null}

      {/* get("Dave"): key into box, then arrow to bucket 3 */}
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
          "Dave"
        </div>
      ) : null}
      {frame >= getHashed ? (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d={`M ${BOX_X + 200} ${BOX_Y + 50} Q ${cx(3)} ${BOX_Y + 60} ${cx(3)} ${BUCKET_TOP - 64}`}
            fill="none"
            stroke={colors.filled}
            strokeWidth={6}
            strokeDasharray={700}
            strokeDashoffset={interpolate(frame, [getHashed + 2, getJump], [700, 0], clamp)}
            strokeLinecap="round"
          />
        </svg>
      ) : null}

      {/* Caption */}
      <div
        style={{
          position: "absolute",
          top: 960,
          width: "100%",
          textAlign: "center",
          fontSize: 44,
          color: colors.muted,
          opacity: captionIn,
          transform: `translateY(${(1 - captionIn) * 20}px)`,
        }}
      >
        <span style={{ color: colors.text, fontWeight: 600 }}>separate chaining:</span> each bucket holds a small list
      </div>
    </AbsoluteFill>
  );
};
