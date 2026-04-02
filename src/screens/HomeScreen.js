import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  FAB,
  Surface,
  ActivityIndicator,
  Snackbar,
  IconButton,
  Menu,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../context/AuthContext';
import { getExpenses, deleteExpense } from '../services/expenseService';
import { getGroups } from '../services/groupService';
import { COLORS, MONTHS } from '../utils/constants';
import { formatCurrency, getCurrentMonth, getCurrentYear } from '../utils/helpers';
import ExpenseItem from '../components/ExpenseItem';
import MonthFilter from '../components/MonthFilter';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, id: null, title: '' });
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupFilter, setGroupFilter] = useState('all');

  const loadData = useCallback(async () => {
    try {
      const gRes = await getGroups();
      const list = gRes.success ? gRes.data || [] : [];
      setGroups(list);

      let effectiveFilter = groupFilter;
      if (
        effectiveFilter !== 'all' &&
        effectiveFilter !== 'none' &&
        !list.some((g) => String(g._id) === String(effectiveFilter))
      ) {
        effectiveFilter = 'all';
        setGroupFilter('all');
      }

      const groupQueryParam =
        effectiveFilter === 'all'
          ? undefined
          : effectiveFilter === 'none'
            ? 'none'
            : effectiveFilter;

      const eRes = await getExpenses(selectedMonth, selectedYear, groupQueryParam);
      if (eRes.success) {
        setExpenses(eRes.data);
        setTotal(eRes.total);
      }
    } catch {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear, groupFilter]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData]),
  );

  const handleDelete = (id, title) => {
    setDeleteDialog({ visible: true, id, title });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(deleteDialog.id);
      setDeleteDialog({ visible: false, id: null, title: '' });
      loadData();
    } catch (err) {
      setError('Failed to delete expense');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (expense) => {
    navigation.navigate('AddExpense', { expense, isEdit: true });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    setMenuVisible(false);
    setLogoutDialog(true);
  };

  const confirmLogout = () => {
    setLogoutDialog(false);
    logout();
  };

  const renderHeader = () => (
    <View>
      {/* Total Card */}
      <Surface style={styles.totalCard} elevation={4}>
        <View style={styles.totalCardContent}>
          <View>
            <Text variant="bodyMedium" style={styles.totalLabel}>
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </Text>
            <Text variant="headlineMedium" style={styles.totalAmount}>
              {formatCurrency(total)}
            </Text>
            <Text variant="bodySmall" style={styles.totalSubtext}>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''} this month
              {groupFilter !== 'all' && (
                <Text style={styles.filterHint}>
                  {' '}
                  ·{' '}
                  {groupFilter === 'none'
                    ? 'No budget only'
                    : groups.find((g) => String(g._id) === String(groupFilter))?.name ||
                      'Filtered'}
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.totalIconContainer}>
            <Icon name="cash-multiple" size={48} color="rgba(255,255,255,0.3)" />
          </View>
        </View>
      </Surface>

      {/* Month Filter */}
      <MonthFilter
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

      {groups.length > 0 && (
        <View style={styles.groupFilterBlock}>
          <Text variant="labelLarge" style={styles.groupFilterTitle}>
            Budget
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.groupChipRow}>
            <TouchableOpacity
              style={[styles.groupChip, groupFilter === 'all' && styles.groupChipActive]}
              onPress={() => setGroupFilter('all')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.groupChipText,
                  groupFilter === 'all' && styles.groupChipTextActive,
                ]}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.groupChip, groupFilter === 'none' && styles.groupChipActive]}
              onPress={() => setGroupFilter('none')}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.groupChipText,
                  groupFilter === 'none' && styles.groupChipTextActive,
                ]}>
                No budget
              </Text>
            </TouchableOpacity>
            {groups.map((g) => {
              const active = String(groupFilter) === String(g._id);
              return (
                <TouchableOpacity
                  key={g._id}
                  style={[styles.groupChip, active && styles.groupChipActive]}
                  onPress={() => setGroupFilter(String(g._id))}
                  activeOpacity={0.7}>
                  <Text
                    style={[styles.groupChipText, active && styles.groupChipTextActive]}
                    numberOfLines={1}>
                    {g.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Expenses
        </Text>
        <Text variant="bodySmall" style={styles.sectionCount}>
          {expenses.length} items
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading expenses...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <Surface style={styles.appBar} elevation={0}>
        <View>
          <Text variant="titleLarge" style={styles.appBarTitle}>
            Hello, {user?.name?.split(' ')[0]}
          </Text>
          <Text variant="bodySmall" style={styles.appBarSubtitle}>
            Manage your expenses
          </Text>
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              iconColor={COLORS.text}
              onPress={() => setMenuVisible(true)}
            />
          }>
          <Menu.Item
            leadingIcon="logout"
            onPress={handleLogout}
            title="Logout"
          />
        </Menu>
      </Surface>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => handleDelete(item._id, item.title)}
            showGroupTag={groupFilter === 'all' || groupFilter === 'none'}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="receipt"
            title="No expenses found"
            subtitle={`No expenses for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          />
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentInset={{ bottom: 24 }}
        contentInsetAdjustmentBehavior="automatic"
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() =>
          navigation.navigate('AddExpense', {
            initialBudgetId: undefined,
            initialBudgetName: undefined,
            expense: undefined,
            isEdit: false,
          })
        }
      />

      <ConfirmDialog
        visible={deleteDialog.visible}
        onDismiss={() => setDeleteDialog({ visible: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        icon="delete-circle-outline"
        iconColor={COLORS.error}
        confirmColor={COLORS.error}
        loading={deleting}
      />

      <ConfirmDialog
        visible={logoutDialog}
        onDismiss={() => setLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to login again."
        confirmLabel="Logout"
        cancelLabel="Stay"
        icon="logout"
        iconColor={COLORS.primary}
        confirmColor={COLORS.primary}
      />

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        style={styles.snackbar}>
        {error}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  appBarTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  appBarSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  totalCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    overflow: 'hidden',
  },
  totalCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  totalAmount: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 4,
  },
  totalSubtext: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  filterHint: {
    color: 'rgba(255,255,255,0.95)',
    fontWeight: '600',
  },
  groupFilterBlock: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  groupFilterTitle: {
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  groupChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  groupChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    maxWidth: 160,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  groupChipActive: {
    backgroundColor: COLORS.primary,
    elevation: 3,
  },
  groupChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  groupChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  totalIconContainer: {
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  sectionCount: {
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingBottom: 140,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});

export default HomeScreen;
