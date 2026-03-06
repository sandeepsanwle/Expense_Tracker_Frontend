import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface, Menu, Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS, MONTH_SHORT } from '../utils/constants';
import { getYearOptions } from '../utils/helpers';

const MonthFilter = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const [yearMenuVisible, setYearMenuVisible] = useState(false);
  const years = getYearOptions();

  return (
    <View style={styles.container}>
      {/* Year Selector */}
      <View style={styles.yearRow}>
        <Menu
          visible={yearMenuVisible}
          onDismiss={() => setYearMenuVisible(false)}
          anchor={
            <TouchableOpacity
              style={styles.yearButton}
              onPress={() => setYearMenuVisible(true)}>
              <Icon name="calendar" size={18} color={COLORS.primary} />
              <Text variant="labelLarge" style={styles.yearText}>
                {selectedYear}
              </Text>
              <Icon name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          }>
          {years.map((year) => (
            <Menu.Item
              key={year}
              title={year.toString()}
              onPress={() => {
                onYearChange(year);
                setYearMenuVisible(false);
              }}
              titleStyle={
                year === selectedYear
                  ? { color: COLORS.primary, fontWeight: '700' }
                  : {}
              }
            />
          ))}
        </Menu>
      </View>

      {/* Month Selector — horizontally scrollable chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.monthRow}>
        {MONTH_SHORT.map((label, index) => {
          const monthNum = index + 1;
          const isActive = monthNum === selectedMonth;
          return (
            <TouchableOpacity
              key={monthNum}
              style={[styles.monthChip, isActive && styles.monthChipActive]}
              onPress={() => onMonthChange(monthNum)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.monthChipText,
                  isActive && styles.monthChipTextActive,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  yearText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  monthRow: {
    gap: 6,
    paddingVertical: 2,
  },
  monthChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  monthChipActive: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  monthChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  monthChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default MonthFilter;
