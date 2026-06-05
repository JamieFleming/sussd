import React, { useState, useCallback, useEffect, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "./src/ThemeContext";
import HomeScreen from "./src/screens/HomeScreen";
import SetupScreen from "./src/screens/SetupScreen";
import PlayerRevealScreen from "./src/screens/PlayerRevealScreen";
import WordRevealScreen from "./src/screens/WordRevealScreen";
import DiscussScreen from "./src/screens/DiscussScreen";
import VoteScreen from "./src/screens/VoteScreen";
import ResultScreen from "./src/screens/ResultScreen";
import DoubleDownScreen from "./src/screens/DoubleDownScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import CustomWordsScreen from "./src/screens/CustomWordsScreen";
import {
	loadSettings,
	saveSettings,
	loadCustomWords,
	saveCustomWords,
} from "./src/utils/storage";

const DEFAULT_SETTINGS = {
	timerEnabled: true,
	timerDuration: 60,
	soundEnabled: true,
	scoreboardEnabled: true,
	categoriesEnabled: false,
	customWordsEnabled: false,
	lightMode: false,
	childFriendly: false,
};

export default function App() {
	const [screen, setScreen] = useState("home");
	const [gameState, setGameState] = useState(null);
	const [settings, setSettings] = useState(DEFAULT_SETTINGS);
	const [sessionScores, setSessionScores] = useState({
		innocentsWins: 0,
		imposterWins: 0,
		gamesPlayed: 0,
	});
	const [customWords, setCustomWords] = useState([]);
	const [lastPlayers, setLastPlayers] = useState(null);
	const isFirstLoad = useRef(true);

	// Snapshot the full player list only at the start of a fresh game,
	// so players removed mid-game don't carry over to the next setup screen.
	useEffect(() => {
		if (gameState?.players && (gameState.votesWrong ?? 0) === 0) {
			setLastPlayers(gameState.players.map((p) => p.name));
		}
	}, [gameState]);

	// Load persisted data on launch
	useEffect(() => {
		async function hydrate() {
			const [savedSettings, savedWords] = await Promise.all([
				loadSettings(),
				loadCustomWords(),
			]);
			if (savedSettings) {
				setSettings((prev) => ({ ...prev, ...savedSettings }));
			}
			if (savedWords) {
				setCustomWords(savedWords);
			}
			isFirstLoad.current = false;
		}
		hydrate();
	}, []);

	// Persist settings whenever they change (skip the initial load)
	useEffect(() => {
		if (isFirstLoad.current) return;
		saveSettings(settings);
	}, [settings]);

	// Persist custom words whenever they change (skip the initial load)
	useEffect(() => {
		if (isFirstLoad.current) return;
		saveCustomWords(customWords);
	}, [customWords]);

	const navigate = useCallback((screenName, newGameState) => {
		if (newGameState !== undefined) setGameState(newGameState);
		setScreen(screenName);
	}, []);

	const updateSettings = useCallback((updates) => {
		setSettings((prev) => ({ ...prev, ...updates }));
	}, []);

	const updateScore = useCallback((winner, points = 1) => {
		setSessionScores((prev) => ({
			gamesPlayed: prev.gamesPlayed + 1,
			innocentsWins: prev.innocentsWins + (winner === "innocents" ? points : 0),
			imposterWins: prev.imposterWins + (winner === "imposters" ? points : 0),
		}));
	}, []);

	const resetScores = useCallback(() => {
		setSessionScores({ innocentsWins: 0, imposterWins: 0, gamesPlayed: 0 });
	}, []);

	const renderScreen = () => {
		switch (screen) {
			case "home":
				return <HomeScreen navigate={navigate} />;
			case "setup":
				return (
					<SetupScreen
						navigate={navigate}
						settings={settings}
						customWords={customWords}
						lastPlayers={lastPlayers}
						lastCategories={gameState?.savedCategories ?? null}
						lastImposterChoice={gameState?.savedImposterChoice ?? null}
					/>
				);
			case "playerReveal":
				return <PlayerRevealScreen navigate={navigate} gameState={gameState} />;
			case "wordReveal":
				return <WordRevealScreen navigate={navigate} gameState={gameState} />;
			case "discuss":
				return (
					<DiscussScreen
						navigate={navigate}
						gameState={gameState}
						settings={settings}
					/>
				);
			case "vote":
				return <VoteScreen navigate={navigate} gameState={gameState} />;
			case "doubleDown":
				return <DoubleDownScreen navigate={navigate} gameState={gameState} />;
			case "result":
				return (
					<ResultScreen
						navigate={navigate}
						gameState={gameState}
						settings={settings}
						sessionScores={sessionScores}
						onScoreUpdate={updateScore}
					/>
				);
			case "settings":
				return (
					<SettingsScreen
						navigate={navigate}
						settings={settings}
						onSettingsChange={updateSettings}
						sessionScores={sessionScores}
						onResetScores={resetScores}
					/>
				);
			case "customWords":
				return (
					<CustomWordsScreen
						navigate={navigate}
						customWords={customWords}
						onCustomWordsChange={setCustomWords}
					/>
				);
			default:
				return <HomeScreen navigate={navigate} />;
		}
	};

	return (
		<SafeAreaProvider>
			<ThemeProvider isDark={!settings.lightMode}>
				<StatusBar style={settings.lightMode ? "dark" : "light"} />
				{renderScreen()}
			</ThemeProvider>
		</SafeAreaProvider>
	);
}
