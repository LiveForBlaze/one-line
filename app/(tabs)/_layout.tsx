import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

import { HapticTab } from "@/components/haptic-tab";
import { Text } from "@/components/ui/Text";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function TabItem({
  label,
  focused,
  icon,
  iconFocused,
}: {
  label: string;
  focused: boolean;
  icon: IoniconName;
  iconFocused: IoniconName;
}) {
  const theme = useTheme();
  const color = focused ? theme.tint : theme.tabIconDefault;
  return (
    <View style={styles.tabItem}>
      <Ionicons name={focused ? iconFocused : icon} size={22} color={color} />
      <Text type="label" style={[styles.tabText, { color }]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const isDark = theme.background === "#161411";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarBackground: () =>
          Platform.OS === "android" && Platform.Version < 31 ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "rgba(22,20,17,0.92)" : "rgba(246,241,232,0.92)" }]} />
          ) : (
            <BlurView
              intensity={60}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ),
        tabBarStyle: {
          backgroundColor: "transparent",
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
          position: "absolute",
          height: 62 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarIconStyle: {
          width: "100%",
          height: "100%",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              label={t("tabs.today")}
              focused={focused}
              icon="calendar-outline"
              iconFocused="calendar"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              label={t("tabs.entries")}
              focused={focused}
              icon="book-outline"
              iconFocused="book"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              label={t("tabs.settings")}
              focused={focused}
              icon="settings-outline"
              iconFocused="settings"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabText: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
});
