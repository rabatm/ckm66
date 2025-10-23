import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// =========================================
// Configuration du handler de notifications
// =========================================
// Définit comment les notifications sont affichées
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,       // Jouer un son
    shouldSetBadge: true,        // Afficher un badge (iOS)
    shouldShowBanner: true,      // Afficher une bannière
    shouldShowList: true,        // Ajouter à la liste de notifications
  }),
});

// =========================================
// Fonction : Enregistrer pour les notifications
// =========================================
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // 1. Vérifier qu'on est sur un device physique
    // NOTE: Constants.isDevice peut être undefined sur Expo Go, donc on autorise aussi undefined
    if (Constants.isDevice === false) {
      console.log('⚠️ Les notifications push ne fonctionnent que sur un appareil physique');
      return null;
    }

    // 2. Demander les permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Si pas encore autorisé, demander la permission
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Si refusé, arrêter ici
    if (finalStatus !== 'granted') {
      console.log('❌ Permission refusée pour les notifications');
      return null;
    }

    // 3. Récupérer le token Expo Push Token
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    const token = tokenData.data;

    console.log('✅ Expo Push Token obtenu:', token);

    // 4. Sauvegarder le token dans la base de données
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('⚠️ Utilisateur non connecté');
      return null;
    }

    // Mettre à jour le profil avec le token
    const { error } = await supabase
      .from('profiles')
      .update({ expo_push_token: token })
      .eq('id', user.id);

    if (error) {
      console.error('❌ Erreur lors de la sauvegarde du token:', error);
      return null;
    }

    console.log('✅ Token sauvegardé dans la base de données');
    return token;

  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement des notifications:', error);
    return null;
  }
}

// =========================================
// Hook : Écouter les notifications reçues
// =========================================
// Appelé quand une notification arrive (app ouverte)
export function useNotificationListener(
  callback?: (notification: Notifications.Notification) => void
) {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification reçue:', notification);
        if (callback) {
          callback(notification);
        }
      }
    );

    return () => subscription.remove();
  }, [callback]);
}

// =========================================
// Hook : Écouter les taps sur les notifications
// =========================================
// Appelé quand l'utilisateur tape sur une notification
export function useNotificationResponseListener() {
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        const data = response.notification.request.content.data as Record<string, any>;
        console.log('👆 Notification tapée, data:', data);

        // Si c'est un message admin, enregistrer le read receipt
        if (data.type === 'admin_message' && data.messageId) {
          await recordMessageRead(data.messageId as string);
        }

        // TODO: Navigation vers l'écran des messages
        // navigation.navigate('Messages', { messageId: data.messageId });
      }
    );

    return () => subscription.remove();
  }, []);
}

// =========================================
// Fonction interne : Enregistrer qu'un message a été lu
// =========================================
async function recordMessageRead(messageId: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('⚠️ Utilisateur non connecté');
      return;
    }

    // Vérifier si déjà enregistré
    const { data: existing } = await supabase
      .from('message_read_receipts')
      .select('message_id')
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      console.log('ℹ️ Read receipt déjà enregistré');
      return;
    }

    // Insérer le read receipt
    const { error } = await supabase
      .from('message_read_receipts')
      .insert({
        message_id: messageId,
        user_id: user.id,
      });

    if (error) {
      console.error('❌ Erreur lors de l\'enregistrement du read receipt:', error);
      return;
    }

    console.log('✅ Read receipt enregistré');
  } catch (error) {
    console.error('❌ Erreur recordMessageRead:', error);
  }
}

// Exporter pour utilisation externe si besoin
export { recordMessageRead };
