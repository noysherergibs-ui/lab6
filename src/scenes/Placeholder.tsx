import { AbsoluteFill } from "remotion";
import { colors, fonts } from "../theme";

export const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <AbsoluteFill
    style={{
      backgroundColor: colors.bg,
      color: colors.muted,
      fontFamily: fonts.sans,
      fontSize: 64,
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {label} (not built yet)
  </AbsoluteFill>
);
