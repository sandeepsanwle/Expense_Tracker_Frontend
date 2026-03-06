import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Text, Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/constants';

const ConfirmDialog = ({
  visible,
  onDismiss,
  onConfirm,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  icon = 'alert-circle-outline',
  iconColor = COLORS.error,
  confirmColor = COLORS.error,
  loading = false,
}) => {
  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}>
        <Dialog.Content style={styles.content}>
          <Icon name={icon} size={52} color={iconColor} style={styles.icon} />
          <Text variant="titleLarge" style={styles.title}>
            {title}
          </Text>
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelBtn}
            textColor={COLORS.textSecondary}
            contentStyle={styles.btnContent}>
            {cancelLabel}
          </Button>
          <Button
            mode="contained"
            onPress={onConfirm}
            loading={loading}
            disabled={loading}
            buttonColor={confirmColor}
            style={styles.confirmBtn}
            contentStyle={styles.btnContent}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    maxWidth: 400,
    alignSelf: 'center',
  },
  content: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 8,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    justifyContent: 'center',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderColor: COLORS.border,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
  },
  btnContent: {
    paddingVertical: 4,
  },
});

export default ConfirmDialog;
