import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';
import { TickerRating } from '../types';

interface TickerCardProps {
  ticker: TickerRating;
  rank?: number;
  isTopPick?: boolean;
}

export const TickerCard: React.FC<TickerCardProps> = ({ 
  ticker, 
  rank,
  isTopPick = false 
}) => {
  const getRatingColor = (rating: string) => {
    const lowerRating = rating.toLowerCase();
    if (lowerRating.includes('strong buy') || lowerRating.includes('strongbuy')) {
      return colors.success;
    }
    if (lowerRating.includes('buy')) {
      return '#4CAF50';
    }
    if (lowerRating.includes('hold') || lowerRating.includes('neutral')) {
      return colors.warning;
    }
    if (lowerRating.includes('sell')) {
      return colors.error;
    }
    return colors.textSecondary;
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  const formatUpside = (upside: number | null) => {
    if (upside === null) return 'N/A';
    const prefix = upside >= 0 ? '+' : '';
    return `${prefix}${upside.toFixed(1)}%`;
  };

  return (
    <View style={[styles.card, isTopPick && styles.topPickCard]}>
      {isTopPick && rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.ticker}>{ticker.ticker}</Text>
        <View style={[styles.ratingBadge, { backgroundColor: getRatingColor(ticker.rating) }]}>
          <Text style={styles.ratingText}>{ticker.rating}</Text>
        </View>
      </View>
      
      <Text style={styles.companyName}>{ticker.companyName}</Text>
      
      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Current</Text>
          <Text style={styles.priceValue}>{formatPrice(ticker.currentPrice)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Target</Text>
          <Text style={styles.priceValue}>{formatPrice(ticker.targetPrice)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={styles.priceLabel}>Upside</Text>
          <Text style={[
            styles.priceValue,
            { color: ticker.upside && ticker.upside >= 0 ? colors.success : colors.error }
          ]}>
            {formatUpside(ticker.upside)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.analysts}>
        {ticker.numberOfAnalysts} analyst{ticker.numberOfAnalysts !== 1 ? 's' : ''} rating
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topPickCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  rankBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rankText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ticker: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  ratingBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: {
    color: colors.buttonText,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  companyName: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  priceLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 2,
  },
  priceValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  analysts: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default TickerCard;
