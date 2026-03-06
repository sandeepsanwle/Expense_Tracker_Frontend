import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/constants';

const EmptyState = ({ icon = 'receipt', title, subtitle }) => {
  return (
    <View style={styles.container}>
      <Surface style={styles.iconCircle} elevation={2}>
        <Icon name={icon} size={48} color={COLORS.border} />
      </Surface>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      {subtitle && (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});

export default EmptyState;
