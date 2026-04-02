import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getAnalytics } from '../services/expenseService';
import { getGroups } from '../services/groupService';
import { COLORS, MONTH_SHORT } from '../utils/constants';
import { formatCurrency, getCurrentYear, getYearOptions } from '../utils/helpers';

const screenWidth = Dimensions.get('window').width;

const remainingColor = (n) => {
  if (n < 0) return COLORS.error;
  if (n === 0) return COLORS.warning;
  return COLORS.success;
};

const AnalyticsScreen = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, gRes] = await Promise.all([
        getAnalytics(selectedYear),
        getGroups(),
      ]);
      if (aRes.success) setAnalyticsData(aRes);
      else setAnalyticsData(null);
      if (gRes.success) setBudgets(gRes.data || []);
      else setBudgets([]);
    } catch {
      setAnalyticsData(null);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll]),
  );

  const yearOptions = getYearOptions();

  const chartData = analyticsData
    ? {
        labels: MONTH_SHORT,
        datasets: [{ data: analyticsData.data.map((m) => m.total) }],
      }
    : null;

  const highestMonth = analyticsData?.data?.length
    ? analyticsData.data.reduce((max, m) => (m.total > max.total ? m : max))
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.header} elevation={0}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Analytics
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Spending by year and budget snapshots
        </Text>
      </Surface>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text variant="labelLarge" style={styles.sectionLabel}>
            Spending year
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearRow}>
            {yearOptions.map((year) => {
              const active = selectedYear === year;
              return (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearChip, active && styles.yearChipActive]}
                  onPress={() => setSelectedYear(year)}
                  activeOpacity={0.75}>
                  <Text
                    style={[styles.yearChipText, active && styles.yearChipTextActive]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading…</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text variant="labelLarge" style={styles.sectionLabel}>
                Budgets
              </Text>

              {budgets.length === 0 ? (
                <Surface style={styles.emptyBudgetsCard} elevation={1}>
                  <Icon name="wallet-plus-outline" size={40} color={COLORS.textSecondary} />
                  <Text variant="titleSmall" style={styles.emptyBudgetsTitle}>
                    No budgets yet
                  </Text>
                  <Text variant="bodySmall" style={styles.emptyBudgetsSub}>
                    Create budgets on the Budgets tab to track limits and what is left.
                  </Text>
                </Surface>
              ) : (
                budgets.map((b) => {
                    const limit = Number(b.budget) || 0;
                    const spent = Number(b.spent) || 0;
                    const left =
                      b.remaining !== undefined && b.remaining !== null
                        ? Number(b.remaining)
                        : limit - spent;
                    const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
                    return (
                      <Surface key={b._id} style={styles.budgetRowCard} elevation={2}>
                        <View style={styles.budgetRowTop}>
                          <View style={styles.budgetRowIcon}>
                            <Icon name="chart-pie" size={20} color={COLORS.primary} />
                          </View>
                          <View style={styles.budgetRowTitleBlock}>
                            <Text variant="titleSmall" style={styles.budgetRowName} numberOfLines={1}>
                              {b.name}
                            </Text>
                            <Text variant="bodySmall" style={styles.budgetRowMeta}>
                              {b.expenseCount || 0} expense{(b.expenseCount || 0) !== 1 ? 's' : ''}
                            </Text>
                          </View>
                          <View style={styles.budgetRowRemaining}>
                            <Text style={styles.budgetRowRemainingLabel}>Left</Text>
                            <Text
                              style={[
                                styles.budgetRowRemainingValue,
                                { color: remainingColor(left) },
                              ]}>
                              {formatCurrency(left)}
                            </Text>
                          </View>
                        </View>
                        {limit > 0 ? (
                          <View style={styles.progressTrack}>
                            <View style={[styles.progressFill, { width: `${pct}%` }]} />
                          </View>
                        ) : null}
                        <View style={styles.budgetRowStats}>
                          <View style={styles.budgetRowStat}>
                            <Text style={styles.budgetRowStatLabel}>Limit</Text>
                            <Text style={styles.budgetRowStatValue}>{formatCurrency(limit)}</Text>
                          </View>
                          <View style={styles.budgetRowStat}>
                            <Text style={styles.budgetRowStatLabel}>Spent</Text>
                            <Text style={styles.budgetRowStatValue}>{formatCurrency(spent)}</Text>
                          </View>
                        </View>
                      </Surface>
                    );
                  })
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <Icon name="chart-bar" size={22} color={COLORS.primary} />
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Spending in {selectedYear}
                </Text>
              </View>

              {!analyticsData ? (
                <Surface style={styles.emptyBudgetsCard} elevation={1}>
                  <Text variant="bodyMedium" style={styles.emptyBudgetsSub}>
                    Could not load yearly totals.
                  </Text>
                </Surface>
              ) : (
                <>
                  <View style={styles.yearSummaryRow}>
                    <Surface style={[styles.yearSummaryCard, styles.yearSummaryPrimary]} elevation={3}>
                      <Icon name="calendar-star" size={24} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.yearSummaryLabel}>Year total</Text>
                      <Text style={styles.yearSummaryValue}>
                        {formatCurrency(analyticsData.yearTotal)}
                      </Text>
                    </Surface>
                    <Surface style={[styles.yearSummaryCard, styles.yearSummaryAccent]} elevation={3}>
                      <Icon name="trophy-outline" size={24} color="rgba(255,255,255,0.35)" />
                      <Text style={styles.yearSummaryLabel}>Peak month</Text>
                      <Text style={styles.yearSummaryValue} numberOfLines={1}>
                        {highestMonth?.label ?? '—'}
                      </Text>
                      <Text style={styles.yearSummarySub}>
                        {highestMonth ? formatCurrency(highestMonth.total) : ''}
                      </Text>
                    </Surface>
                  </View>

                  <Surface style={styles.chartCard} elevation={2}>
                    <Text variant="titleSmall" style={styles.chartTitle}>
                      By month
                    </Text>
                    {chartData && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <BarChart
                          data={chartData}
                          width={Math.max(screenWidth - 48, MONTH_SHORT.length * 55)}
                          height={240}
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
                            barPercentage: 0.55,
                            propsForBackgroundLines: {
                              strokeDasharray: '4 4',
                              stroke: COLORS.border,
                            },
                            propsForLabels: { fontSize: 10 },
                          }}
                          style={styles.chart}
                        />
                      </ScrollView>
                    )}
                  </Surface>

                  <Surface style={styles.breakdownCard} elevation={2}>
                    <Text variant="titleSmall" style={styles.breakdownTitle}>
                      Month by month
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
                                width:
                                  analyticsData.yearTotal > 0
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
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  sectionTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  yearRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  yearChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  yearChipActive: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  yearChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  yearChipTextActive: {
    color: '#FFFFFF',
  },
  centered: {
    paddingVertical: 64,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  emptyBudgetsCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 28,
    alignItems: 'center',
  },
  emptyBudgetsTitle: {
    marginTop: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyBudgetsSub: {
    marginTop: 8,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  budgetRowCard: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    padding: 14,
    marginBottom: 10,
  },
  budgetRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  budgetRowTitleBlock: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },
  budgetRowName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  budgetRowMeta: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  budgetRowRemaining: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  budgetRowRemainingLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  budgetRowRemainingValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: 3,
    maxWidth: '100%',
  },
  budgetRowStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    justifyContent: 'space-between',
  },
  budgetRowStat: {
    flex: 1,
  },
  budgetRowStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  budgetRowStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  yearSummaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  yearSummaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 16,
    minHeight: 112,
  },
  yearSummaryPrimary: {
    backgroundColor: COLORS.primary,
  },
  yearSummaryAccent: {
    backgroundColor: COLORS.secondary,
  },
  yearSummaryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
  yearSummaryValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  yearSummarySub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginTop: 4,
  },
  chartCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  chart: {
    borderRadius: 14,
  },
  breakdownCard: {
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    padding: 16,
  },
  breakdownTitle: {
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownMonth: {
    width: 38,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  breakdownBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.background,
    borderRadius: 4,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  breakdownBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  breakdownAmount: {
    width: 76,
    textAlign: 'right',
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 12,
  },
});

export default AnalyticsScreen;
