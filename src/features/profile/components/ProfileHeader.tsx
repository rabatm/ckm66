import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { colors, spacing, typography } from '@/theme'

interface ProfileHeaderProps {
  firstName?: string
  lastName?: string
  email?: string
  profilePictureUrl?: string | null
  joinDate?: string
  isUploadingPhoto?: boolean
  onChangePhoto: () => void
}

export function ProfileHeader({
  firstName,
  lastName,
  email,
  profilePictureUrl,
  joinDate,
  isUploadingPhoto,
  onChangePhoto,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onChangePhoto} disabled={isUploadingPhoto} activeOpacity={0.8}>
        <View style={styles.avatarContainer}>
          {profilePictureUrl ? (
            <Image
              source={{ uri: profilePictureUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {firstName?.charAt(0).toUpperCase() || '?'}
                {lastName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          )}
          {isUploadingPhoto && (
            <View style={styles.uploadingOverlay}>
              <ActivityIndicator color={colors.text.primary} />
            </View>
          )}
          <View style={styles.changePhotoButton}>
            <Ionicons name="camera" size={16} color={colors.text.primary} />
          </View>
        </View>
      </TouchableOpacity>
      <Text style={styles.userName}>
        {firstName} {lastName}
      </Text>
      <Text style={styles.userEmail}>{email}</Text>
      {joinDate && (
        <Text style={styles.joinDate}>
          Membre depuis {new Date(joinDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary[500],
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.primary[500],
  },
  avatarText: {
    fontSize: 36,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  uploadingOverlay: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[500],
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  userName: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
  joinDate: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
})
