import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import timing from "./timing.json";
import { colors, FPS } from "./theme";
import { Placeholder } from "./scenes/Placeholder";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Array } from "./scenes/Scene2Array";

// Each scene lives in its own file. Swap a Placeholder for the real scene when it is built.
const sceneComponents: Record<string, React.FC> = {
  scene1: Scene1Problem,
  scene2: Scene2Array,
};

export const sceneFrames = (seconds: number) => Math.ceil(seconds * FPS);

export const totalFrames = timing.scenes.reduce((sum, s) => sum + sceneFrames(s.seconds), 0);

export const HashMapVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: colors.bg }}>
    <Series>
      {timing.scenes.map((s) => {
        const Scene = sceneComponents[s.id];
        return (
          <Series.Sequence key={s.id} durationInFrames={sceneFrames(s.seconds)} name={s.id}>
            {Scene ? <Scene /> : <Placeholder label={s.id} />}
            {s.audio ? <Audio src={staticFile(`audio/${s.id}.wav`)} /> : null}
          </Series.Sequence>
        );
      })}
    </Series>
  </AbsoluteFill>
);
