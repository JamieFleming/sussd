import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { colors, spacing, radius } from '../theme';

const RED = '#DC2626';
const RED_DIM = 'rgba(220,38,38,0.12)';
const RED_BORDER = 'rgba(220,38,38,0.35)';

const TIPS = [
  "Don't say your word directly",
  'Listen for anything suspicious',
  'Watch who hesitates or goes vague',
];

export default function DiscussScreen({ navigate, gameState, settings }) {
  const roundNumber = (gameState.votesWrong || 0) + 1;
  const isFirstVote = roundNumber === 1;
  const { firstPlayer } = gameState;

  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [paused, setPaused] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!settings.timerEnabled || paused || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, paused, settings.timerEnabled]);

  // Animate progress bar
  useEffect(() => {
    if (!settings.timerEnabled) return;
    const progress = timeLeft / settings.timerDuration;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [timeLeft]);

  // Pulse when time is up
  useEffect(() => {
    if (timeLeft > 0) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [timeLeft]);

  const togglePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaused((p) => !p);
  };

  const handleVote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    navigate('vote', gameState);
  };

  const handleEndGame = () => {
    Alert.alert(
      'End Game?',
      'This will abandon the current game and return to home.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Game', style: 'destructive', onPress: () => navigate('home') },
      ]
    );
  };

  const isLow = settings.timerEnabled && timeLeft <= 10 && timeLeft > 0;
  const isUp = settings.timerEnabled && timeLeft === 0;

  return (
    <LinearGradient colors={['#1a0000', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* Top row: round badge + end game */}
          <View style={styles.topRow}>
            <View style={styles.roundBadge}>
              <Text style={styles.roundText}>ROUND {roundNumber}</Text>
            </View>
            <TouchableOpacity onPress={handleEndGame} style={styles.endBtn} activeOpacity={0.7}>
              <Text style={styles.endBtnText}>END</Text>
            </TouchableOpacity>
          </View>

          {/* First player card — round 1 only */}
          {isFirstVote && firstPlayer && (
            <View style={styles.firstPlayerCard}>
              <Text style={styles.firstPlayerLabel}>GOES FIRST</Text>
              <Text style={styles.firstPlayerName}>{firstPlayer.name}</Text>
            </View>
          )}

          {/* Timer */}
          {settings.timerEnabled && (
            <View style={styles.timerSection}>
              <View style={styles.timerRow}>
                <Animated.Text
                  style={[
                    styles.timerValue,
                    isLow && styles.timerValueLow,
                    isUp && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  {isUp ? "TIME'S UP" : `${timeLeft}s`}
                </Animated.Text>
                {!isUp && (
                  <TouchableOpacity onPress={togglePause} style={styles.pauseBtn} activeOpacity={0.7}>
                    <Text style={styles.pauseBtnText}>{paused ? '▶' : '⏸'}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={styles.progressTrack}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              >
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, trackWidth],
                      }),
                      backgroundColor: isLow ? '#EF4444' : RED,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.center}>
            <Text style={styles.title}>
              {isFirstVote ? 'TIME TO\nDISCUSS' : 'DISCUSS\nAGAIN'}
            </Text>
            <Text style={styles.subtitle}>
              {isFirstVote
                ? 'Everyone takes turns saying ONE word related to theirs. Do 2 rounds, then vote.'
                : "Wrong guess — play another round and vote again when you're ready."}
            </Text>

            <View style={styles.tips}>
              {TIPS.map((tip, i) => (
                <View key={i} style={styles.tip}>
                  <View style={styles.tipDot} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity onPress={handleVote} activeOpacity={0.85}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.voteBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.voteBtnText}>START VOTING</Text>
            </LinearGradient>
          </TouchableOpacity>

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
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  roundBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs + 2,
    backgroundColor: RED,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: RED,
  },
  roundText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 4,
  },
  endBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  endBtnText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
  firstPlayerCard: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: RED,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: RED,
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.md,
  },
  firstPlayerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 4,
  },
  firstPlayerName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  timerSection: {
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerValue: {
    color: colors.text,
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: -2,
  },
  timerValueLow: { color: '#EF4444' },
  pauseBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseBtnText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  center: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  title: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 60,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 25,
  },
  tips: { gap: spacing.sm },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
  },
  tipText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  voteBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  voteBtnText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
