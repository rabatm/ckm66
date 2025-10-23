/Users/martincelavie/DEV/martininfo/ckm092025/web/ckm-admin/docs/MOBILE_APP_PUSH_SETUP.md# 📱 Guide de Réinitialisation de Mot de Passe - Application Mobile

## Vue d'ensemble

Ce document explique comment implémenter la réinitialisation de mot de passe dans l'application mobile en utilisant Supabase Auth.

## 🔐 Architecture du Système

Le système utilise **Supabase Auth** pour gérer de manière sécurisée la réinitialisation des mots de passe pour tous les types d'utilisateurs :
- ✅ Membres (members)
- ✅ Administrateurs (admin)
- ✅ Secrétaires (secretary)
- ✅ Instructeurs (instructor)

## 🔄 Flux Utilisateur Complet

### Étape 1 : Demande de Réinitialisation
```
Utilisateur mobile → Supabase Auth → Email envoyé
```

### Étape 2 : Réception du Lien
```
Email Supabase → Utilisateur clique sur lien → Deep link vers app mobile
```

### Étape 3 : Mise à Jour du Mot de Passe
```
App mobile → Nouveau mot de passe → Supabase Auth → Confirmation
```

---

## 📋 Implémentation Étape par Étape

### 1️⃣ Écran "Mot de passe oublié"

#### Interface Utilisateur
- Champ email
- Bouton "Envoyer le lien"
- Lien retour vers connexion

#### Code Example (React Native / Flutter)

**React Native:**
```javascript
import { supabase } from './supabaseClient'

async function handleForgotPassword(email) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'myapp://reset-password', // Deep link vers votre app
    })

    if (error) throw error

    // Afficher message de succès
    Alert.alert(
      'Email envoyé !',
      'Vérifiez votre boîte email pour le lien de réinitialisation.'
    )

  } catch (error) {
    Alert.alert('Erreur', error.message)
  }
}
```

**Flutter:**
```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> handleForgotPassword(String email) async {
  try {
    await Supabase.instance.client.auth.resetPasswordForEmail(
      email,
      redirectTo: 'myapp://reset-password', // Deep link vers votre app
    );

    // Afficher message de succès
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Email envoyé !'),
        content: Text('Vérifiez votre boîte email pour le lien de réinitialisation.'),
      ),
    );

  } catch (error) {
    // Gérer l'erreur
    print('Erreur: $error');
  }
}
```

---

### 2️⃣ Configuration du Deep Linking

Pour que l'email redirige vers votre application mobile, vous devez configurer le **deep linking**.

#### A. Configuration iOS (Info.plist)

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>myapp</string>
    </array>
  </dict>
</array>
```

#### B. Configuration Android (AndroidManifest.xml)

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="myapp" android:host="reset-password" />
</intent-filter>
```

#### C. Configuration Supabase Dashboard

1. Allez sur **Authentication → URL Configuration**
2. Ajoutez votre deep link dans **Redirect URLs**:
   ```
   myapp://reset-password
   ```

---

### 3️⃣ Écran de Réinitialisation du Mot de Passe

#### Interface Utilisateur
- Champ "Nouveau mot de passe" (avec œil pour afficher/masquer)
- Champ "Confirmer mot de passe"
- Règles de validation (minimum 8 caractères)
- Bouton "Modifier le mot de passe"

#### Code Example (React Native)

```javascript
import { supabase } from './supabaseClient'
import { useState, useEffect } from 'react'

function ResetPasswordScreen({ route }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Vérifier la session au chargement
  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (!session) {
      Alert.alert('Erreur', 'Lien invalide ou expiré')
      navigation.navigate('Login')
    }
  }

  async function handleResetPassword() {
    // Validation
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      Alert.alert(
        'Succès !',
        'Votre mot de passe a été modifié avec succès.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      )

    } catch (error) {
      Alert.alert('Erreur', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View>
      <TextInput
        secureTextEntry
        placeholder="Nouveau mot de passe"
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        secureTextEntry
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Button
        title="Modifier le mot de passe"
        onPress={handleResetPassword}
        disabled={loading}
      />
    </View>
  )
}
```

#### Code Example (Flutter)

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

class ResetPasswordScreen extends StatefulWidget {
  @override
  _ResetPasswordScreenState createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _checkSession();
  }

  Future<void> _checkSession() async {
    final session = Supabase.instance.client.auth.currentSession;

    if (session == null) {
      // Lien invalide ou expiré
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Erreur'),
          content: Text('Lien invalide ou expiré'),
        ),
      );
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  Future<void> _handleResetPassword() async {
    // Validation
    if (_passwordController.text.length < 8) {
      _showError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (_passwordController.text != _confirmPasswordController.text) {
      _showError('Les mots de passe ne correspondent pas');
      return;
    }

    setState(() => _loading = true);

    try {
      await Supabase.instance.client.auth.updateUser(
        UserAttributes(password: _passwordController.text),
      );

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Succès !'),
          content: Text('Votre mot de passe a été modifié avec succès.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pushReplacementNamed(context, '/login'),
              child: Text('OK'),
            ),
          ],
        ),
      );

    } catch (error) {
      _showError(error.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  void _showError(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Erreur'),
        content: Text(message),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Nouveau mot de passe')),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _passwordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Nouveau mot de passe',
              ),
            ),
            SizedBox(height: 16),
            TextField(
              controller: _confirmPasswordController,
              obscureText: true,
              decoration: InputDecoration(
                labelText: 'Confirmer le mot de passe',
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _handleResetPassword,
              child: _loading
                  ? CircularProgressIndicator()
                  : Text('Modifier le mot de passe'),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 🔒 Sécurité

### Points Importants

1. **Expiration du Lien**
   - Les liens de réinitialisation expirent après **1 heure**
   - Gérer ce cas dans votre application

2. **Validation du Mot de Passe**
   - Minimum 8 caractères (obligatoire)
   - Recommandé : au moins une majuscule, un chiffre, un caractère spécial

3. **Session Temporaire**
   - Supabase crée une session temporaire lors du clic sur le lien
   - Cette session est utilisée pour valider la mise à jour du mot de passe
   - Après la mise à jour, l'utilisateur doit se reconnecter

---

## 📧 Format de l'Email

L'email envoyé par Supabase contient :

```
Sujet: Réinitialisation de mot de passe

Bonjour,

Vous avez demandé une réinitialisation de mot de passe.

Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :

[Réinitialiser mon mot de passe]

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
```

Le lien redirige vers : `myapp://reset-password?token=XXX&type=recovery`

---

## 🧪 Tests

### Scénarios à Tester

1. ✅ Demande avec email valide
2. ✅ Demande avec email invalide
3. ✅ Clic sur le lien dans l'email
4. ✅ Mise à jour du mot de passe avec succès
5. ✅ Tentative avec mot de passe trop court
6. ✅ Mots de passe qui ne correspondent pas
7. ✅ Lien expiré (après 1 heure)
8. ✅ Lien déjà utilisé

### Test en Développement

Pour tester sans envoyer d'emails réels :

1. Dans Supabase Dashboard → Authentication → Email Templates
2. Copiez l'URL de confirmation depuis les logs
3. Utilisez cette URL pour tester le flux

---

## ❓ FAQ

### Q : Comment personnaliser l'email ?
**R :** Dans Supabase Dashboard → Authentication → Email Templates → Reset Password

### Q : L'email n'arrive pas ?
**R :** Vérifiez :
- L'email existe dans la base de données
- Le SMTP est correctement configuré dans Supabase
- Les emails ne sont pas dans les spams

### Q : Comment tester en local ?
**R :** Utilisez un service comme Ngrok pour exposer votre app mobile et configurer le redirect URL

### Q : Le deep link ne fonctionne pas ?
**R :** Vérifiez :
- La configuration iOS/Android est correcte
- Le redirect URL est ajouté dans Supabase Dashboard
- Le scheme correspond bien (myapp://)

---

## 🔗 Ressources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Native Deep Linking](https://reactnavigation.org/docs/deep-linking/)
- [Flutter Deep Linking](https://docs.flutter.dev/ui/navigation/deep-linking)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

## 📞 Support

Pour toute question technique :
- 📧 Contactez l'équipe de développement
- 📚 Consultez la documentation Supabase
- 🐛 Créez un issue sur GitHub

---

**Dernière mise à jour :** 2025-01-16
**Version :** 1.0
