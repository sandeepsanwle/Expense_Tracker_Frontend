import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Surface, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { getExpenses } from '../services/expenseService';
import { COLORS, MONTHS } from '../utils/constants';
import {
  formatCurrency,
  getCurrentMonth,
  getCurrentYear,
} from '../utils/helpers';
import MonthFilter from '../components/MonthFilter';
import EmptyState from '../components/EmptyState';

// Accordion item with smooth expand/collapse animation
const AccordionItem = ({ dateLabel, expenses, total }) => {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useSharedValue(0);
  const rotation = useSharedValue(0);

  const toggleExpand = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    animHeight.value = withTiming(newExpanded ? expenses.length * 52 + 8 : 0, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    rotation.value = withTiming(newExpanded ? 90 : 0, {
      duration: 250,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  };

  const animatedContentStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
    overflow: 'hidden',
  }));

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Surface style={styles.accordionCard} elevation={1}>
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.7}
        style={styles.accordionHeader}>
        <View style={styles.accordionLeft}>
          <Animated.View style={animatedArrowStyle}>
            <Icon name="chevron-right" size={24} color={COLORS.primary} />
          </Animated.View>
          <View style={styles.accordionTitleWrap}>
            <Text variant="titleSmall" style={styles.accordionTitle}>
              {dateLabel}
            </Text>
            <Text variant="bodySmall" style={styles.accordionCount}>
              {expenses.length} item{expenses.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        <Surface style={styles.totalBadge} elevation={0}>
          <Text variant="labelMedium" style={styles.totalBadgeText}>
            {formatCurrency(total)}
          </Text>
        </Surface>
      </TouchableOpacity>

      <Animated.View style={animatedContentStyle}>
        <View style={styles.treeContent}>
          {expenses.map((expense, index) => (
            <View key={expense._id} style={styles.treeItem}>
              <View style={styles.treeConnector}>
                <View style={styles.treeLine} />
                <View
                  style={[
                    styles.treeBranch,
                    index === expenses.length - 1 && styles.treeLastBranch,
                  ]}
                />
              </View>
              <View style={styles.treeItemContent}>
                <Icon
                  name="circle-small"
                  size={20}
                  color={COLORS.primary}
                />
                <Text variant="bodyMedium" style={styles.treeItemTitle}>
                  {expense.title}
                </Text>
                <Text variant="bodyMedium" style={styles.treeItemAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </Surface>
  );
};

const TreeViewScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenses(selectedMonth, selectedYear);
      if (data.success) {
        setExpenses(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      console.log('TreeView fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses]),
  );

  // Group by date
  const groupedByDate = () => {
    const groups = {};
    expenses.forEach((expense) => {
      const date = new Date(expense.date);
      const key = `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
      if (!groups[key]) {
        groups[key] = { expenses: [], total: 0 };
      }
      groups[key].expenses.push(expense);
      groups[key].total += expense.amount;
    });
    return groups;
  };

  const grouped = groupedByDate();
  const groupKeys = Object.keys(grouped);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={0}>
        <Text variant="titleLarge" style={styles.headerTitle}>
          Tree View
        </Text>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          Expenses grouped by date
        </Text>
      </Surface>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Month Total Card */}
        <Surface style={styles.monthTotalCard} elevation={3}>
          <Icon name="tree" size={36} color="rgba(255,255,255,0.3)" />
          <View style={styles.monthTotalTextWrap}>
            <Text variant="bodyMedium" style={styles.monthTotalLabel}>
              {MONTHS[selectedMonth - 1]} {selectedYear} Total
            </Text>
            <Text variant="headlineSmall" style={styles.monthTotalAmount}>
              {formatCurrency(total)}
            </Text>
          </View>
        </Surface>

        <MonthFilter
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : groupKeys.length === 0 ? (
          <EmptyState
            icon="file-tree-outline"
            title="No expenses"
            subtitle="Add expenses to see the tree view"
          />
        ) : (
          groupKeys.map((key) => (
            <AccordionItem
              key={key}
              dateLabel={key}
              expenses={grouped[key].expenses}
              total={grouped[key].total}
            />
          ))
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
    paddingBottom: 40,
  },
  monthTotalCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: '#00B894',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  monthTotalTextWrap: {
    flex: 1,
  },
  monthTotalLabel: {
    color: 'rgba(255,255,255,0.8)',
  },
  monthTotalAmount: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },
  centered: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  accordionCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  accordionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  accordionTitleWrap: {
    marginLeft: 8,
  },
  accordionTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  accordionCount: {
    color: COLORS.textSecondary,
  },
  totalBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  totalBadgeText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  treeContent: {
    paddingLeft: 20,
    paddingRight: 14,
    paddingBottom: 8,
  },
  treeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  treeConnector: {
    width: 24,
    alignItems: 'center',
  },
  treeLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    backgroundColor: COLORS.border,
    left: 11,
  },
  treeBranch: {
    width: 12,
    height: 1.5,
    backgroundColor: COLORS.border,
    position: 'absolute',
    left: 11,
  },
  treeLastBranch: {
    // The vertical line stops at the last branch
  },
  treeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  treeItemTitle: {
    flex: 1,
    color: COLORS.text,
  },
  treeItemAmount: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export default TreeViewScreen;
