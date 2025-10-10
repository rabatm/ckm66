import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { DarkButton, DarkInput, DarkCard, DarkHeader } from './index'
import { colors, spacing, typography } from '@/theme'

/**
 * Test Screen for Dark Mode Components
 * This screen demonstrates all the new dark theme components
 */
export const TestDarkScreen = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <View style={styles.container}>
      <DarkHeader title="KRAV MAGA" subtitle="Bonjour Martin 👋" />

      <ScrollView style={styles.scrollView}>
        {/* Login Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Connexion</Text>
          <DarkCard>
            <DarkInput
              label="Email"
              placeholder="martin@example.com"
              value={email}
              onChangeText={setEmail}
              icon={<Text style={styles.inputIcon}>👤</Text>}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <DarkInput
              label="Mot de passe"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Text style={styles.inputIcon}>🔒</Text>}
            />

            <DarkButton variant="primary" onPress={handleLogin} loading={loading}>
              Se connecter →
            </DarkButton>

            <View style={styles.divider} />

            <DarkButton variant="ghost" onPress={() => {}}>
              Mot de passe oublié ?
            </DarkButton>
          </DarkCard>
        </View>

        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Boutons</Text>
          <DarkCard>
            <DarkButton variant="primary" onPress={() => {}}>
              Bouton Primary
            </DarkButton>

            <View style={{ height: spacing.md }} />

            <DarkButton variant="secondary" onPress={() => {}}>
              Bouton Secondary
            </DarkButton>

            <View style={{ height: spacing.md }} />

            <DarkButton variant="ghost" onPress={() => {}}>
              Bouton Ghost
            </DarkButton>

            <View style={{ height: spacing.md }} />

            <DarkButton variant="primary" disabled>
              Bouton Disabled
            </DarkButton>
          </DarkCard>
        </View>

        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Cards</Text>

          <DarkCard>
            <Text style={styles.cardTitle}>Card Standard</Text>
            <Text style={styles.cardText}>Ceci est une card dark avec padding par défaut</Text>
          </DarkCard>

          <View style={{ height: spacing.md }} />

          <DarkCard noPadding>
            <View style={{ padding: spacing.xl }}>
              <Text style={styles.cardTitle}>Card Sans Padding</Text>
              <Text style={styles.cardText}>
                Cette card utilise noPadding={'{'}true{'}'}
              </Text>
            </View>
          </DarkCard>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Stats</Text>
          <View style={styles.statsGrid}>
            <DarkCard style={styles.statCard}>
              <Text style={styles.statValue}>45</Text>
              <Text style={styles.statLabel}>Cours</Text>
            </DarkCard>

            <DarkCard style={styles.statCard}>
              <Text style={styles.statValue}>82%</Text>
              <Text style={styles.statLabel}>Présence</Text>
            </DarkCard>

            <DarkCard style={styles.statCard}>
              <Text style={styles.statValue}>8</Text>
              <Text style={styles.statLabel}>Série</Text>
            </DarkCard>
          </View>
        </View>

        {/* Colors Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Palette</Text>
          <DarkCard>
            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: colors.primary[500] }]} />
              <Text style={styles.colorLabel}>Primary Red</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: colors.secondary[500] }]} />
              <Text style={styles.colorLabel}>Secondary Orange</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: colors.success }]} />
              <Text style={styles.colorLabel}>Success Green</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: colors.background.primary }]} />
              <Text style={styles.colorLabel}>Background Primary</Text>
            </View>

            <View style={styles.colorRow}>
              <View style={[styles.colorBox, { backgroundColor: colors.background.secondary }]} />
              <Text style={styles.colorLabel}>Background Secondary</Text>
            </View>
          </DarkCard>
        </View>

        <View style={{ height: spacing['4xl'] }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputIcon: {
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  statValue: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  colorLabel: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
})
