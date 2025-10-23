import { supabase } from '@/lib/supabase'

export interface Message {
  id: string
  title: string
  content: string
  admin_id: string
  created_at: string
  updated_at: string
  is_read: boolean
  read_at?: string
}

/**
 * Fetch all messages for the current user with read status
 */
export const fetchMessages = async (): Promise<Message[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('⚠️ User not authenticated')
      return []
    }

    // Get all messages with read receipt info
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        title,
        content,
        admin_id,
        created_at,
        updated_at,
        message_read_receipts(read_at)
      `)
      .order('created_at', { ascending: false })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return []
    }

    if (!messages) {
      return []
    }

    // Transform the data to include read status
    const transformedMessages: Message[] = messages.map((msg: any) => {
      const readReceipt = msg.message_read_receipts?.[0]
      return {
        id: msg.id,
        title: msg.title,
        content: msg.content,
        admin_id: msg.admin_id,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_read: !!readReceipt,
        read_at: readReceipt?.read_at,
      }
    })

    return transformedMessages
  } catch (error) {
    console.error('❌ Error in fetchMessages:', error)
    return []
  }
}

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('⚠️ User not authenticated')
      return false
    }

    // Update the read_at timestamp
    const { error } = await supabase
      .from('message_read_receipts')
      .update({ read_at: new Date().toISOString() })
      .eq('message_id', messageId)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Error marking message as read:', error)
      return false
    }

    console.log('✅ Message marked as read')
    return true
  } catch (error) {
    console.error('❌ Error in markMessageAsRead:', error)
    return false
  }
}
