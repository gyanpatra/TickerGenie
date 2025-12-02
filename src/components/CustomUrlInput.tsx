import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

interface CustomUrlInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  visible?: boolean;
}

const DEFAULT_CHANNEL_URL = 'https://www.youtube.com/@morningstar';

export const CustomUrlInput: React.FC<CustomUrlInputProps> = ({
  value,
  onChangeText,
  placeholder = DEFAULT_CHANNEL_URL,
  visible = true,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Or enter a YouTube analyst channel URL</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inputPlaceholder}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        accessibilityLabel="Custom YouTube URL input"
        defaultValue={DEFAULT_CHANNEL_URL}
      />
      <Text style={styles.hint}>
        Enter a YouTube channel URL to analyze the latest video
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.inputText,
    fontSize: 16,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
});

export default CustomUrlInput;
