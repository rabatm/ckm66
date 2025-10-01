import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function CoursesScreen() {
  const [activeTab, setActiveTab] = useState<'schedule' | 'reservations'>('schedule')

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 px-4 py-4 shadow-sm">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Cours Krav Maga
        </Text>

        {/* Tab Navigation */}
        <View className="flex-row bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <TouchableOpacity
            onPress={() => {
              console.log('Switching to schedule')
              setActiveTab('schedule')
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              backgroundColor: activeTab === 'schedule' ? '#FFFFFF' : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                color: activeTab === 'schedule' ? '#111827' : '#6B7280',
              }}
            >
              Planning
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('Switching to reservations')
              setActiveTab('reservations')
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 6,
              backgroundColor: activeTab === 'reservations' ? '#FFFFFF' : 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: '500',
                color: activeTab === 'reservations' ? '#111827' : '#6B7280',
              }}
            >
              Mes réservations
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 px-4 py-4">
        {activeTab === 'schedule' ? (
          <ScheduleTab />
        ) : (
          <ReservationsTab />
        )}
      </ScrollView>
    </View>
  )
}

// Schedule Tab Component
function ScheduleTab() {
  return (
    <View>
      <Card variant="elevated" className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Lundi 18h00 - 19h30
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-2">
          Krav Maga - Niveau Débutant
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Instructeur: Jean Dupont • Gymnase Municipal
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-green-600 dark:text-green-400 font-medium">
            12 places disponibles
          </Text>
          <Button variant="primary" size="sm" onPress={() => Alert.alert('Réservation', 'Fonctionnalité en cours de développement')}>
            Réserver
          </Button>
        </View>
      </Card>

      <Card variant="elevated" className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Mercredi 19h00 - 20h30
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-2">
          Krav Maga - Niveau Intermédiaire
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Instructeur: Marie Martin • Dojo Central
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
            2 places restantes
          </Text>
          <Button variant="primary" size="sm" onPress={() => Alert.alert('Réservation', 'Fonctionnalité en cours de développement')}>
            Dernière place !
          </Button>
        </View>
      </Card>

      <Card variant="elevated" className="mb-4">
        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Vendredi 18h30 - 20h00
        </Text>
        <Text className="text-gray-600 dark:text-gray-400 mb-2">
          Krav Maga - Niveau Avancé
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-500 mb-3">
          Instructeur: Paul Durand • Gymnase Municipal
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-red-600 dark:text-red-400 font-medium">
            Complet
          </Text>
          <Button variant="outline" size="sm" onPress={() => Alert.alert('Liste d\'attente', 'Fonctionnalité en cours de développement')}>
            Liste d'attente
          </Button>
        </View>
      </Card>

      <View className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Text className="text-sm text-blue-800 dark:text-blue-200 text-center">
          💡 Les données de cours seront chargées depuis la base de données une fois les permissions configurées
        </Text>
      </View>
    </View>
  )
}

// Reservations Tab Component
function ReservationsTab() {
  return (
    <View>
      <Card variant="elevated" className="mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Lundi 18h00 - Débutant
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Jean Dupont • Gymnase Municipal
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-green-100">
            <Text className="text-xs font-medium text-green-600">Confirmé</Text>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Réservé le 28 sept. 2024
          </Text>
          <Button variant="outline" size="sm" onPress={() => Alert.alert('Annulation', 'Fonctionnalité en cours de développement')}>
            Annuler
          </Button>
        </View>
      </Card>

      <Card variant="elevated" className="mb-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Vendredi 18h30 - Avancé
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Paul Durand • Gymnase Municipal
            </Text>
          </View>
          <View className="px-3 py-1 rounded-full bg-yellow-100">
            <Text className="text-xs font-medium text-yellow-600">En attente</Text>
          </View>
        </View>
        <View className="mb-3">
          <Text className="text-sm text-yellow-600 dark:text-yellow-400">
            Position 3 sur la liste d'attente
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-500 dark:text-gray-400">
            Réservé le 30 sept. 2024
          </Text>
          <Button variant="outline" size="sm" onPress={() => Alert.alert('Annulation', 'Fonctionnalité en cours de développement')}>
            Quitter la liste
          </Button>
        </View>
      </Card>

      <View className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Text className="text-sm text-blue-800 dark:text-blue-200 text-center">
          💡 Vos réservations réelles seront affichées ici une fois connecté à la base de données
        </Text>
      </View>
    </View>
  )
}
