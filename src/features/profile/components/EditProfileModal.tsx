import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import { colors, spacing, typography } from '@/theme'
import { updateProfile } from '../services/profile.service'

interface EditProfileModalProps {
  visible: boolean
  onClose: () => void
  user: any
  onSaveSuccess?: () => void
  updateUser: (updates: any) => void
}

export function EditProfileModal({
  visible,
  onClose,
  user,
  onSaveSuccess,
  updateUser,
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '')
      setLastName(user.last_name || '')
      setPhone(user.phone || '')
    }
  }, [user])

  const handleSave = async () => {
    if (!user?.id) return

    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires')
      return
    }

    try {
      setIsSaving(true)
      const updates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
      }

      await updateProfile(user.id, updates)
      updateUser(updates)
      Alert.alert('Succès', 'Profil mis à jour avec succès')
      onSaveSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Modifier mon profil</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
              style={styles.input}
              placeholderTextColor={colors.text.disabled}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom"
              style={styles.input}
              placeholderTextColor={colors.text.disabled}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="06 12 34 56 78"
              keyboardType="phone-pad"
              style={styles.input}
              placeholderTextColor={colors.text.disabled}
            />
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.buttonSecondary} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.buttonSecondaryText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buttonPrimary, isSaving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.text.primary} />
              ) : (
                <Text style={styles.buttonPrimaryText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.xl,
    minHeight: 400,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: colors.text.secondary,
    lineHeight: 32,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  buttonSecondaryText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
})
