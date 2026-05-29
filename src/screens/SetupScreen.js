import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Animated,
	SafeAreaView,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "../theme";
import { createGame } from "../utils/gameLogic";
import { CATEGORIES } from "../data/wordSets";

const RED = "#DC2626";
const RED_DIM = "rgba(220,38,38,0.12)";
const RED_BORDER = "rgba(220,38,38,0.35)";

const DEFAULT_NAMES = (count) =>
	Array.from({ length: count }, (_, i) => `Player ${i + 1}`);

export default function SetupScreen({
	navigate,
	settings,
	customWords,
	lastPlayers,
}) {
	const [playerCount, setPlayerCount] = useState(lastPlayers?.length ?? 6);
	const [names, setNames] = useState(lastPlayers ?? DEFAULT_NAMES(6));
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [imposterChoice, setImposterChoice] = useState("random");
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

	const handleStart = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
		const isCustomCategory = selectedCategory === "custom";
		const category =
			settings.categoriesEnabled || isCustomCategory ? selectedCategory : "all";
		const customPool =
			isCustomCategory || settings.customWordsEnabled ? customWords : [];
		navigate(
			"playerReveal",
			createGame(playerCount, names, category, customPool, imposterChoice),
		);
	};

	return (
		<LinearGradient colors={["#1a0000", "#000000"]} style={styles.container}>
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

						{/* Category picker — shown when categories enabled OR user has custom words */}
						{(settings.categoriesEnabled || customWords.length > 0) && (
							<View style={styles.categorySection}>
								<Text style={styles.sectionLabel}>CATEGORY</Text>
								<ScrollView
									horizontal
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.categoryRow}>
									{settings.categoriesEnabled &&
										CATEGORIES.map((cat) => (
											<TouchableOpacity
												key={cat.id}
												style={[
													styles.categoryPill,
													selectedCategory === cat.id &&
														styles.categoryPillActive,
												]}
												onPress={async () => {
													await Haptics.impactAsync(
														Haptics.ImpactFeedbackStyle.Light,
													);
													setSelectedCategory(cat.id);
												}}
												activeOpacity={0.7}>
												<Text
													style={[
														styles.categoryPillText,
														selectedCategory === cat.id &&
															styles.categoryPillTextActive,
													]}>
													{cat.label}
												</Text>
											</TouchableOpacity>
										))}

									{customWords.length > 0 && (
										<TouchableOpacity
											style={[
												styles.categoryPill,
												selectedCategory === "custom" &&
													styles.categoryPillActive,
											]}
											onPress={async () => {
												await Haptics.impactAsync(
													Haptics.ImpactFeedbackStyle.Light,
												);
												setSelectedCategory("custom");
											}}
											activeOpacity={0.7}>
											<Text
												style={[
													styles.categoryPillText,
													selectedCategory === "custom" &&
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

const styles = StyleSheet.create({
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
		color: colors.textSecondary,
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: 1,
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
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		justifyContent: "center",
	},
	counterBtnDisabled: { opacity: 0.25 },
	counterBtnText: {
		color: colors.text,
		fontSize: 28,
		lineHeight: 32,
		fontWeight: "300",
	},
	counterCenter: { alignItems: "center" },
	counterValue: {
		color: colors.text,
		fontSize: 72,
		fontWeight: "900",
		letterSpacing: -3,
		lineHeight: 76,
	},
	counterLabel: {
		color: colors.textMuted,
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 4,
		marginTop: -4,
	},
	badge: {
		alignSelf: "center",
		marginTop: spacing.md,
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.xs + 2,
		backgroundColor: colors.surface,
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
	},
	badgeText: {
		color: colors.textSecondary,
		fontSize: 12,
		fontWeight: "500",
	},
	sectionLabelTop: {
		color: colors.textMuted,
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
		borderColor: colors.border,
		backgroundColor: colors.surface,
		minWidth: 72,
		alignItems: "center",
	},
	imposterPillActive: {
		borderColor: RED,
		backgroundColor: RED,
	},
	imposterPillText: {
		color: colors.textSecondary,
		fontSize: 14,
		fontWeight: "700",
		letterSpacing: 1,
	},
	imposterPillTextActive: { color: "#FFFFFF" },
	categorySection: { marginTop: spacing.lg },
	sectionLabel: {
		color: colors.textMuted,
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
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	categoryPillActive: {
		borderColor: RED,
		backgroundColor: RED,
	},
	categoryPillText: {
		color: colors.textSecondary,
		fontSize: 13,
		fontWeight: "600",
	},
	categoryPillTextActive: { color: "#FFFFFF" },
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
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		paddingHorizontal: spacing.md,
		paddingVertical: 12,
		color: colors.text,
		fontSize: 16,
		fontWeight: "500",
	},
	startBtn: {
		paddingVertical: 20,
		alignItems: "center",
		borderRadius: radius.lg,
		marginTop: spacing.md,
	},
	startBtnText: {
		color: colors.text,
		fontSize: 17,
		fontWeight: "800",
		letterSpacing: 2,
	},
});
