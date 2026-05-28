import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, SafeAreaView, FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius } from '../theme';

export default function CustomWordsScreen({ navigate, customWords, onCustomWordsChange }) {
  const [word1, setWord1] = useState('');
  const [word2, setWord2] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const word2Ref = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
  }, []);

  const handleAdd = async () => {
    if (!word1.trim() || !word2.trim()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onCustomWordsChange((prev) => [...prev, [word1.trim(), word2.trim()]]);
    setWord1('');
    setWord2('');
  };

  const handleDelete = async (index) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCustomWordsChange((prev) => prev.filter((_, i) => i !== index));
  };

  const canAdd = word1.trim().length > 0 && word2.trim().length > 0;

  return (
    <LinearGradient colors={['#0D0B1E', '#030712']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

            <TouchableOpacity onPress={() => navigate('settings')} style={styles.back}>
              <Text style={styles.backText}>← BACK</Text>
            </TouchableOpacity>

            <Text style={styles.title}>CUSTOM WORDS</Text>
            <Text style={styles.subtitle}>
              Add your own word pairs. The imposter gets the second word.
            </Text>

            {/* Add form */}
            <View style={styles.addCard}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="Real word"
                  placeholderTextColor={colors.textMuted}
                  value={word1}
                  onChangeText={setWord1}
                  maxLength={24}
                  returnKeyType="next"
                  onSubmitEditing={() => word2Ref.current?.focus()}
                  selectionColor={colors.primary}
                />
                <Text style={styles.inputDivider}>↔</Text>
                <TextInput
                  ref={word2Ref}
                  style={styles.input}
                  placeholder="Imposter word"
                  placeholderTextColor={colors.textMuted}
                  value={word2}
                  onChangeText={setWord2}
                  maxLength={24}
                  returnKeyType="done"
                  onSubmitEditing={handleAdd}
                  selectionColor={colors.primary}
                />
              </View>
              <TouchableOpacity
                onPress={handleAdd}
                activeOpacity={canAdd ? 0.85 : 1}
                disabled={!canAdd}
              >
                <LinearGradient
                  colors={canAdd ? ['#6366F1', '#4338CA'] : ['#1F2937', '#1F2937']}
                  style={styles.addBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addBtnText}>+ ADD PAIR</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Existing pairs */}
            {customWords.length > 0 && (
              <>
                <Text style={styles.listLabel}>MY WORD PAIRS ({customWords.length})</Text>
                <FlatList
                  data={customWords}
                  keyExtractor={(_, i) => String(i)}
                  style={styles.list}
                  contentContainerStyle={styles.listContent}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <View style={styles.pairCard}>
                      <Text style={styles.pairWord}>{item[0]}</Text>
                      <Text style={styles.pairArrow}>↔</Text>
                      <Text style={[styles.pairWord, { color: '#FF6B6B' }]}>{item[1]}</Text>
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(index)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.deleteBtnText}>×</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              </>
            )}

            {customWords.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No custom pairs yet.</Text>
                <Text style={styles.emptySubtext}>Add some above to spice up the game.</Text>
              </View>
            )}

          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
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
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: spacing.xl,
  },
  addCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  inputDivider: {
    color: colors.textMuted,
    fontSize: 18,
  },
  addBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  addBtnText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  listLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.sm, paddingBottom: 40 },
  pairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  pairWord: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  pairArrow: {
    color: colors.textMuted,
    fontSize: 16,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
