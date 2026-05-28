import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

export default function DoubleDownScreen({ navigate, gameState }) {
  const { voteTarget } = gameState;
  const [showWarning, setShowWarning] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, friction: 7, tension: 45, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleTakeWin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('result', { ...gameState, doubleDown: 'skip' });
  };

  const handleDoubleDown = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowWarning(true);
  };

  const handleConfirm = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowWarning(false);
    navigate('vote', { ...gameState, secondVote: true });
  };

  return (
    <LinearGradient colors={['#031a0e', '#030712']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          <View style={styles.center}>
            <Text style={styles.eyebrow}>IMPOSTER FOUND</Text>

            <Animated.View style={[styles.caughtCard, { transform: [{ scale: cardAnim }] }]}>
              <Text style={styles.caughtLabel}>CAUGHT</Text>
              <Text style={styles.caughtName}>{voteTarget.name}</Text>
              <Text style={styles.caughtSub}>has been exposed as an imposter</Text>
            </Animated.View>

            <View style={styles.questionBlock}>
              <Text style={styles.questionTitle}>
                Is there ANOTHER{'\n'}imposter hiding?
              </Text>
              <Text style={styles.questionSub}>
                Double down to earn a bonus point — but get it wrong and you lose your win entirely.
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={handleDoubleDown} activeOpacity={0.85}>
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                style={styles.doubleBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.doubleBtnText}>DOUBLE DOWN →</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.safeBtn} onPress={handleTakeWin} activeOpacity={0.7}>
              <Text style={styles.safeBtnText}>TAKE THE WIN</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </SafeAreaView>

      {/* Warning modal */}
      <Modal visible={showWarning} transparent animationType="fade" onRequestClose={() => setShowWarning(false)}>
        <View style={styles.overlay}>
          <View style={styles.warningCard}>
            <Text style={styles.warningEyebrow}>HIGH RISK</Text>
            <Text style={styles.warningTitle}>Are you sure?</Text>
            <Text style={styles.warningBody}>
              If you pick the wrong person, you forfeit the point you just earned.
              {'\n\n'}
              The imposters take the win instead.
              {'\n\n'}
              Only double down if you're confident.
            </Text>

            <TouchableOpacity onPress={handleConfirm} activeOpacity={0.85}>
              <LinearGradient
                colors={['#EF4444', '#B91C1C']}
                style={styles.warningConfirmBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.warningConfirmText}>I'M SURE — LET'S GO</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.warningCancelBtn} onPress={() => setShowWarning(false)} activeOpacity={0.7}>
              <Text style={styles.warningCancelText}>ACTUALLY, TAKE THE WIN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    gap: spacing.xl,
  },
  eyebrow: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
  },
  caughtCard: {
    width: '100%',
    padding: spacing.xl,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    alignItems: 'center',
    gap: spacing.xs,
  },
  caughtLabel: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
  },
  caughtName: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
  },
  caughtSub: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  questionBlock: {
    alignItems: 'center',
    gap: spacing.md,
  },
  questionTitle: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
    lineHeight: 42,
  },
  questionSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  buttons: { gap: spacing.md },
  doubleBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  doubleBtnText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  safeBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  safeBtnText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  warningCard: {
    backgroundColor: '#111827',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    gap: spacing.md,
  },
  warningEyebrow: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
  },
  warningTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  warningBody: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  warningConfirmBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    borderRadius: radius.lg,
    marginTop: spacing.sm,
  },
  warningConfirmText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1,
  },
  warningCancelBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  warningCancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
