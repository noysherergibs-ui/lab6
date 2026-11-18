import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BUCKET_TOP, Buckets, bucketLayout } from "../components/Buckets";
import { HASH_W, HashBox } from "../components/HashBox";
import { colors, fonts } from "../theme";

// Scene 3 — The hash function turns a key into a number, then modulo picks a bucket.

const BOX_X = 780; // key + box + number read as one centred group
const BOX_Y = 230;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Scene3Hash: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames: d } = useVideoConfig();
  const { cx } = bucketLayout(8);

  const boxIn = spring({ frame, fps, config: { damping: 200 } });

  // Key travels from the left edge into the box.
  const keyStart = Math.round(d * 0.12);
  const keyArrive = Math.round(d * 0.28);
  const keyT = interpolate(frame, [keyStart, keyArrive], [0, 1], clamp);
  const keyEase = 1 - Math.pow(1 - keyT, 3);
  const keyX = interpolate(keyEase, [0, 1], [120, BOX_X - HASH_W / 2 - 20]);
  const keyOpacity = interpolate(frame, [keyStart, keyStart + 8, keyArrive - 4, keyArrive + 4], [0, 1, 1, 0], clamp);

  const pulse = spring({ frame: frame - keyArrive, fps, config: { damping: 8 } }) *
    interpolate(frame, [keyArrive + 10, keyArrive + 30], [1, 0], clamp);

  // Big number comes out the right side.
  const numIn = spring({ frame: frame - keyArrive - 6, fps, config: { damping: 200 } });

  // Modulo line types out.
  const modStart = Math.round(d * 0.5);
  const modText = "2,083,571 % 8 = ";
  const typed = Math.floor(interpolate(frame, [modStart, modStart + 30], [0, modText.length], clamp));
  const resultIn = spring({ frame: frame - modStart - 34, fps, config: { damping: 12 } });

  // The 3 drops into bucket 3.
  const dropStart = Math.round(d * 0.72);
  const drop = spring({ frame: frame - dropStart, fps, config: { damping: 200 } });
  const landed = frame >= dropStart + 14;
  const bucketPulse = landed ? spring({ frame: frame - dropStart - 14, fps, config: { damping: 10 } }) : 0;

  const MOD_Y = 390;
  // "3" is the 17th of 17 monospace chars (~36px each) in a line centred on x=960
  const resultX = 960 + 8 * 36;
  const dropX = interpolate(drop, [0, 1], [resultX, cx(3)]);
  const dropY = interpolate(drop, [0, 1], [MOD_Y, BUCKET_TOP + 20]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, fontFamily: fonts.sans, color: colors.text }}>
      <HashBox x={BOX_X} y={BOX_Y} pulse={pulse} opacity={boxIn} scale={0.9 + 0.1 * boxIn} />

      {/* The key "Alice" */}
      <div
        style={{
          position: "absolute",
          left: keyX - 200,
          top: BOX_Y - 40,
          width: 200,
          textAlign: "right",
          fontFamily: fonts.mono,
          fontSize: 64,
          fontWeight: 700,
          color: colors.key,
          opacity: keyOpacity,
        }}
      >
        "Alice"
      </div>

      {/* Output number */}
      <div
        style={{
          position: "absolute",
          left: BOX_X + HASH_W / 2 + 40,
          top: BOX_Y - 44,
          fontFamily: fonts.mono,
          fontSize: 72,
          fontWeight: 700,
          color: colors.hash,
          opacity: numIn,
          transform: `translateX(${(1 - numIn) * -40}px)`,
        }}
      >
        2,083,571
      </div>

      {/* Modulo line */}
      <div
        style={{
          position: "absolute",
          top: MOD_Y - 40,
          width: "100%",
          textAlign: "center",
          fontFamily: fonts.mono,
          fontSize: 60,
          color: colors.text,
          whiteSpace: "pre",
        }}
      >
        {modText.slice(0, typed)}
        <span style={{ opacity: 0 }}>{modText.slice(typed)}</span>
        <span
          style={{
            display: "inline-block",
            color: colors.filled,
            fontWeight: 700,
            opacity: resultIn,
            transform: `scale(${resultIn})`,
          }}
        >
          3
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: MOD_Y + 50,
          width: "100%",
          textAlign: "center",
          fontSize: 30,
          color: colors.muted,
          opacity: interpolate(frame, [modStart + 30, modStart + 45], [0, 1], clamp),
        }}
      >
        modulo the array size → an index from 0 to 7
      </div>

      <Buckets highlight={landed ? 3 : null} pulse={bucketPulse} entries={landed ? [[], [], [], [{ key: '"Alice"' }]] : []} />

      {/* Flying copy of the 3 */}
      {frame >= dropStart && !landed ? (
        <div
          style={{
            position: "absolute",
            left: dropX - 20,
            top: dropY - 40,
            fontFamily: fonts.mono,
            fontSize: 64,
            fontWeight: 700,
            color: colors.filled,
          }}
        >
          3
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
