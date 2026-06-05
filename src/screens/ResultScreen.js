import React, { useRef, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "../ThemeContext";
import { spacing, radius } from "../theme";

function WordReveal({ label, value, valueColor }) {
  return (
    <View style={{ alignItems: "center", gap: spacing.xs }}>
      <Text style={{ color: "#9CA3AF", fontSize: 11, fontWeight: "700", letterSpacing: 3 }}>{label}</Text>
      <Text style={{ color: valueColor, fontSize: 30, fontWeight: "900", letterSpacing: -1 }}>{value}</Text>
    </View>
  );
}

function Scoreboard({ sessionScores, styles, colors }) {
  return (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreCardLabel}>SESSION</Text>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreNum}>{sessionScores.innocentsWins}</Text>
          <Text style={styles.scoreItemLabel}>INNOCENTS</Text>
        </View>
        <Text style={styles.scoreVs}>vs</Text>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreNum, { color: colors.danger }]}>
            {sessionScores.imposterWins}
          </Text>
          <Text style={styles.scoreItemLabel}>IMPOSTERS</Text>
        </View>
      </View>
      <Text style={styles.scoreGames}>
        {sessionScores.gamesPlayed} games played
      </Text>
    </View>
  );
}

export default function ResultScreen({
  navigate,
  gameState,
  settings,
  sessionScores,
  onScoreUpdate,
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const {
    voteTarget,
    voteTarget2,
    voteCorrect,
    players,
    normalWord,
    imposterWord,
    votesWrong = 0,
    doubleDown,
    doubleDownCorrect,
  } = gameState;

  const imposters = players.filter((p) => p.isImposter);
  const imposterFullName = imposters.map((p) => p.name).join(" & ");

  // Determine outcome type
  const isDoubleWin =
    voteCorrect && doubleDown === "attempted" && doubleDownCorrect;
  const isBackfired =
    voteCorrect && doubleDown === "attempted" && !doubleDownCorrect;
  const isNormalWin = voteCorrect && (doubleDown === "skip" || !doubleDown);
  const isWin = isNormalWin || isDoubleWin;

  // Wrong vote + only 2 players would remain → imposter automatically wins
  const remainingPlayers = players.filter((p) => p.id !== voteTarget?.id);
  const imposterAutoWin = !isWin && !isBackfired && remainingPlayers.length < 3;

  // Auto-reveal on backfire or auto-win (game is definitively over)
  const [revealed, setRevealed] = useState(isBackfired || imposterAutoWin);
  const [scoreRecorded, setScoreRecorded] = useState(false);

  // Typing animation
  const [displayedName, setDisplayedName] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const wordCardAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(
      isWin || imposterAutoWin
        ? Haptics.NotificationFeedbackType.Success // imposter auto-win is still a definitive end
        : Haptics.NotificationFeedbackType.Error,
    );
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Record score on mount for definitive outcomes
  useEffect(() => {
    if (scoreRecorded) return;
    if (isNormalWin) {
      setScoreRecorded(true);
      onScoreUpdate("innocents", 1);
    } else if (isDoubleWin) {
      setScoreRecorded(true);
      onScoreUpdate("innocents", 2);
    } else if (isBackfired) {
      setScoreRecorded(true);
      onScoreUpdate("imposters", 1);
    } else if (imposterAutoWin) {
      setScoreRecorded(true);
      onScoreUpdate("imposters", 1);
    }
    // Regular wrong vote: stays false until REVEAL is tapped
  }, []);

  // Typing animation (win screens only)
  useEffect(() => {
    if (!isWin) return;
    const target = isDoubleWin
      ? `${voteTarget?.name} & ${voteTarget2?.name}`
      : imposterFullName;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedName(target.slice(0, i));
      if (i >= target.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 70);
    return () => clearInterval(interval);
  }, []);

  // Blinking cursor
  useEffect(() => {
    if (!isWin) return;
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(cursorAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    );
    blink.start();
    return () => blink.stop();
  }, []);

  // Slide up word card after typing
  useEffect(() => {
    if (!typingDone) return;
    Animated.spring(wordCardAnim, {
      toValue: 1,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [typingDone]);

  const handlePlayAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate("discuss", {
      ...gameState,
      players: remainingPlayers,
      votesWrong: votesWrong + 1,
    });
  };

  const handleReveal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!scoreRecorded) {
      setScoreRecorded(true);
      onScoreUpdate("imposters", 1);
    }
    setRevealed(true);
  };

  const handleGoToSetup = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate("setup");
  };

  const handleGoHome = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigate("home");
  };

  const winColor = isDoubleWin ? "#F59E0B" : "#10B981";
  const winLabel = isDoubleWin ? "DOUBLE BUST" : "GOT THEM";
  const winTitle = isDoubleWin ? "UNSTOPPABLE!" : "BUSTED!";

  // ── WIN / DOUBLE WIN ──────────────────────────────────────────────
  if (isWin) {
    return (
      <LinearGradient colors={colors.gradientWin} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.center}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.resultEyebrow}>{winLabel}</Text>
              <Text style={[styles.resultTitle, { color: winColor }]}>
                {winTitle}
              </Text>

              {isDoubleWin && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusBadgeText}>+2 POINTS — BONUS!</Text>
                </View>
              )}

              <View style={styles.typingContainer}>
                <Text style={styles.typingLabel}>
                  {isDoubleWin ? "Both imposters caught:" : "The imposter was"}
                </Text>
                <View style={styles.typingRow}>
                  <Text style={[styles.typingName, { color: winColor }]}>
                    {displayedName}
                  </Text>
                  {!typingDone && (
                    <Animated.Text
                      style={[
                        styles.cursor,
                        { color: winColor, opacity: cursorAnim },
                      ]}>
                      |
                    </Animated.Text>
                  )}
                </View>
              </View>

              <Animated.View
                style={[
                  styles.wordCard,
                  {
                    opacity: wordCardAnim,
                    transform: [
                      {
                        translateY: wordCardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [24, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                <WordReveal
                  label="REAL WORD"
                  value={normalWord}
                  valueColor={colors.text}
                />
                <View style={styles.divider} />
                <WordReveal
                  label="IMPOSTER WORD"
                  value={imposterWord}
                  valueColor={colors.danger}
                />
              </Animated.View>

              {settings.scoreboardEnabled && scoreRecorded && (
                <Scoreboard sessionScores={sessionScores} styles={styles} colors={colors} />
              )}
            </ScrollView>

            <View style={styles.buttonStack}>
              <TouchableOpacity onPress={handleGoToSetup} activeOpacity={0.85}>
                <LinearGradient
                  colors={isDoubleWin ? ["#F59E0B", "#D97706"] : ["#10B981", "#059669"]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.actionBtnText}>PLAY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>END SESSION</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── BACKFIRED ─────────────────────────────────────────────────────
  if (isBackfired) {
    return (
      <LinearGradient colors={colors.gradientLoss} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.center}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.resultEyebrow}>DOUBLE DOWN FAILED</Text>
              <Text style={[styles.resultTitle, { color: colors.danger }]}>
                BACKFIRED!
              </Text>
              <Text style={styles.resultSub}>
                {voteTarget2?.name} was innocent.{"\n"}The imposters escaped!
              </Text>

              <View style={styles.wordCard}>
                <Text style={styles.wordCardRevealLabel}>
                  THE IMPOSTER{imposters.length > 1 ? "S WERE" : " WAS"}
                </Text>
                {imposters.map((p) => (
                  <Text key={p.id} style={styles.revealedName}>
                    {p.name}
                  </Text>
                ))}
                <View style={styles.divider} />
                <WordReveal
                  label="REAL WORD"
                  value={normalWord}
                  valueColor={colors.text}
                />
                <View style={styles.divider} />
                <WordReveal
                  label="IMPOSTER WORD"
                  value={imposterWord}
                  valueColor={colors.danger}
                />
              </View>

              {settings.scoreboardEnabled && scoreRecorded && (
                <Scoreboard sessionScores={sessionScores} styles={styles} colors={colors} />
              )}
            </ScrollView>

            <View style={styles.buttonStack}>
              <TouchableOpacity onPress={handleGoToSetup} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#DC2626", "#B91C1C"]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.actionBtnText}>PLAY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>END SESSION</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── WRONG VOTE (+ IMPOSTER AUTO-WIN) ─────────────────────────────
  return (
    <LinearGradient colors={colors.gradientLoss} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.center}
            showsVerticalScrollIndicator={false}>

            {/* Header changes based on whether auto-win kicked in */}
            {imposterAutoWin ? (
              <>
                <Text style={styles.resultEyebrow}>NOT ENOUGH PLAYERS</Text>
                <Text style={[styles.resultTitle, { color: colors.danger }]}>
                  THEY ESCAPE!
                </Text>
                <Text style={styles.resultSub}>
                  Only 2 players remain —{"\n"}the imposter can't be caught.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.resultEyebrow}>WRONG CALL</Text>
                <Text style={[styles.resultTitle, { color: colors.danger }]}>
                  WRONG!
                </Text>
                <Text style={styles.resultSub}>
                  {voteTarget?.name} is innocent.
                </Text>
              </>
            )}

            {/* Reveal block — shown immediately on auto-win, on demand otherwise */}
            {revealed ? (
              <>
                <View style={styles.wordCard}>
                  <Text style={styles.wordCardRevealLabel}>
                    THE IMPOSTER{imposters.length > 1 ? "S WERE" : " WAS"}
                  </Text>
                  {imposters.map((p) => (
                    <Text key={p.id} style={styles.revealedName}>
                      {p.name}
                    </Text>
                  ))}
                  <View style={styles.divider} />
                  <WordReveal
                    label="REAL WORD"
                    value={normalWord}
                    valueColor={colors.text}
                  />
                  <View style={styles.divider} />
                  <WordReveal
                    label="IMPOSTER WORD"
                    value={imposterWord}
                    valueColor={colors.danger}
                  />
                </View>
                {settings.scoreboardEnabled && scoreRecorded && (
                  <Scoreboard sessionScores={sessionScores} styles={styles} colors={colors} />
                )}
              </>
            ) : (
              <Text style={styles.hiddenHint}>
                The imposter is still out there...
              </Text>
            )}
          </ScrollView>

          {/* Buttons */}
          {imposterAutoWin || revealed ? (
            // Game over (auto-win or manually revealed) → new game options only
            <View style={styles.buttonStack}>
              <TouchableOpacity onPress={handleGoToSetup} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#DC2626", "#B91C1C"]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.actionBtnText}>PLAY AGAIN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoHome} activeOpacity={0.7}>
                <Text style={styles.secondaryBtnText}>END SESSION</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Normal wrong vote — player can keep playing or reveal
            <View style={styles.buttonStack}>
              <TouchableOpacity onPress={handlePlayAgain} activeOpacity={0.85}>
                <LinearGradient
                  colors={["#DC2626", "#B91C1C"]}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}>
                  <Text style={styles.actionBtnText}>PLAY ANOTHER ROUND</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.revealBtn}
                onPress={handleReveal}
                activeOpacity={0.7}>
                <Text style={styles.revealBtnText}>REVEAL THE IMPOSTER</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function getStyles(c) {
  return StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: 56,
      justifyContent: "space-between",
    },
    center: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.md,
      paddingBottom: spacing.lg,
    },
    resultEyebrow: {
      color: c.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 5,
    },
    resultTitle: {
      fontSize: 64,
      fontWeight: "900",
      letterSpacing: -3,
    },
    resultSub: {
      color: c.textSecondary,
      fontSize: 18,
      textAlign: "center",
      lineHeight: 26,
    },
    bonusBadge: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs + 2,
      backgroundColor: "rgba(245,158,11,0.15)",
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: "rgba(245,158,11,0.4)",
    },
    bonusBadgeText: {
      color: "#F59E0B",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 2,
    },
    typingContainer: {
      alignItems: "center",
      marginTop: spacing.lg,
      gap: spacing.xs,
    },
    typingLabel: {
      color: c.textMuted,
      fontSize: 14,
      fontStyle: "italic",
    },
    typingRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    typingName: {
      fontSize: 40,
      fontWeight: "900",
      letterSpacing: -1,
      textAlign: "center",
    },
    cursor: {
      fontSize: 40,
      fontWeight: "300",
      lineHeight: 48,
      marginLeft: 2,
    },
    wordCard: {
      width: "100%",
      padding: spacing.xl,
      backgroundColor: c.surface,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      gap: spacing.md,
      marginTop: spacing.md,
    },
    wordCardRevealLabel: {
      color: c.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 3,
    },
    revealedName: {
      color: c.danger,
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      width: "100%",
    },
    hiddenHint: {
      color: c.textMuted,
      fontSize: 15,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: spacing.md,
    },
    scoreCard: {
      width: "100%",
      padding: spacing.lg,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      gap: spacing.xs,
      marginTop: spacing.md,
    },
    scoreCardLabel: {
      color: c.textMuted,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 4,
      marginBottom: spacing.sm,
    },
    scoreRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xl,
    },
    scoreItem: { alignItems: "center", gap: 2 },
    scoreNum: {
      color: c.text,
      fontSize: 36,
      fontWeight: "900",
      letterSpacing: -1,
    },
    scoreItemLabel: {
      color: c.textMuted,
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 3,
    },
    scoreVs: {
      color: c.textMuted,
      fontSize: 14,
      fontStyle: "italic",
    },
    scoreGames: {
      color: c.textMuted,
      fontSize: 11,
      marginTop: spacing.xs,
    },
    buttonStack: { gap: spacing.md },
    actionBtn: {
      paddingVertical: 20,
      alignItems: "center",
      borderRadius: radius.lg,
    },
    actionBtnText: {
      color: "#FFFFFF",
      fontSize: 17,
      fontWeight: "800",
      letterSpacing: 2,
    },
    revealBtn: {
      paddingVertical: 18,
      alignItems: "center",
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    revealBtnText: {
      color: c.textSecondary,
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 1,
    },
    secondaryBtn: {
      paddingVertical: 16,
      alignItems: "center",
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    secondaryBtnText: {
      color: c.textMuted,
      fontSize: 14,
      fontWeight: "600",
      letterSpacing: 2,
    },
  });
}
