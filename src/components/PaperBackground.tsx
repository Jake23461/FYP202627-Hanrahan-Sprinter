import type { ReactNode } from "react";
import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { colors } from "../theme";

type PaperBackgroundProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Paper colour with a dot grid on top. The grid is a small transparent tile
// that repeats, and @2x and @3x copies keep the dots sharp on high density screens.
export function PaperBackground({ children, style }: PaperBackgroundProps) {
  return (
    <View style={[styles.paper, style]}>
      <Image
        source={require("../../assets/images/dot-grid.png")}
        resizeMode="repeat"
        style={styles.tile}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  paper: {
    backgroundColor: colors.paper,
  },
  // Without an explicit size the image stays as big as one tile, so nothing repeats.
  tile: {
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
  },
});
