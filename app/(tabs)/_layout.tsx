import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { Fonts } from "@/constants/theme";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.tabItem}>
      <Text
        style={[
          styles.tabText,
          { color: focused ? theme.tint : theme.tabIconDefault },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.line,
          { backgroundColor: focused ? theme.tint : "transparent" },
        ]}
      />
    </View>
  );
}

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useT();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 0,
          shadowOpacity: 0,
          height: 56 + insets.bottom,
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
            <TabLabel label={t("tabs.today")} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel label={t("tabs.entries")} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabLabel label={t("tabs.settings")} focused={focused} />
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
    gap: 5,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.sans,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  line: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },
});
