import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Surface, IconButton, Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/constants';

const GroupEditorModal = ({
  visible,
  onDismiss,
  saving,
  icon,
  iconBg,
  title,
  subtitle,
  primaryLabel,
  onPrimary,
  children,
}) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    statusBarTranslucent
    onRequestClose={() => !saving && onDismiss()}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={groupEditorModalStyles.kav}>
      <View style={groupEditorModalStyles.overlay}>
        <Pressable
          style={groupEditorModalStyles.backdrop}
          onPress={() => !saving && onDismiss()}
          accessibilityRole="button"
          accessibilityLabel="Close dialog"
        />
        <View style={groupEditorModalStyles.sheetOuter} pointerEvents="box-none">
          <Surface style={groupEditorModalStyles.sheet} elevation={4}>
            <View style={groupEditorModalStyles.sheetHeader}>
              <View style={groupEditorModalStyles.sheetHeaderMain}>
                <View
                  style={[
                    groupEditorModalStyles.sheetIconWrap,
                    iconBg ? { backgroundColor: iconBg } : {},
                  ]}>
                  <Icon name={icon} size={26} color="#FFFFFF" />
                </View>
                <View style={groupEditorModalStyles.sheetHeaderText}>
                  <Text variant="titleLarge" style={groupEditorModalStyles.sheetTitle}>
                    {title}
                  </Text>
                  <Text variant="bodyMedium" style={groupEditorModalStyles.sheetSubtitle}>
                    {subtitle}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="close"
                size={22}
                iconColor={COLORS.textSecondary}
                style={groupEditorModalStyles.sheetClose}
                onPress={() => !saving && onDismiss()}
                disabled={saving}
              />
            </View>
            <View style={groupEditorModalStyles.sheetBody}>{children}</View>
            <View style={groupEditorModalStyles.sheetActions}>
              <Button
                mode="outlined"
                onPress={onDismiss}
                disabled={saving}
                style={[
                  groupEditorModalStyles.actionBtn,
                  groupEditorModalStyles.actionBtnOutline,
                ]}
                contentStyle={groupEditorModalStyles.actionBtnContent}
                textColor={COLORS.text}
                labelStyle={groupEditorModalStyles.actionLabel}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={onPrimary}
                loading={saving}
                disabled={saving}
                buttonColor={COLORS.primary}
                style={groupEditorModalStyles.actionBtn}
                contentStyle={groupEditorModalStyles.actionBtnContent}
                labelStyle={groupEditorModalStyles.actionLabel}>
                {primaryLabel}
              </Button>
            </View>
          </Surface>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const groupEditorModalStyles = StyleSheet.create({
  kav: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 52, 54, 0.55)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetOuter: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  sheet: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 22,
    paddingRight: 4,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sheetHeaderMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  sheetClose: {
    margin: 0,
    marginTop: -4,
  },
  sheetIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetHeaderText: {
    flex: 1,
    marginLeft: 14,
    paddingTop: 2,
  },
  sheetTitle: {
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 12,
  },
  actionBtnOutline: {
    borderColor: COLORS.border,
  },
  actionBtnContent: {
    paddingVertical: 6,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    marginBottom: 14,
    backgroundColor: COLORS.surface,
  },
});

export default GroupEditorModal;
export { groupEditorModalStyles };
