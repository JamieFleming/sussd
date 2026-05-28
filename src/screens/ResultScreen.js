import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

function WordReveal({ label, value, valueColor }) {
  return (
    <View style={styles.wordRow}>
      <Text style={styles.wordRowLabel}>{label}</Text>
      <Text style={[styles.wordRowValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function Scoreboard({ sessionScores }) {
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
          <Text style={[styles.scoreNum, { color: colors.danger }]}>{sessionScores.imposterWins}</Text>
          <Text style={styles.scoreItemLabel}>IMPOSTERS</Text>
        </View>
      </View>
      <Text style={styles.scoreGames}>{sessionScores.gamesPlayed} games played</Text>
    </View>
  );
}

export default function ResultScreen({ navigate, gameState, settings, sessionScores, onScoreUpdate }) {
  const {
    voteTarget, voteTarget2, voteCorrect,
    players, normalWord, imposterWord,
    votesWrong = 0, doubleDown, doubleDownCorrect,
  } = gameState;

  const imposters = players.filter((p) => p.isImposter);
  const imposterFullName = imposters.map((p) => p.name).join(' & ');

  // Determine outcome type
  const isDoubleWin = voteCorrect && doubleDown === 'attempted' && doubleDownCorrect;
  const isBackfired = voteCorrect && doubleDown === 'attempted' && !doubleDownCorrect;
  const isNormalWin = voteCorrect && (doubleDown === 'skip' || !doubleDown);
  const isWin = isNormalWin || isDoubleWin;

  const [revealed, setRevealed] = useState(isBackfired); // auto-reveal on backfire
  const [scoreRecorded, setScoreRecorded] = useState(false);

  // Typing animation
  const [displayedName, setDisplayedName] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const wordCardAnim = useRef(new Animated.Value(0)).current;
  const cursorAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Haptics.notificationAsync(
      isWin ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  // Record score on mount for all win types and for backfired
  useEffect(() => {
    if (scoreRecorded) return;
    setScoreRecorded(true);
    if (isNormalWin) onScoreUpdate('innocents', 1);
    else if (isDoubleWin) onScoreUpdate('innocents', 2);
    else if (isBackfired) onScoreUpdate('imposters', 1);
    // wrong vote: score recorded on reveal tap
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
        Animated.timing(cursorAnim, { toValue: 0, duration: 450, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  // Slide up word card after typing
  useEffect(() => {
    if (!typingDone) return;
    Animated.spring(wordCardAnim, { toValue: 1, friction: 7, tension: 50, useNativeDriver: true }).start();
  }, [typingDone]);

  const handlePlayAgain = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('discuss', { ...gameState, votesWrong: votesWrong + 1 });
  };

  const handleReveal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (!scoreRecorded) {
      setScoreRecorded(true);
      onScoreUpdate('imposters', 1);
    }
    setRevealed(true);
  };

  const handleNewGame = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('home');
  };

  const winGradient = isDoubleWin ? ['#031a0e', '#030712'] : ['#031a0e', '#030712'];
  const winColor = isDoubleWin ? '#F59E0B' : '#10B981';
  const winLabel = isDoubleWin ? 'DOUBLE BUST' : 'GOT THEM';
  const winTitle = isDoubleWin ? 'UNSTOPPABLE!' : 'BUSTED!';

  // ── WIN / DOUBLE WIN ──────────────────────────────────────────────
  if (isWin) {
    return (
      <LinearGradient colors={winGradient} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.center}>
              <Text style={styles.resultEyebrow}>{winLabel}</Text>
              <Text style={[styles.resultTitle, { color: winColor }]}>{winTitle}</Text>

              {isDoubleWin && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusBadgeText}>+2 POINTS — BONUS!</Text>
                </View>
              )}

              <View style={styles.typingContainer}>
                <Text style={styles.typingLabel}>
                  {isDoubleWin ? 'Both imposters caught:' : 'The imposter was'}
                </Text>
                <View style={styles.typingRow}>
                  <Text style={[styles.typingName, { color: winColor }]}>{displayedName}</Text>
                  {!typingDone && (
                    <Animated.Text style={[styles.cursor, { color: winColor, opacity: cursorAnim }]}>|</Animated.Text>
                  )}
                </View>
              </View>

              <Animated.View
                style={[
                  styles.wordCard,
                  {
                    opacity: wordCardAnim,
                    transform: [{ translateY: wordCardAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
                  },
                ]}
              >
                <WordReveal label="REAL WORD" value={normalWord} valueColor={colors.text} />
                <View style={styles.divider} />
                <WordReveal label="IMPOSTER WORD" value={imposterWord} valueColor={colors.danger} />
              </Animated.View>
            </View>

            {settings.scoreboardEnabled && scoreRecorded && (
              <Scoreboard sessionScores={sessionScores} />
            )}

            <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85}>
              <LinearGradient
                colors={isDoubleWin ? ['#F59E0B', '#D97706'] : ['#10B981', '#059669']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionBtnText}>PLAY AGAIN</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── BACKFIRED ─────────────────────────────────────────────────────
  if (isBackfired) {
    return (
      <LinearGradient colors={['#1a0505', '#030712']} style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.center}>
              <Text style={styles.resultEyebrow}>DOUBLE DOWN FAILED</Text>
              <Text style={[styles.resultTitle, { color: colors.danger }]}>BACKFIRED!</Text>
              <Text style={styles.resultSub}>
                {voteTarget2?.name} was innocent.{'\n'}The imposters escaped!
              </Text>

              <View style={styles.wordCard}>
                <Text style={styles.wordCardRevealLabel}>THE IMPOSTER{imposters.length > 1 ? 'S WERE' : ' WAS'}</Text>
                {imposters.map((p) => (
                  <Text key={p.id} style={styles.revealedName}>{p.name}</Text>
                ))}
                <View style={styles.divider} />
                <WordReveal label="REAL WORD" value={normalWord} valueColor={colors.text} />
                <View style={styles.divider} />
                <WordReveal label="IMPOSTER WORD" value={imposterWord} valueColor={colors.danger} />
              </View>

              {settings.scoreboardEnabled && scoreRecorded && (
                <Scoreboard sessionScores={sessionScores} />
              )}
            </View>

            <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionBtnText}>NEW GAME</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── WRONG VOTE ────────────────────────────────────────────────────
  return (
    <LinearGradient colors={['#1a0505', '#030712']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.center}>
            <Text style={styles.resultEyebrow}>WRONG CALL</Text>
            <Text style={[styles.resultTitle, { color: colors.danger }]}>WRONG!</Text>
            <Text style={styles.resultSub}>{voteTarget?.name} is innocent.</Text>

            {revealed ? (
              <>
                <View style={styles.wordCard}>
                  <Text style={styles.wordCardRevealLabel}>
                    THE IMPOSTER{imposters.length > 1 ? 'S WERE' : ' WAS'}
                  </Text>
                  {imposters.map((p) => (
                    <Text key={p.id} style={styles.revealedName}>{p.name}</Text>
                  ))}
                  <View style={styles.divider} />
                  <WordReveal label="REAL WORD" value={normalWord} valueColor={colors.text} />
                  <View style={styles.divider} />
                  <WordReveal label="IMPOSTER WORD" value={imposterWord} valueColor={colors.danger} />
                </View>
                {settings.scoreboardEnabled && scoreRecorded && (
                  <Scoreboard sessionScores={sessionScores} />
                )}
              </>
            ) : (
              <Text style={styles.hiddenHint}>The imposter is still out there...</Text>
            )}
          </View>

          {!revealed ? (
            <View style={styles.buttonStack}>
              <TouchableOpacity onPress={handlePlayAgain} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#DC2626', '#B91C1C']}
                  style={styles.actionBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.actionBtnText}>PLAY ANOTHER ROUND</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.revealBtn} onPress={handleReveal} activeOpacity={0.7}>
                <Text style={styles.revealBtnText}>REVEAL THE IMPOSTER</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleNewGame} activeOpacity={0.85}>
              <LinearGradient
                colors={['#DC2626', '#B91C1C']}
                style={styles.actionBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionBtnText}>NEW GAME</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 56,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  resultEyebrow: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
  },
  resultTitle: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -3,
  },
  resultSub: {
    color: colors.textSecondary,
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
  },
  bonusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
  },
  bonusBadgeText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  typingContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  typingLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typingName: {
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  cursor: {
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 48,
    marginLeft: 2,
  },
  wordCard: {
    width: '100%',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  wordCardRevealLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  revealedName: {
    color: colors.danger,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  wordRow: { alignItems: 'center', gap: spacing.xs },
  wordRowLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  wordRowValue: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
  hiddenHint: {
    color: colors.textMuted,
    fontSize: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  scoreCard: {
    width: '100%',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  scoreCardLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  scoreItem: { alignItems: 'center', gap: 2 },
  scoreNum: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreItemLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 3,
  },
  scoreVs: {
    color: colors.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
  },
  scoreGames: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  buttonStack: { gap: spacing.md },
  actionBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  actionBtnText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  revealBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  revealBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
