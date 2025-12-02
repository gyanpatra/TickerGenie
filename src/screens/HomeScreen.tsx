import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import colors from '../theme/colors';
import { YouTubeAnalyst, AnalysisResult, DEFAULT_ANALYSTS } from '../types';
import { 
  AnalystDropdown, 
  CustomUrlInput, 
  ActionButton, 
  ResultsDisplay,
  EmailModal 
} from '../components';
import { analyzeVideo, sendResultsEmail, getLatestVideo } from '../services/api';

export const HomeScreen: React.FC = () => {
  const [selectedAnalyst, setSelectedAnalyst] = useState<YouTubeAnalyst | null>(
    DEFAULT_ANALYSTS[0] // Default to Morningstar
  );
  const [customUrl, setCustomUrl] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);

    try {
      let videoUrl = '';

      if (selectedAnalyst?.id === 'custom') {
        if (!customUrl.trim()) {
          setError('Please enter a YouTube video URL');
          setLoading(false);
          return;
        }
        videoUrl = customUrl.trim();
      } else if (selectedAnalyst) {
        // Get latest video from the channel
        const latestVideoResponse = await getLatestVideo(selectedAnalyst.channelUrl);
        if (!latestVideoResponse.success || !latestVideoResponse.data) {
          setError(latestVideoResponse.error || 'Failed to get latest video');
          setLoading(false);
          return;
        }
        videoUrl = latestVideoResponse.data.videoUrl;
      }

      // Analyze the video
      const analysisResponse = await analyzeVideo(videoUrl);
      
      if (!analysisResponse.success || !analysisResponse.data) {
        setError(analysisResponse.error || 'Failed to analyze video');
        setLoading(false);
        return;
      }

      setResults(analysisResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (email: string) => {
    if (!results) return;

    setEmailLoading(true);
    try {
      const response = await sendResultsEmail({ email, results });
      
      if (response.success) {
        setEmailModalVisible(false);
        showAlert('Success', 'Results have been sent to your email!');
      } else {
        showAlert('Error', response.error || 'Failed to send email');
      }
    } catch (err) {
      showAlert('Error', 'Failed to send email. Please try again.');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧞 TickerGenie</Text>
          <Text style={styles.subtitle}>
            Extract stock tickers from YouTube analyst videos
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <AnalystDropdown
            analysts={DEFAULT_ANALYSTS}
            selectedAnalyst={selectedAnalyst}
            onSelectAnalyst={setSelectedAnalyst}
          />

          <CustomUrlInput
            value={customUrl}
            onChangeText={setCustomUrl}
            visible={selectedAnalyst?.id === 'custom'}
          />

          <ActionButton
            title="Share Analyst Reco"
            onPress={handleAnalyze}
            loading={loading}
            disabled={selectedAnalyst?.id === 'custom' && !customUrl.trim()}
          />

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>

        {/* Results Section */}
        {results && (
          <View style={styles.resultsSection}>
            <ResultsDisplay results={results} loading={loading} />
            
            <ActionButton
              title="Email Results"
              onPress={() => setEmailModalVisible(true)}
              variant="secondary"
            />
          </View>
        )}
      </ScrollView>

      <EmailModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        onSend={handleSendEmail}
        loading={emailLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  resultsSection: {
    marginTop: 16,
  },
});

export default HomeScreen;
