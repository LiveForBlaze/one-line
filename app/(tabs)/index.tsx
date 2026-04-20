import { OnThisDay } from "@/components/OnThisDay";
import { Text } from "@/components/ui/Text";
import { FontSizes, Radii, Spacing } from "@/constants/theme";
import type { EntryKind } from "@/db/types";
import { useDateLocale } from "@/hooks/useDateLocale";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useEntriesStore } from "@/store/entries";
import { format } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SOFT_LIMIT = 200;

export default function TodayScreen() {
  const theme = useTheme();
  const locale = useDateLocale();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const {
    todayCommon,
    todayPrivate,
    onThisDay,
    loadToday,
    loadOnThisDay,
    saveEntry,
  } = useEntriesStore();
  const { isPrivateModeOn } = useAuthStore();

  const [activeKind, setActiveKind] = useState<EntryKind>("common");
  const [commonText, setCommonText] = useState("");
  const [privateText, setPrivateText] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = new Date();
  const dayOfWeek = format(today, "EEEE", { locale }).toUpperCase();
  const monthRaw = format(today, "LLLL", { locale });
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
  const dayOfMonth = format(today, "d", { locale });
  const year = format(today, "yyyy", { locale });

  // Reset to common tab when leaving private mode
  useEffect(() => {
    if (!isPrivateModeOn) setActiveKind("common");
  }, [isPrivateModeOn]);

  useFocusEffect(
    useCallback(() => {
      const currentDate = new Date();
      loadToday();
      loadOnThisDay(currentDate, isPrivateModeOn);
    }, [isPrivateModeOn, loadOnThisDay, loadToday]),
  );

  useEffect(() => {
    setCommonText(todayCommon?.text ?? "");
  }, [todayCommon]);

  useEffect(() => {
    setPrivateText(todayPrivate?.text ?? "");
  }, [todayPrivate]);

  const activeText = activeKind === "common" ? commonText : privateText;
  const setActiveText =
    activeKind === "common" ? setCommonText : setPrivateText;

  const triggerSave = useCallback(
    (kind: EntryKind, text: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveEntry(text, kind);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
      }, 600);
    },
    [saveEntry],
  );

  const handleChangeText = useCallback(
    (val: string) => {
      setActiveText(val);
      setIsSaved(false);
      triggerSave(activeKind, val);
    },
    [activeKind, setActiveText, triggerSave],
  );

  const isNearLimit = activeText.length >= SOFT_LIMIT - 20;
  const isOverLimit = activeText.length > SOFT_LIMIT;
  const charCountColor = isOverLimit
    ? theme.challenging
    : isNearLimit
      ? theme.tint
      : theme.textTertiary;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={20}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + Spacing[7] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={styles.header}>
          <View
            style={[styles.dayOfWeekBadge, { backgroundColor: theme.surfaceElevated }]}
          >
            <Text type="overline" variant="tertiary" style={styles.dayOfWeek}>
              {dayOfWeek}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <Text type="display" style={styles.monthDay}>
              <Text type="display" variant="accent" style={styles.monthAccent}>
                {month}
              </Text>{" "}
              <Text type="display" style={styles.dayAccent}>
                {dayOfMonth}
              </Text>
            </Text>
            <Text type="text" variant="secondary" style={styles.year}>
              {year}
            </Text>
          </View>
          <View style={[styles.accentLine, { backgroundColor: theme.tint }]} />
        </View>

        {/* Segmented control — only visible in Private Mode */}
        {isPrivateModeOn && (
          <View
            style={[
              styles.segmented,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            {(["common", "private"] as EntryKind[]).map((kind) => {
              const active = activeKind === kind;
              return (
                <Pressable
                  key={kind}
                  onPress={() => setActiveKind(kind)}
                  style={[
                    styles.segBtn,
                    active && { backgroundColor: theme.surface },
                  ]}
                >
                  <Text type="label" variant={active ? "primary" : "tertiary"}>
                    {kind === "common" ? t("today.common") : t("today.private")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Entry card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              shadowColor: theme.text,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.cardHeading}>
            <Text type="overline" variant="tertiary">
              {activeKind === "common" ? t("today.common") : t("today.private")}
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                fontSize: FontSizes.md,
              },
            ]}
            value={activeText}
            onChangeText={handleChangeText}
            placeholder={t("today.placeholder")}
            placeholderTextColor={theme.textTertiary}
            multiline
            maxLength={500}
            textAlignVertical="top"
            scrollEnabled={false}
            autoCorrect
            autoCapitalize="sentences"
          />

          <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
            <View style={styles.statusRow}>
              {isSaved && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(300)}
                >
                  <Text type="caption" variant="positive">
                    {t("today.saved")}
                  </Text>
                </Animated.View>
              )}
            </View>
            {(isNearLimit || activeText.length > 0) && (
              <Text type="caption" color={charCountColor}>
                {activeText.length}
                {isOverLimit ? `\u202F/\u202F${SOFT_LIMIT}` : ""}
              </Text>
            )}
          </View>
        </View>

        <OnThisDay entries={onThisDay} isPrivateModeOn={isPrivateModeOn} />

        <View style={{ height: insets.bottom + Spacing[8] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: Spacing[5] },
  header: { marginBottom: Spacing[8] },
  dayOfWeekBadge: {
    alignSelf: "flex-start",
    borderRadius: Radii.full,
    paddingHorizontal: Spacing[2],
    paddingVertical: 6,
    marginBottom: Spacing[2],
  },
  dayOfWeek: { letterSpacing: 1.6 },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing[2],
    flexWrap: "wrap",
    marginBottom: Spacing[3],
  },
  monthDay: { fontSize: 30, lineHeight: 36, letterSpacing: -1.1 },
  monthAccent: {
    fontWeight: "600",
    letterSpacing: -0.8,
  },
  dayAccent: { fontWeight: "400" },
  year: { opacity: 0.6 },
  accentLine: { width: 40, height: 3, borderRadius: 999 },
  segmented: {
    flexDirection: "row",
    borderRadius: Radii.lg,
    padding: 4,
    marginBottom: Spacing[4],
  },
  segBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing[2],
    borderRadius: Radii.md,
  },
  card: {
    borderRadius: Radii.xl,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  cardHeading: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[1],
  },
  input: {
    minHeight: 168,
    padding: Spacing[5],
    paddingTop: Spacing[4],
    lineHeight: 29,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
  },
});
