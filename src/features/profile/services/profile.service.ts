/**
 * Profile Service
 * Handles all profile-related operations with Supabase
 */

import { supabase } from '@/lib/supabase'
import * as ImageManipulator from 'expo-image-manipulator'
import type { ProfileUpdateData } from '../types/profile.types'

/**
 * Update user profile (creates if doesn't exist)
 */
export async function updateProfile(userId: string, data: ProfileUpdateData): Promise<void> {
  // First check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle()

  if (existingProfile) {
    // Profile exists, just update
    const { error } = await supabase.from('profiles').update(data).eq('id', userId)

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error('Impossible de mettre à jour le profil')
    }
  } else {
    // Profile doesn't exist, create with required fields
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { error } = await supabase.from('profiles').insert({
      id: userId,
      email: user.email || '',
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      phone: data.phone || null,
      profile_picture_url: data.profile_picture_url || null,
    })

    if (error) {
      console.error('Error creating profile:', error)
      throw new Error('Impossible de créer le profil')
    }
  }
}

/**
 * Compress and resize image before upload
 */
async function compressImage(uri: string): Promise<{ uri: string; base64?: string }> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500, height: 500 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    )
    return manipResult
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error("Impossible de compresser l'image")
  }
}

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(userId: string, imageUri: string): Promise<string> {
  try {
    // Compress image
    const compressed = await compressImage(imageUri)

    // For React Native, we need to use FormData to upload files
    const fileExtension = 'jpg'
    const fileName = `${userId}-${Date.now()}.${fileExtension}`
    const filePath = `${userId}/${fileName}`

    // Upload using the file path directly with fetch API
    // We'll use arraybuffer instead of blob for React Native
    // eslint-disable-next-line no-undef
    const response = await fetch(compressed.uri)
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, uint8Array, {
        contentType: 'image/jpeg',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      throw new Error("Impossible de télécharger l'image")
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('profile-pictures').getPublicUrl(filePath)

    const publicUrl = urlData.publicUrl

    // Update profile with new picture URL
    await updateProfile(userId, { profile_picture_url: publicUrl })

    return publicUrl
  } catch (error) {
    console.error('Error in uploadProfilePicture:', error)
    throw error instanceof Error ? error : new Error('Erreur lors du téléchargement de la photo')
  }
}

/**
 * Delete old profile picture from storage
 */
export async function deleteProfilePicture(userId: string, pictureUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const urlParts = pictureUrl.split('/profile-pictures/')
    if (urlParts.length < 2) return

    const filePath = urlParts[1]
    if (!filePath) return

    // Delete from storage
    const { error } = await supabase.storage.from('profile-pictures').remove([filePath])

    if (error) {
      console.error('Error deleting old picture:', error)
      // Don't throw, it's not critical if old picture deletion fails
    }
  } catch (error) {
    console.error('Error in deleteProfilePicture:', error)
    // Don't throw, it's not critical
  }
}

/**
 * Get profile picture URL with cache busting
 */
export function getProfilePictureUrl(pictureUrl: string | null | undefined): string | null {
  if (!pictureUrl) return null

  // Add timestamp to prevent caching issues
  const separator = pictureUrl.includes('?') ? '&' : '?'
  return `${pictureUrl}${separator}t=${Date.now()}`
}
