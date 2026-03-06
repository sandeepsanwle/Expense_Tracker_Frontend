import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
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
import { COLORS, MONTHS } from '../utils/constants';
import {
  formatCurrency,
  formatDateShort,
  getCurrentMonth,
  getCurrentYear,
  getYearOptions,
} from '../utils/helpers';
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

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses(selectedMonth, selectedYear);
      if (data.success) {
        setExpenses(data.data);
        setTotal(data.total);
      }
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExpenses();
    }, [fetchExpenses]),
  );

  const handleDelete = (id, title) => {
    setDeleteDialog({ visible: true, id, title });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(deleteDialog.id);
      setDeleteDialog({ visible: false, id: null, title: '' });
      fetchExpenses();
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
    fetchExpenses();
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
        onPress={() => navigation.navigate('AddExpense')}
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
