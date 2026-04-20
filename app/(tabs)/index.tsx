import { OnThisDay } from "@/components/OnThisDay";
import { Text } from "@/components/ui/Text";
import { Fonts, FontSizes, Radii, Spacing } from "@/constants/theme";
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
  const monthDay = `${month} ${format(today, "d", { locale })}`;
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
          { paddingTop: insets.top + Spacing[6] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Date header */}
        <View style={styles.header}>
          <Text
            variant="caption"
            style={[styles.dayOfWeek, { color: theme.textTertiary }]}
          >
            {dayOfWeek}
          </Text>
          <View style={styles.dateRow}>
            <Text
              style={[
                styles.monthDay,
                { color: theme.text, fontFamily: Fonts.serif },
              ]}
            >
              {monthDay}
            </Text>
            <Text
              variant="label"
              style={[styles.year, { color: theme.textSecondary }]}
            >
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
                  <Text
                    variant="label"
                    style={{ color: active ? theme.text : theme.textTertiary }}
                  >
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
            { backgroundColor: theme.surface, shadowColor: theme.text },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.text,
                fontFamily: Fonts.serif,
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
                  <Text variant="caption" style={{ color: theme.positive }}>
                    {t("today.saved")}
                  </Text>
                </Animated.View>
              )}
            </View>
            {(isNearLimit || activeText.length > 0) && (
              <Text variant="caption" style={{ color: charCountColor }}>
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
  header: { marginBottom: Spacing[7] },
  dayOfWeek: { letterSpacing: 1.5, marginBottom: Spacing[1] },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  monthDay: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "400",
    letterSpacing: -0.5,
  },
  year: { fontSize: FontSizes.base, opacity: 0.6 },
  accentLine: { width: 28, height: 2, borderRadius: 1 },
  segmented: {
    flexDirection: "row",
    borderRadius: Radii.lg,
    padding: 3,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  input: {
    minHeight: 140,
    padding: Spacing[5],
    paddingTop: Spacing[5],
    lineHeight: 28,
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
