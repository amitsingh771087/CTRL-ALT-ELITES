import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EligibleSchemeSummary, RootStackParamList } from '../types';
import { colors, spacing } from '../theme/colors';
import { typography } from '../theme/typography';
import { SchemeCard } from '../components/SchemeCard';
import { Button } from '../components/Button';
import { LoadingSpinner } from '../components/LoadingSpinner';
import * as schemeService from '../services/schemeService';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

/** "Personalized eligible schemes — Local · State · Central" from the flowchart. */
export function ResultsScreen({ navigation }: Props): JSX.Element {
  const [schemes, setSchemes] = useState<EligibleSchemeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await schemeService.getMyEligibleSchemes();
      setSchemes(result);
    } catch {
      setNeedsProfile(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner label="Matching you with schemes..." />;

  if (needsProfile) {
    return (
      <View style={styles.emptyState}>
        <Text style={typography.h2}>Complete your profile</Text>
        <Text style={styles.emptyText}>
          We need a few details to match you accurately with eligible schemes.
        </Text>
        <Button label="Fill eligibility profile" onPress={() => navigation.navigate('ProfileForm')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>You qualify for {schemes.length} scheme{schemes.length === 1 ? '' : 's'}</Text>
        <Text style={styles.subtitle}>Ranked by how closely they match your profile</Text>
      </View>

      <FlatList
        data={schemes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <SchemeCard
            title={item.title}
            level={item.level}
            sourceAuthority={item.sourceAuthority}
            benefits={item.benefits}
            matchScore={item.matchScore}
            onPress={() => navigation.navigate('SchemeDetail', { schemeId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches yet — try updating your profile as your details change.</Text>
        }
      />

      <View style={styles.footer}>
        <Button label="Update my profile" onPress={() => navigation.navigate('ProfileForm')} variant="secondary" />
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
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginVertical: spacing.md },
});
