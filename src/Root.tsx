import { Composition } from "remotion";
import { HashMapVideo, totalFrames } from "./Video";
import { FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="HashMap"
    component={HashMapVideo}
    durationInFrames={totalFrames}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
