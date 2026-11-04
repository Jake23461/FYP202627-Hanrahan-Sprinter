import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TopBar } from "../../components/TopBar";
import { borders, colors, fonts, fontSizes, letterSpacing } from "../../theme";

const TAB_BAR_HEIGHT = 60;
const ICON_SIZE = 14;
const INDICATOR_WIDTH = 64;
// How far the active rule sits above the icon, so it touches the tab bar's top edge.
const INDICATOR_OFFSET = 12;

// The active tab gets a filled square and a rule along the top of the bar.
function TabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.iconSlot}>
      {focused && <View style={styles.indicator} />}
      <View style={[styles.icon, focused && styles.iconFocused]} />
    </View>
  );
}

function TabLabel({ title, focused }: { title: string; focused: boolean }) {
  return (
    <Text style={[styles.label, focused && styles.labelFocused]}>{title}</Text>
  );
}

function tabOptions(title: string) {
  return {
    title,
    tabBarIcon: TabIcon,
    tabBarLabel: ({ focused }: { focused: boolean }) => (
      <TabLabel title={title} focused={focused} />
    ),
  };
}

export default function TabsLayout() {
  // Setting a height replaces the default one, so the home indicator space has
  // to be added back by hand.
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        sceneStyle: styles.scene,
        tabBarStyle: [
          styles.tabBar,
          { height: TAB_BAR_HEIGHT + insets.bottom },
        ],
      }}
    >
      <Tabs.Screen name="index" options={tabOptions("TRAIN")} />
      <Tabs.Screen name="log" options={tabOptions("LOG")} />
      <Tabs.Screen name="squad/index" options={tabOptions("SQUAD")} />
      <Tabs.Screen name="film/index" options={tabOptions("FILM")} />
      <Tabs.Screen name="profile/index" options={tabOptions("PROFILE")} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.paper,
  },
  tabBar: {
    backgroundColor: colors.paper,
    borderColor: colors.ink,
    borderTopWidth: borders.rule,
  },
  iconSlot: {
    alignItems: "center",
    height: ICON_SIZE,
    justifyContent: "center",
    width: ICON_SIZE,
  },
  indicator: {
    backgroundColor: colors.accent,
    height: borders.tabIndicator,
    position: "absolute",
    top: -INDICATOR_OFFSET,
    width: INDICATOR_WIDTH,
  },
  icon: {
    borderColor: colors.muted,
    borderWidth: borders.width,
    height: ICON_SIZE,
    width: ICON_SIZE,
  },
  iconFocused: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    color: colors.muted,
    fontFamily: fonts.monoBold,
    fontSize: fontSizes.tab,
    letterSpacing: letterSpacing.label,
  },
  labelFocused: {
    color: colors.ink,
  },
});
