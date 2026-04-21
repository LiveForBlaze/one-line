import { OnThisDay } from "@/components/OnThisDay";
import { AccentLine } from "@/components/ui/AccentLine";
import { Text } from "@/components/ui/Text";
import { FontSizes, Radii, Spacing } from "@/constants/theme";
import { normalizeMoodScore, type EntryKind, type MoodScore } from "@/db/types";
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
const MOOD_OPTIONS: MoodScore[] = [-3, -2, -1, 0, 1, 2, 3];

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
  const [commonMood, setCommonMood] = useState<MoodScore | null>(null);
  const [privateMood, setPrivateMood] = useState<MoodScore | null>(null);
  const [isSaving, setIsSaving] = useState(false);
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
    setCommonMood(normalizeMoodScore(todayCommon?.mood_score ?? null));
  }, [todayCommon]);

  useEffect(() => {
    setPrivateText(todayPrivate?.text ?? "");
    setPrivateMood(normalizeMoodScore(todayPrivate?.mood_score ?? null));
  }, [todayPrivate]);

  const activeText = activeKind === "common" ? commonText : privateText;
  const setActiveText =
    activeKind === "common" ? setCommonText : setPrivateText;
  const activeMood = activeKind === "common" ? commonMood : privateMood;
  const setActiveMood = activeKind === "common" ? setCommonMood : setPrivateMood;

  const triggerSave = useCallback(
    (kind: EntryKind, text: string, moodScore: MoodScore | null) => {
      setIsSaving(true);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveEntry(text, kind, moodScore);
        setIsSaving(false);
      }, 600);
    },
    [saveEntry],
  );

  const handleChangeText = useCallback(
    (val: string) => {
      setActiveText(val);
      triggerSave(activeKind, val, activeMood);
    },
    [activeKind, activeMood, setActiveText, triggerSave],
  );

  const handleMoodSelect = useCallback(
    (mood: MoodScore) => {
      const nextMood = activeMood === mood ? null : mood;
      setActiveMood(nextMood);
      triggerSave(activeKind, activeText, nextMood);
    },
    [activeKind, activeMood, activeText, setActiveMood, triggerSave],
  );

  const getMoodChipColors = useCallback(
    (score: MoodScore) => {
      if (score > 0) {
        return {
          backgroundColor: theme.positiveBackground,
          borderColor: theme.positive,
          textColor: theme.positive,
        };
      }

      if (score < 0) {
        return {
          backgroundColor: theme.challengingBackground,
          borderColor: theme.challenging,
          textColor: theme.challenging,
        };
      }

      return {
        backgroundColor: theme.surfaceElevated,
        borderColor: theme.borderStrong,
        textColor: theme.textSecondary,
      };
    },
    [
      theme.borderStrong,
      theme.challenging,
      theme.challengingBackground,
      theme.positive,
      theme.positiveBackground,
      theme.surfaceElevated,
      theme.textSecondary,
    ],
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
          { paddingTop: insets.top + Spacing[5] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text variant="header">{t("tabs.today")}</Text>
          <AccentLine />
        </View>

        {/* Date */}
        <View style={styles.header}>
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
          <Text type="overline" variant="tertiary" style={styles.dayOfWeek}>
            {dayOfWeek}
          </Text>
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

          {(isNearLimit || activeText.length > 0) && (
            <View style={styles.charCountRow}>
              <Text type="caption" color={charCountColor}>
                {activeText.length}
                {`\u202F/\u202F${SOFT_LIMIT}`}
              </Text>
            </View>
          )}

          <View
            style={[
              styles.moodSection,
              {
                backgroundColor: theme.surfaceElevated,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.moodLegendRow}>
              <Text type="caption" variant="tertiary" style={styles.moodLegendSide}>
                {t("today.moodLow")}
              </Text>
              <Text type="caption" variant="secondary" style={styles.moodLabel}>
                {t("today.mood")}
              </Text>
              <Text type="caption" variant="tertiary" style={[styles.moodLegendSide, { textAlign: "right" }]}>
                {t("today.moodHigh")}
              </Text>
            </View>
            <View style={styles.moodRow}>
              {MOOD_OPTIONS.map((score) => {
                const selected = activeMood === score;
                const colors = getMoodChipColors(score);

                return (
                  <Pressable
                    key={score}
                    onPress={() => handleMoodSelect(score)}
                    style={({ pressed }) => [
                      styles.moodChip,
                      {
                        backgroundColor: selected ? colors.backgroundColor : theme.surface,
                        borderColor: selected ? colors.borderColor : theme.border,
                        opacity: pressed ? 0.72 : 1,
                      },
                    ]}
                  >
                    <Text
                      type="label"
                      style={{ color: selected ? colors.textColor : theme.textSecondary }}
                    >
                      {score > 0 ? `+${score}` : `${score}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.savedRow}>
          {isSaving ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(300)}
            >
              <Text type="caption" variant="tertiary">
                {t("today.saving")}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.savedPlaceholder} />
          )}
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
  pageHeader: { marginBottom: Spacing[5] },
  header: { marginBottom: Spacing[8] },
  dayOfWeek: { letterSpacing: 1.6 },
  dateRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing[1],
    flexWrap: "wrap",
    marginBottom: Spacing[1],
  },
  monthDay: { fontSize: 36, lineHeight: 42, letterSpacing: -1.4 },
  monthAccent: {
    fontWeight: "700",
    letterSpacing: -1.0,
  },
  dayAccent: { fontWeight: "700" },
  year: { opacity: 0.45 },
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
  moodSection: {
    marginHorizontal: Spacing[3],
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[2],
    gap: Spacing[1],
    borderRadius: Radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  moodLabel: {
    letterSpacing: 0.2,
    textAlign: "center",
    flex: 1,
  },
  moodRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "nowrap",
  },
  moodLegendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 2,
  },
  moodLegendSide: {
    flex: 1,
  },
  moodChip: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    minHeight: 168,
    padding: Spacing[5],
    paddingTop: 0,
    lineHeight: 29,
  },
  charCountRow: {
    alignItems: "flex-end",
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[1],
  },
  savedRow: {
    minHeight: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[1],
  },
  savedPlaceholder: {
    height: 16,
  },
});
