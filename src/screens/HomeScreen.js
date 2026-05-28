import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, Modal, ScrollView, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

const RED = '#DC2626';
const RED_DIM = 'rgba(220,38,38,0.12)';
const RED_BORDER = 'rgba(220,38,38,0.7)';

const NORMAL = [
  {
    title: 'Set up & pass the phone',
    body: "Choose how many are playing. Pass the phone around — each person secretly reads their word then hands it back. No peeking at anyone else's.",
  },
  {
    title: 'One of you is the imposter',
    body: "1 or 2 players are secretly IMPOSTERS. They get a similar but different word and have no idea what everyone else actually has. Their job is to blend in.",
  },
  {
    title: 'Drop your clues',
    body: "Going around the group, each player says ONE word linked to theirs. Don't say your word directly — hint at it. The imposter has to bluff their way through.",
  },
  {
    title: 'Two rounds, then vote',
    body: "Do two full rounds so everyone speaks twice. Then discuss — who seemed off? Who hesitated? Who gave a clue that didn't quite fit?",
  },
  {
    title: 'Vote for the imposter',
    body: "Agree on a suspect and vote. Get it right and the innocents win. Get it wrong and you can play another round before voting again, or reveal who it was.",
  },
  {
    title: 'Double down for a bonus',
    body: "Catch one imposter and think there's another hiding? Double down — pick correctly and earn a bonus point. Pick wrong and you forfeit your win.",
  },
];

const ELI5 = [
  {
    title: 'Everyone gets a secret',
    body: "Pick how many of you are playing. Pass the phone around like a hot potato. Everyone looks at their secret word, nods like they totally get it, and hands it back.",
  },
  {
    title: 'One of you is a big fat liar',
    body: "Somewhere in your group is a sneaky little IMPOSTER. They got a slightly wrong word and have absolutely no idea what you're all talking about. Bless them.",
  },
  {
    title: "Say a word. Just one. Don't blow it.",
    body: "Everyone takes turns saying ONE word about their word. If yours is PIZZA you might say \"cheesy\" or \"Italian\". The imposter will probably say something like \"...food?\" and try to look confident about it.",
  },
  {
    title: 'Two rounds. Yes, two. Pay attention.',
    body: "Everyone speaks twice. Try to actually listen instead of just planning what you're going to say. Watch for anyone who looks like a startled deer when it's their turn.",
  },
  {
    title: 'Point at the liar',
    body: "Vote for who you think is the sneaky rat. Catch them and they sit there looking guilty while everyone judges them. They escape and they will NOT stop talking about it.",
  },
  {
    title: 'Feeling brave? Double down.',
    body: "Caught one imposter and think there's ANOTHER one hiding? Go for it. Get it right and you're a legend. Get it wrong and you lose your point AND your dignity. Your choice, champ.",
  },
];

export default function HomeScreen({ navigate }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showInstructions, setShowInstructions] = useState(false);
  const [isELI5, setIsELI5] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigate('setup');
  };

  const handleInstructions = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsELI5(false);
    setShowInstructions(true);
  };

  const handleSettings = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigate('settings');
  };

  const handleToggleELI5 = async (val) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsELI5(val);
  };

  const instructions = isELI5 ? ELI5 : NORMAL;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim }]}>

          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.topChip}>
              <Text style={styles.topChipText}>{'👥  0'}</Text>
            </View>
            <TouchableOpacity style={styles.topChip} onPress={handleSettings} activeOpacity={0.7}>
              <Text style={styles.topChipIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {/* Hero image */}
          <View style={styles.heroWrapper}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)', '#000000']}
              style={styles.heroGradient}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>SUSS'D</Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            {'CAN YOU '}
            <Text style={styles.taglineAccent}>SUSS</Text>
            {' THEM OUT?'}
          </Text>

          {/* Buttons */}
          <View style={styles.buttons}>

            {/* START GAME */}
            <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
              <View style={styles.startBtnIcon}>
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.startBtnIconImg}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.startBtnText}>START GAME</Text>
              <Text style={styles.startBtnChevron}>›</Text>
            </TouchableOpacity>

            {/* HOW TO PLAY */}
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleInstructions} activeOpacity={0.8}>
              <View style={styles.secondaryIconWrap}>
                <Text style={styles.secondaryIconText}>i</Text>
              </View>
              <Text style={styles.secondaryBtnText}>HOW TO PLAY</Text>
              <Text style={styles.secondaryBtnChevron}>›</Text>
            </TouchableOpacity>

            {/* SETTINGS */}
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleSettings} activeOpacity={0.8}>
              <View style={styles.secondaryIconWrap}>
                <Text style={styles.gearIcon}>⚙</Text>
              </View>
              <Text style={styles.secondaryBtnText}>SETTINGS</Text>
              <Text style={styles.secondaryBtnChevron}>›</Text>
            </TouchableOpacity>

          </View>

          {/* Trust no one */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>
              {'TRUST '}
              <Text style={styles.bottomAccent}>NO</Text>
              {' ONE'}
            </Text>
          </View>

        </Animated.View>
      </SafeAreaView>

      {/* Instructions modal */}
      <Modal
        visible={showInstructions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInstructions(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {isELI5 ? 'OK SO BASICALLY...' : 'HOW TO PLAY'}
              </Text>
            </View>

            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.togglePill, !isELI5 && styles.togglePillActive]}
                onPress={() => handleToggleELI5(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.togglePillText, !isELI5 && styles.togglePillTextActive]}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.togglePill, isELI5 && styles.togglePillELI5]}
                onPress={() => handleToggleELI5(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.togglePillText, isELI5 && styles.togglePillTextActive]}>ELI5</Text>
              </TouchableOpacity>
            </View>

            {isELI5 && (
              <Text style={styles.eli5Hint}>Explain Like I'm 5 — for the chronically confused</Text>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              {instructions.map((item, i) => (
                <View key={`${isELI5}-${i}`} style={styles.instructionRow}>
                  <Text style={[styles.instructionNum, isELI5 && { color: RED }]}>{i + 1}</Text>
                  <View style={styles.instructionContent}>
                    <Text style={[styles.instructionTitle, isELI5 && { color: RED }]}>{item.title}</Text>
                    <Text style={styles.instructionText}>{item.body}</Text>
                  </View>
                </View>
              ))}
              <View style={{ height: spacing.lg }} />
            </ScrollView>

            <TouchableOpacity style={styles.gotItBtn} onPress={() => setShowInstructions(false)}>
              <Text style={styles.gotItText}>{isELI5 ? "GOT IT, I THINK" : "GOT IT"}</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  topChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topChipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  topChipIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },

  // Hero
  heroWrapper: {
    flex: 1,
    maxHeight: 340,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: '90%',
    height: '100%',
    borderRadius: 24,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderRadius: 24,
  },

  // Title
  title: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Tagline
  tagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  taglineAccent: {
    color: RED,
    fontWeight: '800',
  },

  // Buttons
  buttons: { gap: spacing.sm },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED_DIM,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: RED_BORDER,
    padding: spacing.md,
    gap: spacing.md,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(220,38,38,0.2)',
  },
  startBtnIconImg: {
    width: '100%',
    height: '100%',
  },
  startBtnText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  startBtnChevron: {
    color: RED,
    fontSize: 22,
    fontWeight: '300',
  },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: spacing.md,
    gap: spacing.md,
  },
  secondaryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryIconText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
  },
  gearIcon: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  secondaryBtnText: {
    flex: 1,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  secondaryBtnChevron: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 22,
    fontWeight: '300',
  },

  // Bottom
  bottomRow: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  bottomText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 5,
  },
  bottomAccent: {
    color: RED,
    fontWeight: '800',
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: spacing.xl,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  togglePill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  togglePillActive: { backgroundColor: RED },
  togglePillELI5: { backgroundColor: RED },
  togglePillText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  togglePillTextActive: { color: '#fff' },
  eli5Hint: {
    color: 'rgba(220,38,38,0.8)',
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  instructionRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  instructionNum: {
    color: RED,
    fontSize: 20,
    fontWeight: '900',
    width: 28,
    marginTop: 2,
  },
  instructionContent: { flex: 1, gap: spacing.xs },
  instructionTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  instructionText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  gotItBtn: {
    marginTop: spacing.md,
    paddingVertical: 18,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gotItText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
