import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Scheme } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { SchemeCard } from '../components/SchemeCard';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import * as schemeService from '../services/schemeService';

type Props = NativeStackScreenProps<RootStackParamList, 'BrowseSchemes'>;

/**
 * "Browse all government schemes — no login required" (flowchart) and the
 * decision point "Check personal eligibility?" — the CTA below the list
 * routes to either Login (guest) or Results (already authenticated).
 */
export function BrowseSchemesScreen({ navigation }: Props): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const { schemes: result } = await schemeService.browseSchemes();
    setSchemes(result);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onCheckEligibility = () => {
    navigation.navigate(isAuthenticated ? 'Results' : 'Login');
  };

  if (loading) return <LoadingSpinner label="Loading schemes..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>Government Schemes</Text>
        <Text style={styles.subtitle}>Browse freely — no account needed</Text>
      </View>

      <FlatList
        data={schemes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <SchemeCard
            title={item.title}
            level={item.level}
            sourceAuthority={item.sourceAuthority}
            benefits={item.benefits}
            onPress={() => navigation.navigate('SchemeDetail', { schemeId: item._id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No schemes available right now.</Text>}
      />

      <View style={styles.footer}>
        <Button
          label={isAuthenticated ? 'View my matched schemes' : 'Check my personal eligibility'}
          onPress={onCheckEligibility}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
