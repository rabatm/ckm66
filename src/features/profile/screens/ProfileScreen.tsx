import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBadges } from '../hooks/useBadges'
import { useSubscription } from '../hooks/useSubscription'
import { uploadProfilePicture, getProfilePictureUrl } from '../services/profile.service'
import {
  ProfileHeader,
  LevelProgressCard,
  BadgeStatsCard,
  SubscriptionCard,
  EditProfileModal,
} from '../components'

interface ProfileScreenProps {
  onBack?: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, signOut, updateUser } = useAuth()
  const { userProgress, isLoading, error, refetch: refetchBadges } = useBadges()
  const {
    subscriptionInfo,
    isLoading: isLoadingSubscription,
    refetch: refetchSubscription,
  } = useSubscription()
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handleRefresh = () => {
    refetchBadges()
    refetchSubscription()
  }

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut()
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de se déconnecter')
          }
        },
      },
    ])
  }

  const handleChangePhoto = async () => {
    if (!user?.id) return

    Alert.alert(
      'Changer la photo',
      'Choisissez une source',
      [
        {
          text: 'Appareil photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Bibliothèque',
          onPress: () => pickImage('library'),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    )
  }

  const pickImage = async (source: 'camera' | 'library') => {
    if (!user?.id) return

    try {
      const permissionResult =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Permission refusée',
          `Nous avons besoin d'accéder à ${source === 'camera' ? 'votre appareil photo' : 'vos photos'}`
        )
        return
      }

      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: 'images',
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })

      if (!result.canceled && result.assets[0]) {
        setIsUploadingPhoto(true)
        const newPhotoUrl = await uploadProfilePicture(user.id, result.assets[0].uri)
        updateUser({ profile_picture_url: newPhotoUrl })
        handleRefresh()
        Alert.alert('Succès', 'Photo de profil mise à jour')
      }
    } catch (error) {
      console.error('Error changing photo:', error)
      Alert.alert('Erreur', 'Impossible de mettre à jour la photo')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <ProfileHeader
          firstName={user?.first_name}
          lastName={user?.last_name}
          email={user?.email}
          profilePictureUrl={getProfilePictureUrl(user?.profile_picture_url)}
          joinDate={user?.join_date}
          isUploadingPhoto={isUploadingPhoto}
          onChangePhoto={handleChangePhoto}
        />

        {/* Loading / Error / Content */}
        {isLoading ? (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="small" color={colors.primary[500]} />
          </View>
        ) : error ? (
          <View style={styles.errorSection}>
            <Text style={styles.errorText}>Impossible de charger les données</Text>
          </View>
        ) : userProgress ? (
          <>
            {/* Level Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progression</Text>
              <LevelProgressCard userProgress={userProgress} />
            </View>

            {/* Badge Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Badges</Text>
              <BadgeStatsCard
                unlockedBadges={userProgress.unlocked_badges}
                totalBadges={userProgress.total_badges}
                badgesPercentage={userProgress.badges_percentage}
              />
            </View>

            {/* Subscription */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Abonnement</Text>
              <SubscriptionCard
                subscriptionInfo={subscriptionInfo}
                isLoading={isLoadingSubscription}
              />
            </View>
          </>
        ) : null}

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowEditModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={18} color={colors.text.primary} />
            <Text style={styles.actionButtonText}>Modifier mes informations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={[styles.actionButtonText, styles.logoutButtonText]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSaveSuccess={handleRefresh}
        updateUser={updateUser}
      />
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
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary[500],
    marginBottom: spacing.md,
  },
  loadingSection: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorSection: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
  },
  actionButton: {
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.dark,
  },
  actionButtonText: {
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
})
