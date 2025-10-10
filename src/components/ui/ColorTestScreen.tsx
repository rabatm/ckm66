/**
 * Script de test pour vérifier les nouvelles couleurs
 * Test l'affichage des couleurs rouge sombre
 */

import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { colors } from '@/theme'

export function ColorTestScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🎨 Test des Couleurs Rouge Sombre</Text>

      {/* Primary Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Couleurs Primaires</Text>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.primary[500] }]} />
          <Text style={styles.colorText}>Primary 500: {colors.primary[500]}</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.primary[600] }]} />
          <Text style={styles.colorText}>Primary 600: {colors.primary[600]}</Text>
        </View>
      </View>

      {/* Border Colors */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bordures</Text>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.border.light }]} />
          <Text style={styles.colorText}>Border Light: {colors.border.light}</Text>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.colorBox, { backgroundColor: colors.border.dark }]} />
          <Text style={styles.colorText}>Border Dark: {colors.border.dark}</Text>
        </View>
      </View>

      {/* Gradient Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Dégradé</Text>
        <View style={[styles.gradientBox, { backgroundColor: colors.primary[500] }]}>
          <Text style={styles.gradientText}>Dégradé 500 → 600</Text>
        </View>
      </View>

      {/* Button Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Boutons</Text>
        <View style={[styles.button, { backgroundColor: colors.primary[500] }]}>
          <Text style={styles.buttonText}>Bouton Primary</Text>
        </View>
        <View style={[styles.buttonOutline, { borderColor: colors.primary[500] }]}>
          <Text style={[styles.buttonText, { color: colors.primary[500] }]}>Bouton Secondary</Text>
        </View>
      </View>

      {/* Input Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Inputs</Text>
        <View style={[styles.input, { borderColor: colors.border.light }]}>
          <Text style={styles.inputText}>Input Normal (Border Light)</Text>
        </View>
        <View style={[styles.input, { borderColor: colors.primary[500], borderWidth: 2 }]}>
          <Text style={styles.inputText}>Input Focus (Primary 500)</Text>
        </View>
      </View>

      {/* Card Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Card</Text>
        <View style={[styles.card, { borderColor: colors.border.dark }]}>
          <Text style={styles.cardText}>Card avec bordure rouge sombre</Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    marginTop: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 15,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  colorText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  gradientBox: {
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonOutline: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  input: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: colors.background.tertiary,
    marginBottom: 10,
  },
  inputText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
  },
  cardText: {
    fontSize: 14,
    color: colors.text.primary,
  },
})
