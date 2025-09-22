// src/components/ui/OptimizedList.tsx
import React, { memo, useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { OptimizedImage } from './OptimizedImage';
import type { ListItem } from '@/types';

interface OptimizedListProps {
  data: ListItem[];
  onItemPress?: (item: ListItem) => void;
}

// Composant item mémorisé pour éviter les re-renders
const ListItemComponent = memo(({
  item,
  onPress
}: {
  item: ListItem;
  onPress: ((item: ListItem) => void) | undefined;
}) => (
  <Pressable
    onPress={() => onPress?.(item)}
    className="flex-row p-4 bg-white dark:bg-gray-800 mb-2 mx-4 rounded-xl active:opacity-95"
  >
    {item.imageUrl && (
      <OptimizedImage
        uri={item.imageUrl}
        width={60}
        height={60}
        priority="low"
      />
    )}
    <View className="flex-1">
      <Text className="font-semibold text-gray-900 dark:text-white">
        {item.title}
      </Text>
      {item.description && (
        <Text className="text-gray-600 dark:text-gray-300 text-sm mt-1">
          {item.description}
        </Text>
      )}
    </View>
  </Pressable>
));

export function OptimizedList({ data, onItemPress }: OptimizedListProps) {
  const renderItem = useCallback(({ item }: { item: ListItem }) => (
    <ListItemComponent item={item} onPress={onItemPress} />
  ), [onItemPress]);

  const getItemType = useCallback((item: ListItem) => {
    return item.imageUrl ? 'with-image' : 'text-only';
  }, []);

  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      getItemType={getItemType}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
    />
  );
}