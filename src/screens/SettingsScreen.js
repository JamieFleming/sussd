import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, SafeAreaView, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const RED = '#DC2626';
const RED_DIM = 'rgba(220,38,38,0.15)';
const RED_BORDER = 'rgba(220,38,38,0.4)';

function Toggle({ value, onToggle }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      friction: 8,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, [value]);

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(!value);
  };

  const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [2, 24] });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View style={[styles.toggleTrack, value && styles.toggleTrackOn]}>
        <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: thumbX }] }]} />
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ label }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function SettingRow({ label, desc, value, onToggle, children }) {
  return (
    <View>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>{label}</Text>
          {desc ? <Text style={styles.settingDesc}>{desc}</Text> : null}
        </View>
        <Toggle value={value} onToggle={onToggle} />
      </View>
      {children}
    </View>
  );
}

export default function SettingsScreen({
  navigate, settings, onSettingsChange, sessionScores, onResetScores,
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleDuration = async (d) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSettingsChange({ timerDuration: d });
  };

  const handleReset = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onResetScores();
  };

  return (
    <LinearGradient colors={['#1a0000', '#000000']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          <TouchableOpacity onPress={() => navigate('home')} style={styles.back}>
            <Text style={styles.backText}>← BACK</Text>
          </TouchableOpacity>

          <Text style={styles.title}>SETTINGS</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

            <SectionHeader label="GAMEPLAY" />

            <View style={styles.card}>
              <SettingRow
                label="Discussion Timer"
                desc="Countdown during each discussion round"
                value={settings.timerEnabled}
                onToggle={(v) => onSettingsChange({ timerEnabled: v })}
              >
                {settings.timerEnabled && (
                  <View style={styles.durationRow}>
                    {[30, 60, 90].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.durationBtn, settings.timerDuration === d && styles.durationBtnActive]}
                        onPress={() => handleDuration(d)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.durationBtnText, settings.timerDuration === d && styles.durationBtnTextActive]}>
                          {d}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </SettingRow>

              <View style={styles.divider} />

              <SettingRow
                label="Session Scoreboard"
                desc="Track wins across games in one session"
                value={settings.scoreboardEnabled}
                onToggle={(v) => onSettingsChange({ scoreboardEnabled: v })}
              />

              <View style={styles.divider} />

              <SettingRow
                label="Word Categories"
                desc="Filter words by category on setup screen"
                value={settings.categoriesEnabled}
                onToggle={(v) => onSettingsChange({ categoriesEnabled: v })}
              />
            </View>

            <SectionHeader label="WORDS" />

            <View style={styles.card}>
              <SettingRow
                label="Custom Word Pairs"
                desc="Add your own words to the game"
                value={settings.customWordsEnabled}
                onToggle={(v) => onSettingsChange({ customWordsEnabled: v })}
              >
                {settings.customWordsEnabled && (
                  <TouchableOpacity
                    style={styles.manageBtn}
                    onPress={() => navigate('customWords')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.manageBtnText}>Manage My Words →</Text>
                  </TouchableOpacity>
                )}
              </SettingRow>
            </View>

            {settings.scoreboardEnabled && (
              <>
                <SectionHeader label="SESSION" />
                <View style={styles.card}>
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreItem}>
                      <Text style={styles.scoreValue}>{sessionScores.innocentsWins}</Text>
                      <Text style={styles.scoreLabel}>INNOCENTS</Text>
                    </View>
                    <Text style={styles.scoreVs}>vs</Text>
                    <View style={styles.scoreItem}>
                      <Text style={[styles.scoreValue, { color: colors.danger }]}>{sessionScores.imposterWins}</Text>
                      <Text style={styles.scoreLabel}>IMPOSTERS</Text>
                    </View>
                  </View>
                  <Text style={styles.gamesPlayed}>{sessionScores.gamesPlayed} games this session</Text>
                  <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
                    <Text style={styles.resetBtnText}>Reset Scores</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

          </ScrollView>
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
  },
  back: { paddingVertical: spacing.sm },
  backText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  scroll: { paddingBottom: 60 },
  sectionHeader: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.md,
  },
  settingInfo: { flex: 1, gap: 3 },
  settingLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  settingDesc: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
  },
  toggleTrackOn: { backgroundColor: RED },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  durationBtnActive: {
    borderColor: RED_BORDER,
    backgroundColor: RED_DIM,
  },
  durationBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  durationBtnTextActive: { color: RED },
  manageBtn: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  manageBtnText: {
    color: RED,
    fontSize: 14,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },
  scoreItem: { alignItems: 'center', gap: 4 },
  scoreValue: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
  },
  scoreVs: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  gamesPlayed: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resetBtn: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.05)',
  },
  resetBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
