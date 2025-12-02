import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import colors from '../theme/colors';
import { AnalysisResult } from '../types';
import TickerCard from './TickerCard';

interface ResultsDisplayProps {
  results: AnalysisResult | null;
  loading?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  results,
  loading = false 
}) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Analyzing video...</Text>
        <Text style={styles.loadingSubtext}>
          Extracting tickers and fetching ratings
        </Text>
      </View>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{results.videoTitle}</Text>
        <Text style={styles.channelName}>{results.channelName}</Text>
        <Text style={styles.date}>
          Analyzed on {new Date(results.analysisDate).toLocaleDateString()}
        </Text>
      </View>

      {/* Extracted Tickers Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Extracted Tickers ({results.extractedTickers.length})
        </Text>
        <View style={styles.tickerList}>
          {results.extractedTickers.map((ticker) => (
            <View key={ticker} style={styles.tickerBadge}>
              <Text style={styles.tickerBadgeText}>{ticker}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Top 5 Picks */}
      {results.topPicks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Top 5 Picks</Text>
          <Text style={styles.sectionSubtitle}>
            Based on analyst ratings and upside potential
          </Text>
          {results.topPicks.map((ticker, index) => (
            <TickerCard 
              key={ticker.ticker} 
              ticker={ticker} 
              rank={index + 1}
              isTopPick 
            />
          ))}
        </View>
      )}

      {/* All Ratings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Analyst Ratings</Text>
        {results.tickerRatings.map((ticker) => (
          <TickerCard key={ticker.ticker} ticker={ticker} />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  loadingSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  videoInfo: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  videoTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  channelName: {
    color: colors.primary,
    fontSize: 14,
    marginBottom: 4,
  },
  date: {
    color: colors.textMuted,
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  tickerList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tickerBadgeText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ResultsDisplay;
