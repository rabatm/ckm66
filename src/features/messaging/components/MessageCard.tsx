import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import type { Message } from '../services/messaging.service'

interface MessageCardProps {
  message: Message
  onPress?: (message: Message) => void
  onMarkAsRead?: (messageId: string) => Promise<void>
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onPress,
  onMarkAsRead,
}) => {
  const handlePress = async () => {
    // Mark as read if not already read
    if (!message.is_read && onMarkAsRead) {
      try {
        await onMarkAsRead(message.id)
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }

    // Call parent handler
    onPress?.(message)
  }

  const createdDate = new Date(message.created_at)
  const readDate = message.read_at ? new Date(message.read_at) : null

  return (
    <TouchableOpacity
      style={[styles.card, !message.is_read && styles.cardUnread]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title} numberOfLines={2}>
            {message.title}
          </Text>
          {!message.is_read && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.dateSection}>
          <Text style={styles.date}>
            {createdDate.toLocaleDateString('fr-FR')}
          </Text>
        </View>
      </View>

      <Text style={styles.content} numberOfLines={2}>
        {message.content}
      </Text>

      <View style={styles.footer}>
        <View style={styles.statusBadge}>
          <Ionicons
            name={message.is_read ? 'checkmark-done' : 'checkmark'}
            size={14}
            color={message.is_read ? colors.primary[500] : colors.text.tertiary}
            style={styles.statusIcon}
          />
          <Text style={[styles.statusText, message.is_read && styles.statusTextRead]}>
            {message.is_read
              ? readDate
                ? `Lu le ${readDate.toLocaleDateString('fr-FR')} à ${readDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                : 'Lu'
              : 'Non lu'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  cardUnread: {
    backgroundColor: colors.background.secondary,
    borderColor: colors.primary[500],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginLeft: spacing.sm,
    flexShrink: 0,
  },
  dateSection: {
    flexShrink: 0,
  },
  date: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  content: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  statusTextRead: {
    color: colors.primary[500],
    fontWeight: typography.weights.semibold,
  },
})
