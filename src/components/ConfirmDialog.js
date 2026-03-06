import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Surface, Text, Button } from 'react-native-paper';
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
      {visible && (
        <View style={styles.overlay}>
          <Surface style={styles.dialog} elevation={4}>
            <View style={styles.content}>
              <Icon name={icon} size={36} color={iconColor} style={styles.icon} />
              <Text variant="titleMedium" style={styles.title}>
                {title}
              </Text>
              <Text variant="bodySmall" style={styles.message}>
                {message}
              </Text>
            </View>
            <View style={styles.actions}>
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
            </View>
          </Surface>
        </View>
      )}
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    width: '100%',
    maxWidth: 340,
  },
  content: {
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    color: COLORS.textSecondary,
    textAlign: 'left',
    lineHeight: 22,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    borderRadius: 12,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  confirmBtn: {
    borderRadius: 12,
  },
  btnContent: {
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
});

export default ConfirmDialog;
