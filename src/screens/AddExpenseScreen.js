import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TextInput,
  Button,
  Surface,
  IconButton,
  Snackbar,
} from 'react-native-paper';
import { createExpense, updateExpense } from '../services/expenseService';
import { COLORS } from '../utils/constants';

const AddExpenseScreen = ({ navigation, route }) => {
  const isEdit = route.params?.isEdit || false;
  const existingExpense = route.params?.expense || null;

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit && existingExpense) {
      setTitle(existingExpense.title);
      setAmount(existingExpense.amount.toString());
    }
  }, [isEdit, existingExpense]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!amount.trim() || isNaN(amount) || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await updateExpense(existingExpense._id, {
          title: title.trim(),
          amount: Number(amount),
        });
      } else {
        await createExpense(title.trim(), Number(amount));
      }
      navigation.goBack();
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Surface style={styles.header} elevation={0}>
          <IconButton
            icon="arrow-left"
            iconColor={COLORS.text}
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={styles.headerTitle}>
            {isEdit ? 'Edit Expense' : 'Add Expense'}
          </Text>
          <View style={{ width: 48 }} />
        </Surface>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Surface style={styles.formCard} elevation={2}>
            <View style={styles.iconHeader}>
              <Surface style={styles.iconCircle} elevation={3}>
                <IconButton
                  icon={isEdit ? 'pencil' : 'plus-circle'}
                  iconColor={COLORS.primary}
                  size={32}
                />
              </Surface>
            </View>

            <TextInput
              label="Expense Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              placeholder="e.g., Groceries, Rent, Food"
              left={<TextInput.Icon icon="tag" />}
              style={styles.input}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
              maxLength={100}
            />

            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              placeholder="e.g., 500"
              left={<TextInput.Icon icon="currency-inr" />}
              style={styles.input}
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />

            <View style={styles.infoRow}>
              <IconButton icon="calendar" iconColor={COLORS.textSecondary} size={18} />
              <Text variant="bodyMedium" style={styles.infoText}>
                {isEdit
                  ? `Created: ${new Date(existingExpense.date).toLocaleDateString()}`
                  : `Date: ${new Date().toLocaleDateString()}`}
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading}
              style={styles.submitButton}
              buttonColor={COLORS.primary}
              contentStyle={styles.submitButtonContent}
              icon={isEdit ? 'check' : 'plus'}>
              {isEdit ? 'Update Expense' : 'Add Expense'}
            </Button>

            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              textColor={COLORS.textSecondary}>
              Cancel
            </Button>
          </Surface>
        </ScrollView>

        <Snackbar
          visible={!!error}
          onDismiss={() => setError('')}
          duration={3000}
          style={styles.snackbar}>
          {error}
        </Snackbar>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 56 : 8,
    paddingHorizontal: 4,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontWeight: '600',
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
  },
  iconHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingRight: 12,
  },
  infoText: {
    color: COLORS.textSecondary,
  },
  submitButton: {
    borderRadius: 12,
    marginBottom: 12,
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
  cancelButton: {
    borderRadius: 12,
    borderColor: COLORS.border,
  },
  snackbar: {
    backgroundColor: COLORS.error,
  },
});

export default AddExpenseScreen;
