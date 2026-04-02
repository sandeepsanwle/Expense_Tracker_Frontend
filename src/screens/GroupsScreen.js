import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
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
  TextInput,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../services/groupService';
import { COLORS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import GroupEditorModal, { groupEditorModalStyles } from '../components/GroupEditorModal';

const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBudget, setNewBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [menuFor, setMenuFor] = useState(null);
  const [editGroup, setEditGroup] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBudget, setEditBudget] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({
    visible: false,
    id: null,
    name: '',
    expenseCount: 0,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await getGroups();
      if (data.success) setGroups(data.data);
    } catch (err) {
      setError('Failed to load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchGroups();
    }, [fetchGroups]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchGroups();
  };

  const openCreate = () => {
    setNewName('');
    setNewBudget('');
    setCreateOpen(true);
  };

  const submitCreate = async () => {
    if (!newName.trim()) {
      setError('Enter a budget name');
      return;
    }
    const b = newBudget.trim() === '' ? 0 : Number(newBudget);
    if (Number.isNaN(b) || b < 0) {
      setError('Budget must be a valid non-negative number');
      return;
    }
    setSaving(true);
    try {
      await createGroup(newName.trim(), b);
      setCreateOpen(false);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create budget');
    } finally {
      setSaving(false);
    }
  };

  const openEditGroup = (g) => {
    setMenuFor(null);
    setEditGroup(g);
    setEditName(g.name || '');
    setEditBudget(String(g.budget ?? 0));
  };

  const submitEditGroup = async () => {
    if (!editName.trim()) {
      setError('Enter a budget name');
      return;
    }
    const b = editBudget.trim() === '' ? 0 : Number(editBudget);
    if (Number.isNaN(b) || b < 0) {
      setError('Budget must be a valid non-negative number');
      return;
    }
    setSaving(true);
    try {
      await updateGroup(editGroup._id, { name: editName.trim(), budget: b });
      setEditGroup(null);
      fetchGroups();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update budget');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteGroup = async () => {
    setDeleting(true);
    try {
      await deleteGroup(deleteDialog.id);
      setDeleteDialog({ visible: false, id: null, name: '', expenseCount: 0 });
      fetchGroups();
    } catch (err) {
      setError('Failed to delete budget');
    } finally {
      setDeleting(false);
    }
  };

  const remainingColor = (remaining) => {
    if (remaining < 0) return COLORS.error;
    if (remaining === 0) return COLORS.warning;
    return COLORS.success;
  };

  const renderItem = ({ item }) => (
    <Surface style={styles.card} elevation={2}>
      <View style={styles.cardHeader}>
        <TouchableOpacity
          style={styles.cardTap}
          activeOpacity={0.75}
          onPress={() =>
            navigation.navigate('BudgetDetail', {
              budgetId: item._id,
              budgetName: item.name,
            })
          }>
          <View style={styles.tagIcon}>
            <Icon name="tag-multiple" size={22} color={COLORS.primary} />
          </View>
          <View style={styles.cardTitleBlock}>
            <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={styles.cardMeta}>
              {item.expenseCount} expense{item.expenseCount !== 1 ? 's' : ''} · tap for details
            </Text>
          </View>
          <Icon name="chevron-right" size={22} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <Menu
          visible={menuFor === item._id}
          onDismiss={() => setMenuFor(null)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              iconColor={COLORS.textSecondary}
              onPress={() => setMenuFor(item._id)}
            />
          }>
          <Menu.Item
            leadingIcon="pencil"
            onPress={() => openEditGroup(item)}
            title="Edit budget"
          />
          <Menu.Item
            leadingIcon="delete"
            title="Delete budget"
            titleStyle={{ color: COLORS.error }}
            onPress={() => {
              setMenuFor(null);
              setDeleteDialog({
                visible: true,
                id: item._id,
                name: item.name,
                expenseCount: item.expenseCount ?? 0,
              });
            }}
          />
        </Menu>
      </View>
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() =>
          navigation.navigate('BudgetDetail', {
            budgetId: item._id,
            budgetName: item.name,
          })
        }>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Limit</Text>
            <Text style={styles.statValue}>{formatCurrency(item.budget)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Spent</Text>
            <Text style={styles.statValue}>{formatCurrency(item.spent)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Left</Text>
            <Text style={[styles.statValue, { color: remainingColor(item.remaining) }]}>
              {formatCurrency(item.remaining)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Surface>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading budgets...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Surface style={styles.appBar} elevation={0}>
        <View>
          <Text variant="titleLarge" style={styles.appBarTitle}>
            Budgets
          </Text>
          <Text variant="bodySmall" style={styles.appBarSubtitle}>
            Organize spending, set limits, see what is left
          </Text>
        </View>
      </Surface>

      <FlatList
        data={groups}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-tag"
            title="No budgets yet"
            subtitle="Create a budget to track spending toward a limit"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB icon="plus" style={styles.fab} color="#FFFFFF" onPress={openCreate} />

      <GroupEditorModal
        visible={createOpen}
        onDismiss={() => !saving && setCreateOpen(false)}
        saving={saving}
        icon="tag-plus-outline"
        iconBg={COLORS.primary}
        title="New budget"
        subtitle="Pick a name and how much you want to spend in this bucket."
        primaryLabel="Create budget"
        onPrimary={submitCreate}>
        <TextInput
          label="Budget name"
          value={newName}
          onChangeText={setNewName}
          mode="outlined"
          maxLength={80}
          placeholder="e.g. Groceries, Trip"
          left={<TextInput.Icon icon="tag-outline" />}
          style={groupEditorModalStyles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
        <TextInput
          label="Budget (₹)"
          value={newBudget}
          onChangeText={setNewBudget}
          mode="outlined"
          keyboardType="numeric"
          placeholder="0"
          left={<TextInput.Icon icon="wallet-outline" />}
          style={groupEditorModalStyles.input}
          outlineColor={COLORS.border}
          activeOutlineColor={COLORS.primary}
        />
      </GroupEditorModal>

      <GroupEditorModal
        visible={!!editGroup}
        onDismiss={() => !saving && setEditGroup(null)}
        saving={saving}
        icon="pencil-outline"
        iconBg={COLORS.primaryDark}
        title="Edit budget"
        subtitle="Change the name or spending limit. Amounts already logged stay the same."
        primaryLabel="Save"
        onPrimary={submitEditGroup}>
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
          label="Budget (₹)"
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
        onDismiss={() =>
          setDeleteDialog({ visible: false, id: null, name: '', expenseCount: 0 })
        }
        onConfirm={confirmDeleteGroup}
        title="Delete budget"
        message={(() => {
          const n = deleteDialog.expenseCount ?? 0;
          const expensePart =
            n === 0
              ? 'There are no expenses in this budget.'
              : n === 1
                ? '1 expense in this budget will be permanently deleted.'
                : `${n} expenses in this budget will be permanently deleted.`;
          return `Warning — this cannot be undone.\n\n${expensePart} They will be removed from Home and your totals.\n\nDelete "${deleteDialog.name}"?`;
        })()}
        confirmLabel="Delete all"
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
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
  },
  appBar: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 12,
    backgroundColor: COLORS.background,
  },
  appBarTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  appBarSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    paddingTop: 8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginBottom: 12,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cardTap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 4,
  },
  tagIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleBlock: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontWeight: '700',
    color: COLORS.text,
  },
  cardMeta: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
    marginHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
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

export default GroupsScreen;
