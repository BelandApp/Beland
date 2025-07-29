import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from "react-native";
import { colors } from "../../styles/colors";
import { EnhancedCard } from "./EnhancedCard";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string;
  icon?: string;
  onRemove?: () => void;
  onEdit?: () => void;
}

interface EnhancedListProps {
  data: ListItem[];
  title: string;
  emptyText: string;
  emptyIcon?: string;
  onAddItem?: () => void;
  addButtonText?: string;
  isReadOnly?: boolean;
}

export const EnhancedList: React.FC<EnhancedListProps> = ({
  data,
  title,
  emptyText,
  emptyIcon = "📝",
  onAddItem,
  addButtonText = "Agregar",
  isReadOnly = false,
}) => {
  const renderItem: ListRenderItem<ListItem> = ({ item, index }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        {item.icon && <Text style={styles.itemIcon}>{item.icon}</Text>}
        <View style={styles.itemText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        {item.value && (
          <View style={styles.valueContainer}>
            <Text style={styles.itemValue}>{item.value}</Text>
          </View>
        )}
      </View>

      {!isReadOnly && (item.onEdit || item.onRemove) && (
        <View style={styles.itemActions}>
          {item.onEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={item.onEdit}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          {item.onRemove && (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={item.onRemove}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{emptyIcon}</Text>
      <Text style={styles.emptyText}>{emptyText}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerCount}>({data.length})</Text>
    </View>
  );

  return (
    <EnhancedCard style={styles.card}>
      {renderHeader()}

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />

      {!isReadOnly && onAddItem && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddItem}
          activeOpacity={0.8}
        >
          <Text style={styles.addIcon}>+</Text>
          <Text style={styles.addButtonText}>{addButtonText}</Text>
        </TouchableOpacity>
      )}
    </EnhancedCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  headerCount: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textSecondary,
    marginLeft: 8,
  },
  list: {
    maxHeight: 300,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  valueContainer: {
    backgroundColor: colors.belandOrange + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.belandOrange,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  removeButton: {
    backgroundColor: "#FEE2E2",
  },
  actionIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  addIcon: {
    fontSize: 18,
    color: "white",
    marginRight: 8,
    fontWeight: "600",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
