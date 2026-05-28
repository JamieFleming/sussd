import React, { useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Animated,
	SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { colors, spacing, radius } from "../theme";

export default function WordRevealScreen({ navigate, gameState }) {
	const { players, currentPlayerIndex, normalWord, imposterWord } = gameState;
	const player = players[currentPlayerIndex];
	const isImposter = player.isImposter;
	const isLastPlayer = currentPlayerIndex === players.length - 1;

	const scaleAnim = useRef(new Animated.Value(0.4)).current;
	const fadeAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Haptics.notificationAsync(
			isImposter
				? Haptics.NotificationFeedbackType.Warning
				: Haptics.NotificationFeedbackType.Success,
		);
		Animated.parallel([
			Animated.spring(scaleAnim, {
				toValue: 1,
				friction: 5,
				tension: 55,
				useNativeDriver: true,
			}),
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 350,
				useNativeDriver: true,
			}),
		]).start();
	}, []);

	const handleNext = async () => {
		await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
		if (isLastPlayer) {
			navigate("discuss", gameState);
		} else {
			navigate("playerReveal", {
				...gameState,
				currentPlayerIndex: currentPlayerIndex + 1,
			});
		}
	};

	const bgColors = isImposter
		? ["#1a0505", "#0a0404", "#030712"]
		: ["#050518", "#030712", "#030712"];

	return (
		<LinearGradient colors={bgColors} style={styles.container}>
			<SafeAreaView style={styles.safe}>
				<View style={styles.content}>
					<Text style={styles.playerLabel}>{player.name}</Text>

					<View style={styles.center}>
						{isImposter && (
							<Animated.Text
								style={[styles.imposterBadge, { opacity: fadeAnim }]}>
								YOU ARE THE IMPOSTER
							</Animated.Text>
						)}

						<Animated.View
							style={[
								styles.wordCard,
								isImposter && styles.wordCardImposter,
								{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
							]}>
							{isImposter && (
								<Text style={styles.wordCardLabel}>YOUR WORD IS</Text>
							)}
							<Text
								style={[styles.word, isImposter && styles.wordImposter]}
								adjustsFontSizeToFit
								numberOfLines={1}>
								{isImposter ? imposterWord : normalWord}
							</Text>
							{!isImposter && (
								<Text style={styles.wordHint}>Don't say it out loud.</Text>
							)}
						</Animated.View>

						{isImposter && (
							<Animated.Text
								style={[styles.blendInHint, { opacity: fadeAnim }]}>
								Blend in. Don't get caught.
							</Animated.Text>
						)}
					</View>

					<TouchableOpacity
						onPress={handleNext}
						activeOpacity={0.8}
						style={[styles.nextBtn, isImposter && styles.nextBtnImposter]}>
						<Text style={styles.nextBtnText}>
							{isLastPlayer ? "START THE GAME →" : "HIDE & PASS →"}
						</Text>
					</TouchableOpacity>
				</View>
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
		paddingTop: spacing.lg,
		paddingBottom: 56,
		alignItems: "center",
	},
	playerLabel: {
		color: colors.textMuted,
		fontSize: 13,
		fontWeight: "700",
		letterSpacing: 4,
		textTransform: "uppercase",
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		gap: spacing.xl,
	},
	imposterBadge: {
		color: "#EF4444",
		fontSize: 12,
		fontWeight: "800",
		letterSpacing: 4,
	},
	wordCard: {
		width: "100%",
		padding: spacing.xl,
		borderRadius: radius.xl,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: "center",
		gap: spacing.md,
	},
	wordCardImposter: {
		borderColor: "rgba(239,68,68,0.3)",
		backgroundColor: "rgba(239,68,68,0.05)",
	},
	wordCardLabel: {
		color: colors.textMuted,
		fontSize: 11,
		fontWeight: "700",
		letterSpacing: 4,
	},
	word: {
		color: colors.text,
		fontSize: 60,
		fontWeight: "900",
		letterSpacing: -2,
		textAlign: "center",
	},
	wordImposter: { color: "#FF6B6B" },
	wordHint: {
		color: colors.textMuted,
		fontSize: 13,
		fontStyle: "italic",
	},
	blendInHint: {
		color: colors.textMuted,
		fontSize: 14,
		fontStyle: "italic",
	},
	nextBtn: {
		width: "100%",
		paddingVertical: 18,
		alignItems: "center",
		borderRadius: radius.full,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	nextBtnImposter: {
		borderColor: "rgba(239,68,68,0.3)",
	},
	nextBtnText: {
		color: colors.text,
		fontSize: 15,
		fontWeight: "700",
		letterSpacing: 1,
	},
});
