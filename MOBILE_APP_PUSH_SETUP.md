# Configuration des notifications push - App Mobile React Native

## 📋 Vue d'ensemble

Ce guide explique comment configurer votre app mobile React Native/Expo pour recevoir les notifications push envoyées depuis l'admin.

## 🎯 Objectifs

Après cette configuration, les membres pourront :
- ✅ Recevoir des notifications push sur leur téléphone
- ✅ Voir les messages de l'admin
- ✅ Les admins verront qui a reçu et lu les messages

---

## 📦 Phase 1 : Installation des packages

### Étape 1.1 : Installer les dépendances

```bash
cd /Users/martincelavie/DEV/martininfo/ckm092025/mobile

# Installer expo-notifications
npx expo install expo-notifications

# Installer expo-constants (pour détecter si c'est un device physique)
npx expo install expo-constants
```

**Vérification** :
- Ouvrir `package.json`
- Vérifier que ces packages sont listés dans `dependencies`

---

## 🔧 Phase 2 : Créer le service de notifications

### Étape 2.1 : Créer le fichier du service

Créez le fichier : `src/services/pushNotifications.ts`

```typescript
// src/services/pushNotifications.ts

import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase'; // Ajustez le chemin selon votre structure

// =========================================
// Configuration du handler de notifications
// =========================================
// Définit comment les notifications sont affichées
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,    // Afficher une alerte
    shouldPlaySound: true,     // Jouer un son
    shouldSetBadge: true,      // Afficher un badge (iOS)
  }),
});

// =========================================
// Fonction : Enregistrer pour les notifications
// =========================================
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    // 1. Vérifier qu'on est sur un device physique
    if (!Constants.isDevice) {
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
        const data = response.notification.request.content.data;
        console.log('👆 Notification tapée, data:', data);

        // Si c'est un message admin, enregistrer le read receipt
        if (data.type === 'admin_message' && data.messageId) {
          await recordMessageRead(data.messageId);
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
```

---

## 🚀 Phase 3 : Intégrer dans votre app

### Étape 3.1 : Ajouter dans App.tsx ou _layout.tsx

```typescript
// app/_layout.tsx (ou App.tsx selon votre structure)

import { useEffect } from 'react';
import { registerForPushNotifications, useNotificationListener, useNotificationResponseListener } from '@/services/pushNotifications';
import { supabase } from '@/services/supabase';

export default function RootLayout() {
  // Enregistrer pour les notifications au démarrage
  useEffect(() => {
    const setupPushNotifications = async () => {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        console.log('👤 Utilisateur connecté, enregistrement pour les notifications...');
        await registerForPushNotifications();
      } else {
        console.log('ℹ️ Utilisateur non connecté, notifications désactivées');
      }
    };

    setupPushNotifications();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ Connexion détectée, enregistrement pour les notifications');
          await registerForPushNotifications();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Écouter les notifications
  useNotificationListener((notification) => {
    // Optionnel : afficher un toast ou une alerte custom
    console.log('Nouvelle notification:', notification.request.content.title);
  });

  // Écouter les taps sur les notifications
  useNotificationResponseListener();

  return (
    // Votre layout existant
    <YourAppContent />
  );
}
```

---

## 🧪 Phase 4 : Tester sur un appareil physique

### Important : Les notifications ne fonctionnent PAS sur simulateur/émulateur

- ❌ iOS Simulator → Ne supporte pas les notifications push
- ❌ Android Emulator → Ne supporte pas les notifications push
- ✅ iPhone/iPad physique → Fonctionne
- ✅ Appareil Android physique → Fonctionne

### Étape 4.1 : Lancer l'app sur un device

```bash
# Option 1 : Via Expo Go
npx expo start
# Scanner le QR code avec l'app Expo Go

# Option 2 : Build development
npx expo run:ios
# ou
npx expo run:android
```

### Étape 4.2 : Vérifier l'enregistrement

1. Lancez l'app sur votre téléphone
2. Connectez-vous avec un compte membre
3. Ouvrez les logs :
   ```bash
   npx expo start
   # Appuyez sur 'j' pour ouvrir le debugger
   ```
4. Dans la console, vous devriez voir :
   ```
   ✅ Expo Push Token obtenu: ExponentPushToken[xxxxxxxxxx]
   ✅ Token sauvegardé dans la base de données
   ```

### Étape 4.3 : Vérifier dans Supabase

1. Allez sur **Supabase Dashboard** → **Table Editor** → **`profiles`**
2. Trouvez votre utilisateur (celui avec lequel vous êtes connecté)
3. Vérifiez la colonne **`expo_push_token`**
4. Elle doit contenir : `ExponentPushToken[...]`

✅ **Si vous voyez le token** → Configuration réussie !

---

## 🎯 Phase 5 : Test end-to-end

### Test complet du système

1. **Sur l'admin web** (http://localhost:3002/messaging) :
   - Connectez-vous en tant qu'admin
   - Envoyez un message test : "Notification test"

2. **Sur votre téléphone** (app mobile) :
   - Vous devriez recevoir une notification push
   - Son : 🔔
   - Titre : "New Message from CKM Admin"
   - Corps : "Notification test"

3. **Tapez sur la notification** :
   - L'app s'ouvre
   - Le read receipt est enregistré

4. **Retournez sur l'admin web** :
   - Cliquez sur "Details" du message envoyé
   - Vous devriez voir votre nom avec :
     - ✅ Badge "Received"
     - ✅ Badge "Read" avec l'heure

---

## 🐛 Dépannage

### "Must use physical device"
**Problème** : Les notifications push ne fonctionnent pas sur simulateur

**Solution** : Utilisez un iPhone/iPad ou appareil Android physique

---

### Token non sauvegardé dans la base
**Problème** : `expo_push_token` est NULL dans la table `profiles`

**Solutions** :
1. Vérifiez que l'utilisateur est bien connecté avant l'appel à `registerForPushNotifications()`
2. Vérifiez les logs de la console pour voir les erreurs
3. Vérifiez que les permissions ont été accordées

---

### Notification pas reçue
**Problème** : Message envoyé depuis l'admin mais pas de notification

**Solutions** :
1. Vérifiez que le token commence par `ExponentPushToken`
2. Vérifiez les paramètres de notifications du téléphone :
   - **iOS** : Réglages → Notifications → Votre App → Autoriser les notifications
   - **Android** : Paramètres → Notifications → Votre App
3. Vérifiez les logs de l'edge function (Supabase → Edge Functions → Logs)
4. Assurez-vous d'être sur un device physique

---

### Read receipt pas enregistré
**Problème** : Notification reçue mais le statut "Read" ne change pas

**Solutions** :
1. Vérifiez que `useNotificationResponseListener()` est bien appelé
2. Vérifiez que `data.messageId` est présent dans les data de la notification
3. Ouvrez la console de l'app pour voir les logs
4. Vérifiez que la table `message_read_receipts` existe

---

## 📱 Phase 6 (Optionnel) : Écran des messages

Vous pouvez créer un écran pour afficher l'historique des messages reçus :

```typescript
// screens/MessagesScreen.tsx

import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { supabase } from '@/services/supabase';

interface Message {
  id: string;
  created_at: string;
  content: string;
  sent_by: string;
}

export default function MessagesScreen() {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Erreur chargement messages:', error);
      return;
    }

    setMessages(data || []);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Messages
      </Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{
            padding: 16,
            backgroundColor: '#f5f5f5',
            borderRadius: 8,
            marginBottom: 8
          }}>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={{ fontSize: 16 }}>{item.content}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

## ✅ Checklist de configuration

- [ ] Packages installés (`expo-notifications`, `expo-constants`)
- [ ] Fichier `src/services/pushNotifications.ts` créé
- [ ] Service intégré dans `App.tsx` ou `_layout.tsx`
- [ ] Listeners de notifications ajoutés
- [ ] Testé sur un device physique
- [ ] Token visible dans Supabase (`profiles.expo_push_token`)
- [ ] Notification reçue depuis l'admin
- [ ] Read receipt enregistré après tap

---

## 📊 Résumé du flux complet

```
1. Admin envoie message depuis /messaging
   ↓
2. Edge function clever-responder s'exécute
   ↓
3. Récupère tous les expo_push_token de la table profiles
   ↓
4. Appelle l'API Expo Push pour chaque token
   ↓
5. Expo délivre la notification à chaque device
   ↓
6. User reçoit la notification (app en background ou fermée)
   ↓
7. User tape sur la notification
   ↓
8. App mobile enregistre le read receipt en DB
   ↓
9. Admin voit le statut "Read" avec l'heure
```

---

## 🎉 Félicitations !

Si vous avez suivi toutes les étapes, votre système de notifications push est maintenant **100% fonctionnel** !

Les admins peuvent maintenant envoyer des messages à tous les membres et suivre qui a reçu et lu les messages. 🚀

---

## 📚 Documentation complémentaire

- [Documentation Expo Notifications](https://docs.expo.dev/push-notifications/overview/)
- [Guide Expo Push Tokens](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Guide Admin CKM](/docs/MESSAGING_ADMIN_GUIDE.md)
