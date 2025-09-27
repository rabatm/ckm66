import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/features/auth/hooks/useAuth';

type TabType = 'schedule' | 'profile' | 'news';

export const MainApp = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderScheduleTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Horaires des Cours</Text>

      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>Lundi 19:00 - 20:30</Text>
        <Text style={styles.courseLevel}>Niveau: Intermédiaire</Text>
        <Text style={styles.courseInstructor}>Instructeur: Martin Durand</Text>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>Mercredi 18:00 - 19:30</Text>
        <Text style={styles.courseLevel}>Niveau: Débutant</Text>
        <Text style={styles.courseInstructor}>Instructeur: Sarah Martin</Text>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.courseCard}>
        <Text style={styles.courseTitle}>Vendredi 19:30 - 21:00</Text>
        <Text style={styles.courseLevel}>Niveau: Avancé</Text>
        <Text style={styles.courseInstructor}>Instructeur: Marc Lefebvre</Text>
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderProfileTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Mon Profil</Text>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Nom complet</Text>
        <Text style={styles.profileValue}>{user?.first_name} {user?.last_name}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Email</Text>
        <Text style={styles.profileValue}>{user?.email}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Téléphone</Text>
        <Text style={styles.profileValue}>{user?.phone || 'Non renseigné'}</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Niveau</Text>
        <Text style={styles.profileValue}>Intermédiaire</Text>
      </View>

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Membre depuis</Text>
        <Text style={styles.profileValue}>Janvier 2024</Text>
      </View>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Modifier le profil</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderNewsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.tabTitle}>Actualités du Club</Text>

      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Stage de Krav Maga ce weekend</Text>
        <Text style={styles.newsDate}>15 décembre 2024</Text>
        <Text style={styles.newsContent}>
          Stage intensif animé par un instructeur expert. Ouvert à tous les niveaux.
          Inscriptions jusqu'à jeudi.
        </Text>
      </View>

      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Nouveau cours débutant</Text>
        <Text style={styles.newsDate}>10 décembre 2024</Text>
        <Text style={styles.newsContent}>
          Nous ouvrons un nouveau créneau pour débutants le mardi à 18h30.
          Première séance d'essai gratuite.
        </Text>
      </View>

      <View style={styles.newsCard}>
        <Text style={styles.newsTitle}>Fermeture pendant les fêtes</Text>
        <Text style={styles.newsDate}>5 décembre 2024</Text>
        <Text style={styles.newsContent}>
          Le club sera fermé du 24 décembre au 2 janvier.
          Reprise des cours le 3 janvier 2025.
        </Text>
      </View>
    </ScrollView>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedule':
        return renderScheduleTab();
      case 'profile':
        return renderProfileTab();
      case 'news':
        return renderNewsTab();
      default:
        return renderScheduleTab();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>CKM66</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcome}>
          Bonjour {user?.first_name}! 👋
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
          onPress={() => setActiveTab('schedule')}
        >
          <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
            Cours
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profil
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            Actualités
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50, // Safe area padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
  },
  logoutText: {
    color: '#6c757d',
    fontSize: 14,
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 18,
    color: '#495057',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#dc3545',
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#dc3545',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 20,
  },
  courseCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  courseLevel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 15,
  },
  reserveButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  reserveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  profileValue: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  newsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 10,
  },
  newsContent: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
});
