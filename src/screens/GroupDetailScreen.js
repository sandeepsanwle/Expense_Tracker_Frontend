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
  TextInput,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getGroups, updateGroup } from '../services/groupService';
import { getExpenses, deleteExpense } from '../services/expenseService';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import ExpenseItem from '../components/ExpenseItem';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import GroupEditorModal, { groupEditorModalStyles } from '../components/GroupEditorModal';

const GroupDetailScreen = ({ navigation, route }) => {
  const budgetId = route.params?.budgetId ?? route.params?.groupId;
  const nameParam = route.params?.budgetName ?? route.params?.groupName;
  const [groupMeta, setGroupMeta] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [expensesTotal, setExpensesTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, id: null, title: '' });
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    if (!budgetId) return;
    try {
      const [gRes, eRes] = await Promise.all([
        getGroups(),
        getExpenses(null, null, budgetId),
      ]);
      if (gRes.success) {
        const g = gRes.data.find((x) => String(x._id) === String(budgetId));
        setGroupMeta(g || null);
      }
      if (eRes.success) {
        setExpenses(eRes.data);
        setExpensesTotal(eRes.total);
      }
    } catch (err) {
      setError('Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [budgetId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadAll();
    }, [loadAll]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const openGroupEdit = () => {
    if (groupMeta) {
      setEditName(groupMeta.name || '');
      setEditBudget(String(groupMeta.budget ?? 0));
    } else {
      setEditName(nameParam || '');
      setEditBudget('0');
    }
    setGroupEditOpen(true);
  };

  const saveGroupEdit = async () => {
    if (!editName.trim()) {
      setError('Enter a budget name');
      return;
    }
    const b = editBudget.trim() === '' ? 0 : Number(editBudget);
    if (Number.isNaN(b) || b < 0) {
      setError('Invalid budget amount');
      return;
    }
    setSavingGroup(true);
    try {
      await updateGroup(budgetId, { name: editName.trim(), budget: b });
      setGroupEditOpen(false);
      navigation.setParams({ budgetName: editName.trim() });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update budget');
    } finally {
      setSavingGroup(false);
    }
  };

  const handleEdit = (expense) => {
    navigation.navigate('AddExpense', { expense, isEdit: true });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteExpense(deleteDialog.id);
      setDeleteDialog({ visible: false, id: null, title: '' });
      loadAll();
    } catch (err) {
      setError('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const displayName = groupMeta?.name || nameParam || 'Budget';
  const remaining = groupMeta?.remaining ?? 0;
  const remainingColor =
    remaining < 0 ? COLORS.error : remaining === 0 ? COLORS.warning : COLORS.success;

  const renderHeader = () => (
    <View>
      <Surface style={styles.summaryCard} elevation={3}>
        <View style={styles.summaryTop}>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Budget limit · all-time spend
            </Text>
            <Text variant="headlineSmall" style={styles.budgetLine}>
              {formatCurrency(groupMeta?.budget ?? 0)}
              <Text style={styles.budgetSub}> limit</Text>
            </Text>
          </View>
          <IconButton
            icon="pencil"
            mode="contained-tonal"
            containerColor="rgba(255,255,255,0.2)"
            iconColor="#FFFFFF"
            size={20}
            onPress={openGroupEdit}
            accessibilityLabel="Edit budget name and limit"
          />
        </View>
        <View style={styles.summaryStats}>
          <View>
            <Text style={styles.miniLabel}>Spent (total)</Text>
            <Text style={styles.miniValue}>{formatCurrency(groupMeta?.spent ?? 0)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View>
            <Text style={styles.miniLabel}>Left</Text>
            <Text style={[styles.miniValue, { color: remainingColor }]}>
              {formatCurrency(remaining)}
            </Text>
          </View>
        </View>
      </Surface>

      <Surface style={styles.totalsCard} elevation={1}>
        <Text variant="labelLarge" style={styles.totalsCardLabel}>
          Expenses in this budget
        </Text>
        <Text variant="titleMedium" style={styles.totalsCardAmount}>
          {formatCurrency(expensesTotal)}
        </Text>
        <Text variant="bodySmall" style={styles.totalsCardHint}>
          {expenses.length} transaction{expenses.length !== 1 ? 's' : ''} · dates shown on each
          item
        </Text>
      </Surface>

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Expenses
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.appBar} elevation={0}>
        <IconButton icon="arrow-left" iconColor={COLORS.text} onPress={() => navigation.goBack()} />
        <View style={styles.appBarText}>
          <Text variant="titleLarge" style={styles.appBarTitle} numberOfLines={1}>
            {displayName}
          </Text>
          <Text variant="bodySmall" style={styles.appBarSubtitle}>
            Budget · expenses use their own dates
          </Text>
        </View>
        <View style={{ width: 48 }} />
      </Surface>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ExpenseItem
            expense={item}
            onEdit={() => handleEdit(item)}
            onDelete={() => setDeleteDialog({ visible: true, id: item._id, title: item.title })}
            showGroupTag={false}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="receipt"
            title="No expenses yet"
            subtitle={`Add expenses to "${displayName}" — each keeps its own date.`}
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
      />

      <FAB
        icon="plus"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() =>
          navigation.navigate('AddExpense', {
            initialBudgetId: budgetId,
            initialBudgetName: displayName,
          })
        }
      />

      <GroupEditorModal
        visible={groupEditOpen}
        onDismiss={() => !savingGroup && setGroupEditOpen(false)}
        saving={savingGroup}
        icon="pencil-outline"
        iconBg={COLORS.primaryDark}
        title="Edit budget"
        subtitle="Rename or change the spending limit. Money already logged here is unchanged."
        primaryLabel="Save"
        onPrimary={saveGroupEdit}>
        <TextInput
          label="Budget name"
          value={editName}
          onChangeText={setEditName}
          mode="outlined"
          maxLength={80}
          placeholder="e.g. Groceries, Trip"
          left={<TextInput.Icon icon="tag-outline" />}
          style={groupEditorModalStyles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Budget limit (₹)"
          value={editBudget}
          onChangeText={setEditBudget}
          mode="outlined"
          keyboardType="numeric"
          left={<TextInput.Icon icon="currency-inr" />}
          style={groupEditorModalStyles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
      </GroupEditorModal>

      <ConfirmDialog
        visible={deleteDialog.visible}
        onDismiss={() => setDeleteDialog({ visible: false, id: null, title: '' })}
        onConfirm={confirmDelete}
        title="Delete expense"
        message={`Delete "${deleteDialog.title}"?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        icon="delete-outline"
        iconColor={COLORS.error}
        confirmColor={COLORS.error}
        loading={deleting}
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: Platform.OS === 'ios' ? 4 : 8,
    backgroundColor: COLORS.background,
  },
  appBarText: {
    flex: 1,
  },
  appBarTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  appBarSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    padding: 20,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  budgetLine: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  budgetSub: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  summaryStats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  miniLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  totalsCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },
  totalsCardLabel: {
    color: COLORS.textSecondary,
  },
  totalsCardAmount: {
    marginTop: 6,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalsCardHint: {
    marginTop: 8,
    color: COLORS.textSecondary,
    lineHeight: 18,
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
    paddingBottom: 120,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});

export default GroupDetailScreen;
