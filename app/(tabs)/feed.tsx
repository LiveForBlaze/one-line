import { EntryCard } from "@/components/EntryCard";
import { MonthSeparator } from "@/components/MonthSeparator";
import { Text } from "@/components/ui/Text";
import { Radii, Spacing } from "@/constants/theme";
import type { Entry } from "@/db/types";
import { useDateLocale } from "@/hooks/useDateLocale";
import { useT } from "@/hooks/useT";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth";
import { useEntriesStore } from "@/store/entries";
import { format, parseISO } from "date-fns";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FilterKind = "all" | "common" | "private";

type ListItem =
  | { type: "month"; key: string; month: string }
  | { type: "entry"; key: string; entry: Entry };

export default function FeedScreen() {
  const theme = useTheme();
  const locale = useDateLocale();
  const insets = useSafeAreaInsets();
  const { t } = useT();
  const { entries, searchResults, load, search, clearSearch } =
    useEntriesStore();
  const { isPrivateModeOn } = useAuthStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKind>("all");
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  useFocusEffect(
    useCallback(() => {
      load(isPrivateModeOn);
      if (!isPrivateModeOn) setFilter("all");
    }, [isPrivateModeOn, load]),
  );

  const searchKind = isPrivateModeOn ? filter : "common";

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      search(text, searchKind);
    },
    [search, searchKind],
  );

  useEffect(() => {
    if (query.trim()) search(query, searchKind);
  }, [query, search, searchKind]);

  const handleClearSearch = useCallback(() => {
    setQuery("");
    clearSearch();
  }, [clearSearch]);

  const displayEntries = useMemo(() => {
    if (searchResults) return searchResults;
    if (!isPrivateModeOn || filter === "all") return entries;
    return entries.filter((e) => e.kind === filter);
  }, [searchResults, entries, isPrivateModeOn, filter]);

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    let lastMonth = "";
    for (const entry of displayEntries) {
      const month = entry.date.slice(0, 7);
      if (month !== lastMonth && !searchResults) {
        items.push({
          type: "month",
          key: `month-${month}-${entry.kind}`,
          month: entry.date,
        });
        lastMonth = month;
      }
      items.push({
        type: "entry",
        key: `entry-${entry.date}-${entry.kind}`,
        entry,
      });
    }
    return items;
  }, [displayEntries, searchResults]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      if (item.type === "month") return <MonthSeparator dateStr={item.month} />;
      return (
        <EntryCard
          entry={item.entry}
          isPrivateModeOn={isPrivateModeOn}
          onPress={() => setSelectedEntry(item.entry)}
        />
      );
    },
    [isPrivateModeOn],
  );

  const FILTERS: { key: FilterKind; label: string }[] = [
    { key: "all", label: t("feed.filterAll") },
    { key: "common", label: t("feed.filterCommon") },
    { key: "private", label: t("feed.filterPrivate") },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            paddingTop: insets.top + Spacing[2],
          },
        ]}
      >
        <View style={styles.searchRow}>
          <TextInput
            style={[
              styles.searchInput,
              {
                color: theme.text,
              },
            ]}
            value={query}
            onChangeText={handleSearch}
            placeholder={t("feed.search")}
            placeholderTextColor={theme.textTertiary}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={handleClearSearch} style={styles.cancelBtn}>
              <Text type="label" variant="accent">
                {t("feed.cancel")}
              </Text>
            </Pressable>
          )}
        </View>

        {isPrivateModeOn && (
          <View
            style={[
              styles.filterRow,
              { backgroundColor: theme.surfaceElevated },
            ]}
          >
            {FILTERS.map(({ key, label }) => {
              const active = filter === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setFilter(key)}
                  style={[
                    styles.filterBtn,
                    active && { backgroundColor: theme.surface },
                  ]}
                >
                  <Text type="label" variant={active ? "primary" : "tertiary"}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>

      {listData.length === 0 ? (
        <View style={styles.empty}>
          <Text type="text" variant="secondary" style={styles.emptyText}>
            {query ? t("feed.emptySearch") : t("feed.empty")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View
              style={[styles.separator, { backgroundColor: theme.border }]}
            />
          )}
        />
      )}

      {/* Entry detail modal */}
      <Modal
        visible={selectedEntry !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEntry(null)}
        statusBarTranslucent
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setSelectedEntry(null)}
        >
          <View
            style={[styles.backdropBg, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          />
        </Pressable>

        {selectedEntry && (
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.background,
                paddingBottom: insets.bottom + Spacing[6],
              },
            ]}
          >
            {/* Handle */}
            <View style={styles.sheetHandle}>
              <View
                style={[styles.handleBar, { backgroundColor: theme.border }]}
              />
            </View>

            {/* Date */}
            <View style={styles.sheetDateRow}>
              <Text type="header" variant="accent" style={styles.sheetDayNum}>
                {format(parseISO(selectedEntry.date), "d", { locale })}
              </Text>
              <View>
                <Text
                  type="overline"
                  variant="tertiary"
                  style={styles.sheetWeekday}
                >
                  {format(parseISO(selectedEntry.date), "EEEE", {
                    locale,
                  }).toUpperCase()}
                </Text>
                <Text
                  type="text"
                  variant="secondary"
                  style={styles.sheetMonthYear}
                >
                  {(() => {
                    const s = format(
                      parseISO(selectedEntry.date),
                      "LLLL yyyy",
                      { locale },
                    );
                    return s.charAt(0).toUpperCase() + s.slice(1);
                  })()}
                </Text>
              </View>
            </View>

            {/* Full text */}
            <ScrollView
              style={styles.sheetScroll}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <Text type="entry" style={styles.sheetText}>
                {selectedEntry.text || "—"}
              </Text>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing[2],
  },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing[2] },
  searchInput: { flex: 1, height: 38 },
  cancelBtn: { paddingVertical: Spacing[1] },
  filterRow: { flexDirection: "row", borderRadius: Radii.lg, padding: 3 },
  filterBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing[2],
    borderRadius: Radii.md,
  },
  list: { paddingBottom: Spacing[16] },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing[5] + 30 + Spacing[3],
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing[8],
  },
  emptyText: { textAlign: "center", lineHeight: 22 },

  // Sheet
  backdrop: { ...StyleSheet.absoluteFillObject },
  backdropBg: { flex: 1 },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: "75%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  sheetHandle: {
    alignItems: "center",
    paddingTop: Spacing[3],
    paddingBottom: Spacing[2],
  },
  handleBar: { width: 36, height: 4, borderRadius: 2 },
  sheetDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[4],
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[4],
  },
  sheetDayNum: { fontSize: 48, lineHeight: 52, fontWeight: "300" },
  sheetWeekday: { letterSpacing: 1.2 },
  sheetMonthYear: { marginTop: 2 },
  sheetScroll: { paddingHorizontal: Spacing[6] },
  sheetText: { lineHeight: 28, paddingBottom: Spacing[4] },
});
