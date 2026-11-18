import { AbsoluteFill, Audio, Series, staticFile } from "remotion";
import timing from "./timing.json";
import { colors, FPS } from "./theme";
import { Placeholder } from "./scenes/Placeholder";
import { Scene1Problem } from "./scenes/Scene1Problem";
import { Scene2Array } from "./scenes/Scene2Array";
import { Scene3Hash } from "./scenes/Scene3Hash";
import { Scene4PutGet } from "./scenes/Scene4PutGet";
import { Scene5Collision } from "./scenes/Scene5Collision";
import { Scene6Resize } from "./scenes/Scene6Resize";
import { Scene7WhyItMatters } from "./scenes/Scene7WhyItMatters";

// Each scene lives in its own file. Swap a Placeholder for the real scene when it is built.
const sceneComponents: Record<string, React.FC> = {
  scene1: Scene1Problem,
  scene2: Scene2Array,
  scene3: Scene3Hash,
  scene4: Scene4PutGet,
  scene5: Scene5Collision,
  scene6: Scene6Resize,
  scene7: Scene7WhyItMatters,
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
