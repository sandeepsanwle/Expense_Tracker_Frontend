import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, IconButton } from 'react-native-paper';
import { COLORS } from '../utils/constants';
import { formatCurrency, formatDateShort } from '../utils/helpers';

const ExpenseItem = ({ expense, onEdit, onDelete, showGroupTag = false }) => {
  const groupLabel =
    expense.group && typeof expense.group === 'object'
      ? expense.group.name
      : null;

  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.leftSection}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>
            {expense.title.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.details}>
          <Text variant="titleSmall" style={styles.title} numberOfLines={1}>
            {expense.title}
          </Text>
          {showGroupTag && groupLabel ? (
            <View style={styles.tagRow}>
              <Text style={styles.groupTag}>{groupLabel}</Text>
              <Text variant="bodySmall" style={styles.date}>
                {formatDateShort(expense.date)}
              </Text>
            </View>
          ) : (
            <Text variant="bodySmall" style={styles.date}>
              {formatDateShort(expense.date)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        <Text variant="titleSmall" style={styles.amount}>
          {formatCurrency(expense.amount)}
        </Text>
        <View style={styles.actions}>
          <IconButton
            icon="pencil-outline"
            iconColor={COLORS.primary}
            size={18}
            onPress={onEdit}
            style={styles.actionBtn}
          />
          <IconButton
            icon="delete-outline"
            iconColor={COLORS.error}
            size={18}
            onPress={onDelete}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    padding: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  groupTag: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '700',
    color: COLORS.text,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 2,
  },
  actionBtn: {
    margin: 0,
    width: 30,
    height: 30,
  },
});

export default ExpenseItem;
