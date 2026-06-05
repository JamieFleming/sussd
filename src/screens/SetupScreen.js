import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "../ThemeContext";
import { spacing, radius } from "../theme";
import { createGame } from "../utils/gameLogic";
import { CATEGORIES } from "../data/wordSets";

const RED = "#DC2626";

const DEFAULT_NAMES = (count) =>
  Array.from({ length: count }, (_, i) => `Player ${i + 1}`);

export default function SetupScreen({
  navigate,
  settings,
  customWords,
  lastPlayers,
  lastCategories,
  lastImposterChoice,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [playerCount, setPlayerCount] = useState(lastPlayers?.length ?? 6);
  const [names, setNames] = useState(lastPlayers ?? DEFAULT_NAMES(6));
  const [selectedCategories, setSelectedCategories] = useState(lastCategories ?? ["all"]);
  const [imposterChoice, setImposterChoice] = useState(lastImposterChoice ?? "random");

  // When child-friendly mode is toggled on, drop any non-child-friendly selections
  useEffect(() => {
    if (settings.childFriendly) {
      setSelectedCategories((prev) => {
        const safe = prev.filter((id) => {
          if (id === "all") return true;
          const cat = CATEGORIES.find((c) => c.id === id);
          return cat?.childFriendly;
        });
        return safe.length > 0 ? safe : ["all"];
      });
    }
  }, [settings.childFriendly]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const changeCount = async (delta) => {
    const next = playerCount + delta;
    if (next < 3 || next > 8) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.75,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
    setNames((prev) => {
      if (next > prev.length) {
        return [
          ...prev,
          ...Array.from(
            { length: next - prev.length },
            (_, i) => `Player ${prev.length + i + 1}`,
          ),
        ];
      }
      return prev.slice(0, next);
    });
    setPlayerCount(next);
  };

  const updateName = (index, value) => {
    setNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removePlayer = async (index) => {
    if (playerCount <= 3) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNames((prev) => prev.filter((_, i) => i !== index));
    setPlayerCount((prev) => prev - 1);
  };

  const toggleCategory = async (catId) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (catId === "all" || catId === "custom") {
      setSelectedCategories([catId]);
      return;
    }
    setSelectedCategories((prev) => {
      const current = prev.filter((c) => c !== "all" && c !== "custom");
      if (current.includes(catId)) {
        const next = current.filter((c) => c !== catId);
        return next.length === 0 ? ["all"] : next;
      }
      return [...current, catId];
    });
  };

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const isCustomCategory = selectedCategories.includes("custom");
    const categories = settings.categoriesEnabled ? selectedCategories : ["all"];
    // Child-friendly mode: never include custom words (content unverified)
    const customPool = settings.childFriendly
      ? []
      : !settings.categoriesEnabled
        ? customWords
        : isCustomCategory
          ? customWords
          : settings.customWordsEnabled
            ? customWords
            : [];
    navigate("playerReveal", {
      ...createGame(playerCount, names, categories, customPool, imposterChoice, settings.childFriendly),
      savedCategories: selectedCategories,
      savedImposterChoice: imposterChoice,
    });
  };

  return (
    <LinearGradient colors={colors.gradientMain} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => navigate("home")}
              style={styles.back}>
              <Text style={styles.backText}>← BACK</Text>
            </TouchableOpacity>

            {/* Child-friendly badge */}
            {settings.childFriendly && (
              <View style={styles.childBadge}>
                <Text style={styles.childBadgeText}>🧒 CHILD FRIENDLY MODE</Text>
              </View>
            )}

            {/* Player count */}
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  playerCount <= 3 && styles.counterBtnDisabled,
                ]}
                onPress={() => changeCount(-1)}
                activeOpacity={0.7}>
                <Text style={styles.counterBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.counterCenter}>
                <Animated.Text
                  style={[
                    styles.counterValue,
                    { transform: [{ scale: scaleAnim }] },
                  ]}>
                  {playerCount}
                </Animated.Text>
                <Text style={styles.counterLabel}>PLAYERS</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.counterBtn,
                  playerCount >= 8 && styles.counterBtnDisabled,
                ]}
                onPress={() => changeCount(1)}
                activeOpacity={0.7}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Imposter count picker — 5+ players only */}
            <Text style={styles.sectionLabelTop}>IMPOSTERS</Text>
            {playerCount >= 5 ? (
              <View style={styles.imposterRow}>
                {[
                  { id: "1", label: "1" },
                  { id: "2", label: "2" },
                  { id: "random", label: "RANDOM" },
                ].map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.imposterPill,
                      imposterChoice === opt.id && styles.imposterPillActive,
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setImposterChoice(opt.id);
                    }}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.imposterPillText,
                        imposterChoice === opt.id && styles.imposterPillTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.imposterRow}>
                <View style={[styles.imposterPill, styles.imposterPillActive]}>
                  <Text style={[styles.imposterPillText, styles.imposterPillTextActive]}>1</Text>
                </View>
              </View>
            )}

            {/* Category picker — only shown when categories are enabled */}
            {settings.categoriesEnabled && (
              <View style={styles.categorySection}>
                <Text style={styles.sectionLabel}>CATEGORY</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={true}
                  contentContainerStyle={styles.categoryRow}>
                  {/* In child-friendly mode show All plus child-safe categories */}
                  {CATEGORIES.filter((cat) =>
                    settings.childFriendly
                      ? cat.id === "all" || (cat.childFriendly && !cat.locked)
                      : true
                  ).map((cat) =>
                    cat.locked ? (
                      <View key={cat.id} style={[styles.categoryPill, styles.categoryPillLocked]}>
                        <Text style={[styles.categoryPillText, styles.categoryPillTextLocked]}>
                          {cat.label}
                        </Text>
                        <Text style={styles.lockIcon}>🔒</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryPill,
                          selectedCategories.includes(cat.id) &&
                            styles.categoryPillActive,
                        ]}
                        onPress={() => toggleCategory(cat.id)}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.categoryPillText,
                            selectedCategories.includes(cat.id) &&
                              styles.categoryPillTextActive,
                          ]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}

                  {/* MY WORDS — hidden in child-friendly mode */}
                  {!settings.childFriendly && customWords.length > 0 && (
                    <TouchableOpacity
                      style={[
                        styles.categoryPill,
                        selectedCategories.includes("custom") &&
                          styles.categoryPillActive,
                      ]}
                      onPress={() => toggleCategory("custom")}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          styles.categoryPillText,
                          selectedCategories.includes("custom") &&
                            styles.categoryPillTextActive,
                        ]}>
                        MY WORDS
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </View>
            )}

            {/* Player names */}
            <Text style={styles.sectionLabel}>PLAYER NAMES</Text>
            <ScrollView
              style={styles.namesList}
              contentContainerStyle={styles.namesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              {names.map((name, i) => (
                <View key={i} style={styles.nameRow}>
                  <View style={styles.nameIndex}>
                    <Text style={styles.nameIndexText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.nameInput}
                    value={name}
                    onChangeText={(v) => updateName(i, v)}
                    placeholder={`Player ${i + 1}`}
                    placeholderTextColor={colors.textMuted}
                    maxLength={20}
                    returnKeyType="done"
                    selectionColor={RED}
                  />
                  <TouchableOpacity
                    style={[styles.removeBtn, playerCount <= 3 && styles.removeBtnDisabled]}
                    onPress={() => removePlayer(i)}
                    activeOpacity={0.6}
                    disabled={playerCount <= 3}>
                    <Text style={styles.removeBtnText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity onPress={handleStart} activeOpacity={0.85}>
              <LinearGradient
                colors={["#DC2626", "#B91C1C"]}
                style={styles.startBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.startBtnText}>LET'S PLAY</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getStyles(c) {
  return StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    kav: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
    },
    back: { paddingVertical: spacing.sm },
    backText: {
      color: c.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 1,
    },
    childBadge: {
      alignSelf: "center",
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      backgroundColor: "rgba(16,185,129,0.12)",
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: "rgba(16,185,129,0.4)",
    },
    childBadgeText: {
      color: "#10B981",
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
    },
    counterRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      gap: spacing.xl,
    },
    counterBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    counterBtnDisabled: { opacity: 0.25 },
    counterBtnText: {
      color: c.text,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "300",
    },
    counterCenter: { alignItems: "center" },
    counterValue: {
      color: c.text,
      fontSize: 72,
      fontWeight: "900",
      letterSpacing: -3,
      lineHeight: 76,
    },
    counterLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 4,
      marginTop: -4,
    },
    sectionLabelTop: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      alignSelf: "center",
    },
    imposterRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.sm,
    },
    imposterPill: {
      paddingHorizontal: spacing.lg,
      paddingVertical: 10,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
      minWidth: 72,
      alignItems: "center",
    },
    imposterPillActive: {
      borderColor: RED,
      backgroundColor: RED,
    },
    imposterPillText: {
      color: c.textSecondary,
      fontSize: 14,
      fontWeight: "700",
      letterSpacing: 1,
    },
    imposterPillTextActive: { color: "#FFFFFF" },
    categorySection: { marginTop: spacing.lg },
    sectionLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 4,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    categoryRow: { gap: spacing.sm, paddingRight: spacing.lg },
    categoryPill: {
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.surface,
    },
    categoryPillActive: {
      borderColor: RED,
      backgroundColor: RED,
    },
    categoryPillText: {
      color: c.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    categoryPillTextActive: { color: "#FFFFFF" },
    categoryPillLocked: {
      opacity: 0.4,
      flexDirection: "row",
      gap: 5,
    },
    categoryPillTextLocked: {
      color: c.textMuted,
    },
    lockIcon: {
      fontSize: 11,
    },
    namesList: { flex: 1 },
    namesContent: { gap: spacing.sm, paddingBottom: spacing.md },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    nameIndex: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(220,38,38,0.25)",
      borderWidth: 1,
      borderColor: "rgba(220,38,38,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    nameIndexText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "800",
    },
    nameInput: {
      flex: 1,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      color: c.text,
      fontSize: 16,
      fontWeight: "500",
    },
    removeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
    },
    removeBtnDisabled: { opacity: 0.2 },
    removeBtnText: {
      color: c.textSecondary,
      fontSize: 20,
      fontWeight: "300",
      lineHeight: 24,
      marginTop: -1,
    },
    startBtn: {
      paddingVertical: 20,
      alignItems: "center",
      borderRadius: radius.lg,
      marginTop: spacing.md,
    },
    startBtnText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 2,
    },
  });
}
