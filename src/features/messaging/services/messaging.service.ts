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

    console.log('📬 Fetching messages for user:', user.id)

    // Get all messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (messagesError) {
      console.error('❌ Error fetching messages:', messagesError)
      return []
    }

    console.log('📦 Found messages:', messages?.length || 0)

    if (!messages || messages.length === 0) {
      console.log('ℹ️ No messages found')
      return []
    }

    // Get read receipts for this user
    const { data: readReceipts, error: receiptsError } = await supabase
      .from('message_read_receipts')
      .select('message_id, read_at')
      .eq('user_id', user.id)

    if (receiptsError) {
      console.error('❌ Error fetching read receipts:', receiptsError)
    }

    console.log('📋 Found read receipts:', readReceipts?.length || 0)

    // Create a map of message IDs to read status
    const readMap = new Map(readReceipts?.map(r => [r.message_id, r.read_at]) || [])

    // Transform the data to include read status
    const transformedMessages: Message[] = messages.map((msg: any) => {
      const read_at = readMap.get(msg.id)
      return {
        id: msg.id,
        title: msg.title,
        content: msg.content,
        admin_id: msg.admin_id,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_read: !!read_at,
        read_at: read_at,
      }
    })

    console.log('✅ Returning', transformedMessages.length, 'messages')
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
