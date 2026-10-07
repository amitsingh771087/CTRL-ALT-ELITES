import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppNotification, RootStackParamList } from '../types';
import { colors, spacing, radius } from '../theme/colors';
import { typography } from '../theme/typography';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as schemeService from '../services/schemeService';

type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

/** "New matching scheme notification" from the flowchart. */
export function NotificationsScreen({ navigation }: Props): JSX.Element {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const result = await schemeService.listNotifications();
    setItems(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onPressItem = async (item: AppNotification) => {
    if (!item.isRead) await schemeService.markNotificationRead(item._id);
    if (item.scheme) navigation.navigate('SchemeDetail', { schemeId: item.scheme._id });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.item, !item.isRead && styles.unread]}
          onPress={() => onPressItem(item)}
        >
          <Text style={typography.h3}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  unread: { borderColor: colors.primary },
  body: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
});
