import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, typography } from '@/theme'
import { fetchMessages, markMessageAsRead, type Message } from '../services/messaging.service'
import { MessageCard } from '../components'

export const MessagesScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Load messages on mount
  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const data = await fetchMessages()
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
      Alert.alert('Erreur', 'Impossible de charger les messages')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true)
      const data = await fetchMessages()
      setMessages(data)
    } catch (error) {
      console.error('Error refreshing messages:', error)
      Alert.alert('Erreur', 'Impossible de rafraîchir les messages')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const success = await markMessageAsRead(messageId)
      if (success) {
        // Update local state
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  is_read: true,
                  read_at: new Date().toISOString(),
                }
              : msg
          )
        )
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const handleMessagePress = (message: Message) => {
    // Show full message in an alert
    Alert.alert(message.title, message.content, [
      { text: 'Fermer', onPress: () => {} },
    ])
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  // Empty state
  if (!isLoading && messages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>Aucun message</Text>
          <Text style={styles.emptySubtitle}>
            Les messages de l'admin s'afficheront ici
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header with unread count */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.headerSubtitle}>
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Messages List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={messages}
          renderItem={({ item }) => (
            <View style={styles.messageItem}>
              <MessageCard
                message={item}
                onPress={handleMessagePress}
                onMarkAsRead={handleMarkAsRead}
              />
            </View>
          )}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  unreadBadge: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: colors.text.primary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  messageItem: {
    marginBottom: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
})
