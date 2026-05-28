import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const RED = '#DC2626';

export default function PlayerRevealScreen({ navigate, gameState }) {
  const { players, currentPlayerIndex } = gameState;
  const player = players[currentPlayerIndex];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, [currentPlayerIndex]);

  const handleReveal = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('wordReveal', gameState);
  };

  return (
    <LinearGradient colors={['#1a0000', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <View style={styles.progress}>
            <Text style={styles.progressText}>
              {currentPlayerIndex + 1} / {players.length}
            </Text>
          </View>

          <View style={styles.center}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.instruction}>Pass the phone to this player.</Text>
            <Text style={styles.subInstruction}>Make sure nobody else is looking.</Text>
          </View>

          <TouchableOpacity onPress={handleReveal} activeOpacity={0.85}>
            <LinearGradient
              colors={['#DC2626', '#B91C1C']}
              style={styles.revealBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.revealBtnText}>REVEAL MY WORD</Text>
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
    paddingTop: spacing.md,
    paddingBottom: 56,
    alignItems: 'center',
  },
  progress: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  playerName: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  instruction: {
    color: colors.textSecondary,
    fontSize: 17,
    textAlign: 'center',
  },
  subInstruction: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  revealBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
    width: '100%',
  },
  revealBtnText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
