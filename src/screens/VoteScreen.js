import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

export default function VoteScreen({ navigate, gameState }) {
  const { players, secondVote, voteTarget: firstCaught } = gameState;
  const [selected, setSelected] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // On second vote, exclude the already-caught player
  const votablePlayers = secondVote
    ? players.filter((p) => p.id !== firstCaught?.id)
    : players;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const handleSelect = async (player) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(player);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (secondVote) {
      navigate('result', {
        ...gameState,
        voteTarget2: selected,
        doubleDown: 'attempted',
        doubleDownCorrect: selected.isImposter,
      });
    } else {
      const correct = selected.isImposter;
      if (correct) {
        navigate('doubleDown', { ...gameState, voteTarget: selected, voteCorrect: true });
      } else {
        navigate('result', { ...gameState, voteTarget: selected, voteCorrect: false });
      }
    }
  };

  return (
    <LinearGradient colors={['#0D0B1E', '#030712']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          <View style={styles.header}>
            <Text style={styles.title}>
              {secondVote ? 'ONE MORE\nIMPOSTER?' : 'WHO IS\nTHE IMPOSTER?'}
            </Text>
            <Text style={styles.subtitle}>
              {secondVote
                ? 'Pick who you think is still hiding'
                : 'Tap a player to select them'}
            </Text>
          </View>

          <FlatList
            data={votablePlayers}
            keyExtractor={(item) => String(item.id)}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isSelected = selected?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.playerCard, isSelected && styles.playerCardSelected]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
                    <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                      {item.id}
                    </Text>
                  </View>
                  <Text style={styles.playerName}>{item.name}</Text>
                  {isSelected && (
                    <View style={styles.tick}>
                      <Text style={styles.tickText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={selected ? 0.85 : 1}
            disabled={!selected}
          >
            <LinearGradient
              colors={selected ? ['#EF4444', '#B91C1C'] : ['#1F2937', '#1F2937']}
              style={styles.confirmBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.confirmBtnText}>
                {selected ? `VOTE — ${selected.name.toUpperCase()}` : 'SELECT A PLAYER'}
              </Text>
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
  header: { marginBottom: spacing.lg, gap: spacing.xs },
  title: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.sm, paddingBottom: spacing.lg },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  playerCardSelected: {
    borderColor: 'rgba(239,68,68,0.5)',
    backgroundColor: 'rgba(239,68,68,0.08)',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSelected: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: 'rgba(239,68,68,0.5)',
  },
  avatarText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 16,
  },
  avatarTextSelected: { color: '#EF4444' },
  playerName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  tick: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  confirmBtn: {
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  confirmBtnText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});
