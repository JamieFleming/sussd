import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@sussd_settings',
  CUSTOM_WORDS: '@sussd_custom_words',
};

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // fail silently — defaults will be used next launch
  }
}

export async function loadCustomWords() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CUSTOM_WORDS);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveCustomWords(words) {
  try {
    await AsyncStorage.setItem(KEYS.CUSTOM_WORDS, JSON.stringify(words));
  } catch {
    // fail silently
  }
}
