import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Text, Surface, ActivityIndicator, Chip } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getAnalytics } from '../services/expenseService';
import { COLORS, MONTH_SHORT } from '../utils/constants';
import { formatCurrency, getCurrentYear, getYearOptions } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnalytics(selectedYear);
      if (data.success) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.log('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchAnalytics();
    }, [fetchAnalytics]),
  );

  const chartData = analyticsData
    ? {
        labels: MONTH_SHORT,
        datasets: [
          {
            data: analyticsData.data.map((m) => m.total),
          },
        ],
      }
    : null;

  // Find highest spending month
  const highestMonth = analyticsData
    ? analyticsData.data.reduce(
        (max, m) => (m.total > max.total ? m : max),
        { total: 0, label: '-' },
      )
    : null;

  const yearOptions = getYearOptions();

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Analytics
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          Monthly spending comparison
        </Text>
      </Surface>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <Text variant="titleSmall" style={styles.yearLabel}>
            Select Year
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearChips}>
            {yearOptions.map((year) => (
              <Chip
                key={year}
                selected={selectedYear === year}
                onPress={() => setSelectedYear(year)}
                style={[
                  styles.yearChip,
                  selectedYear === year && styles.yearChipActive,
                ]}
                textStyle={[
                  styles.yearChipText,
                  selectedYear === year && styles.yearChipTextActive,
                ]}
                showSelectedOverlay={false}>
                {year}
              </Chip>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : !analyticsData ? (
          <View style={styles.centered}>
            <Icon name="chart-bar" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <Surface style={[styles.summaryCard, { backgroundColor: COLORS.primary }]} elevation={3}>
                <Icon name="cash" size={28} color="rgba(255,255,255,0.4)" />
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Year Total
                </Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {formatCurrency(analyticsData.yearTotal)}
                </Text>
              </Surface>

              <Surface style={[styles.summaryCard, { backgroundColor: '#00B894' }]} elevation={3}>
                <Icon name="trending-up" size={28} color="rgba(255,255,255,0.4)" />
                <Text variant="bodySmall" style={styles.summaryLabel}>
                  Highest Month
                </Text>
                <Text variant="titleMedium" style={styles.summaryValue}>
                  {highestMonth?.label || '-'}
                </Text>
                <Text variant="bodySmall" style={styles.summarySubValue}>
                  {highestMonth ? formatCurrency(highestMonth.total) : ''}
                </Text>
              </Surface>
            </View>

            {/* Bar Chart */}
            <Surface style={styles.chartCard} elevation={2}>
              <Text variant="titleSmall" style={styles.chartTitle}>
                Monthly Spending — {selectedYear}
              </Text>
              {chartData && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={chartData}
                    width={Math.max(screenWidth - 48, MONTH_SHORT.length * 55)}
                    height={260}
                    yAxisLabel="₹"
                    yAxisSuffix=""
                    fromZero
                    showValuesOnTopOfBars
                    chartConfig={{
                      backgroundColor: COLORS.surface,
                      backgroundGradientFrom: COLORS.surface,
                      backgroundGradientTo: COLORS.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                      labelColor: () => COLORS.textSecondary,
                      barPercentage: 0.5,
                      propsForBackgroundLines: {
                        strokeDasharray: '4 4',
                        stroke: COLORS.border,
                      },
                      propsForLabels: {
                        fontSize: 10,
                      },
                    }}
                    style={styles.chart}
                  />
                </ScrollView>
              )}
            </Surface>

            {/* Monthly Breakdown */}
            <Surface style={styles.breakdownCard} elevation={2}>
              <Text variant="titleSmall" style={styles.breakdownTitle}>
                Monthly Breakdown
              </Text>
              {analyticsData.data.map((month) => (
                <View key={month.month} style={styles.breakdownRow}>
                  <Text variant="bodyMedium" style={styles.breakdownMonth}>
                    {month.label}
                  </Text>
                  <View style={styles.breakdownBarWrap}>
                    <View
                      style={[
                        styles.breakdownBar,
                        {
                          width: analyticsData.yearTotal > 0
                            ? `${(month.total / analyticsData.yearTotal) * 100}%`
                            : '0%',
                        },
                      ]}
                    />
                  </View>
                  <Text variant="bodySmall" style={styles.breakdownAmount}>
                    {formatCurrency(month.total)}
                  </Text>
                </View>
              ))}
            </Surface>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  yearSelector: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  yearLabel: {
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  yearChips: {
    gap: 8,
  },
  yearChip: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  yearChipActive: {
    backgroundColor: COLORS.primary,
  },
  yearChipText: {
    color: COLORS.textSecondary,
  },
  yearChipTextActive: {
    color: '#FFFFFF',
  },
  centered: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  emptyText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  summarySubValue: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  chartTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 12,
  },
  breakdownCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  breakdownTitle: {
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownMonth: {
    width: 36,
    color: COLORS.textSecondary,
    fontWeight: '500',
    fontSize: 12,
  },
  breakdownBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  breakdownAmount: {
    width: 70,
    textAlign: 'right',
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 11,
  },
});

export default AnalyticsScreen;
