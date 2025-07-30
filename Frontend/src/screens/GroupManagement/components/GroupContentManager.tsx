import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
  Image,
} from "react-native";
import { Group, Participant, Product } from "../../../types";
import { useGroupManagement } from "../hooks/useGroupManagement";
import { generateId } from "../../../utils/validation";
import { colors } from "../../../styles/colors";
import { formStyles } from "../../../styles/formStyles";
import {
  EnhancedCard,
  EnhancedButton,
  EnhancedInput,
  ConfirmationAlert,
  AddParticipantModal,
} from "../../../components/ui";
import { useCustomAlert } from "../../../hooks/useCustomAlert";
import { formatUSDPrice, CURRENCY_CONFIG } from "../../../constants";
import { InstagramUser } from "../../../services/instagramService";

interface GroupContentManagerProps {
  group: Group;
  onGroupUpdated: (updatedGroup: Group) => void;
  isReadOnly?: boolean;
}

export const GroupContentManager: React.FC<GroupContentManagerProps> = ({
  group,
  onGroupUpdated,
  isReadOnly = false,
}) => {
  const {
    addParticipant,
    removeParticipant,
    addProduct,
    removeProduct,
    updateProductQuantity,
    loading,
    error,
  } = useGroupManagement();

  const { showCustomAlert } = useCustomAlert();

  // Estados para agregar nuevos elementos
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [participantErrors, setParticipantErrors] = useState<{
    name?: string;
    instagram?: string;
  }>({});

  // Estados para alertas de confirmación
  const [confirmDelete, setConfirmDelete] = useState<{
    show: boolean;
    type: "participant" | "product";
    id: string;
    name: string;
  }>({
    show: false,
    type: "participant",
    id: "",
    name: "",
  });

  // Funciones para participantes
  const handleAddParticipant = async (
    name: string,
    instagramUser: InstagramUser
  ) => {
    // Limpiar errores previos
    setParticipantErrors({});

    if (!name.trim()) {
      setParticipantErrors({ name: "El nombre es requerido" });
      return;
    }

    if (!instagramUser) {
      setParticipantErrors({
        instagram: "Debes seleccionar un usuario de Instagram",
      });
      return;
    }

    const newParticipant: Participant = {
      id: generateId(),
      name: name.trim(),
      instagramUsername: instagramUser.username,
      instagramProfilePic: instagramUser.profile_pic_url,
      instagramFullName: instagramUser.full_name,
      isVerified: instagramUser.is_verified,
    };

    const updatedGroup = await addParticipant(group.id, newParticipant);
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
      setShowAddParticipantModal(false);
      setParticipantErrors({});
      showCustomAlert(
        "¡Participante agregado!",
        `${newParticipant.name} (@${instagramUser.username}) se unió al grupo`,
        "success"
      );
    }
  };

  const handleRemoveParticipant = async (
    participantId: string,
    participantName: string
  ) => {
    // No permitir eliminar al creador
    if (participantId === "creator") {
      showCustomAlert(
        "Acción no permitida",
        "No puedes eliminar al creador del grupo",
        "error"
      );
      return;
    }

    setConfirmDelete({
      show: true,
      type: "participant",
      id: participantId,
      name: participantName,
    });
  };

  const handleConfirmDelete = async (confirmed: boolean) => {
    if (!confirmed) {
      setConfirmDelete((prev) => ({ ...prev, show: false }));
      return;
    }

    const { type, id } = confirmDelete;
    let updatedGroup;

    if (type === "participant") {
      updatedGroup = await removeParticipant(group.id, id);
    } else {
      updatedGroup = await removeProduct(group.id, id);
    }

    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
      showCustomAlert(
        "¡Eliminado!",
        `${
          type === "participant" ? "Participante" : "Producto"
        } eliminado correctamente`,
        "success"
      );
    }

    setConfirmDelete((prev) => ({ ...prev, show: false }));
  };

  // Funciones para productos
  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      showCustomAlert(
        "Campos requeridos",
        "Por favor ingresa el nombre del producto",
        "error"
      );
      return;
    }

    if (!newProductPrice.trim()) {
      showCustomAlert(
        "Campos requeridos",
        "Por favor ingresa el precio del producto",
        "error"
      );
      return;
    }

    const price = parseFloat(newProductPrice);
    if (isNaN(price) || price <= 0) {
      showCustomAlert(
        "Precio inválido",
        "El precio debe ser un número válido mayor a 0",
        "error"
      );
      return;
    }

    const newProduct: Product = {
      id: generateId(),
      name: newProductName.trim(),
      estimatedPrice: price,
      quantity: 1,
      totalPrice: price,
    };

    const updatedGroup = await addProduct(group.id, newProduct);
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
      setNewProductName("");
      setNewProductPrice("");
      setShowAddProduct(false);
      showCustomAlert(
        "¡Producto agregado!",
        `${newProduct.name} agregado al pedido`,
        "success"
      );
    }
  };

  const handleRemoveProduct = async (
    productId: string,
    productName: string
  ) => {
    setConfirmDelete({
      show: true,
      type: "product",
      id: productId,
      name: productName,
    });
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      Alert.alert("Error", "La cantidad debe ser al menos 1");
      return;
    }

    const updatedGroup = await updateProductQuantity(
      group.id,
      productId,
      newQuantity
    );
    if (updatedGroup) {
      onGroupUpdated(updatedGroup);
    }
  };

  const renderParticipantItem = ({ item }: { item: Participant }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantAvatar}>
        {item.instagramProfilePic ? (
          <Image
            source={{ uri: item.instagramProfilePic }}
            style={styles.instagramProfilePic}
          />
        ) : (
          <Text style={styles.participantAvatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.participantInfo}>
        <View style={styles.participantNameRow}>
          <Text style={styles.participantName}>{item.name}</Text>
          {item.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
        </View>
        <Text style={styles.participantEmail}>
          {item.instagramUsername
            ? `@${item.instagramUsername}`
            : "Sin Instagram"}
        </Text>
        {item.id === "creator" && (
          <View style={styles.creatorBadge}>
            <Text style={styles.creatorBadgeText}>👑 Creador</Text>
          </View>
        )}
      </View>

      {item.id !== "creator" && !isReadOnly && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveParticipant(item.id, item.name)}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Función para obtener el emoji correcto según el producto
  const getProductEmoji = (productName: string): string => {
    const name = productName.toLowerCase();

    if (name.includes("empanada")) return "🥟";
    if (name.includes("pizza")) return "🍕";
    if (name.includes("gaseosa")) return "🥤";
    if (name.includes("cerveza")) return "🍺";
    if (name.includes("picada")) return "🧀";
    if (name.includes("vino")) return "🍷";
    if (name.includes("postre")) return "🍰";
    if (name.includes("agua")) return "💧";
    if (name.includes("hamburguesa")) return "🍔";
    if (name.includes("sandwich") || name.includes("sándwich")) return "🥪";
    if (name.includes("ensalada")) return "🥗";
    if (name.includes("pollo")) return "🍗";
    if (name.includes("carne")) return "🥩";
    if (name.includes("pasta")) return "🍝";
    if (name.includes("café")) return "☕";
    if (name.includes("helado")) return "🍦";

    // Por defecto según categoría
    if (name.includes("bebida") || name.includes("jugo")) return "🥤";
    if (name.includes("dulce") || name.includes("chocolate")) return "🍫";

    return "🍽️"; // Icono genérico de comida
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.modernProductCard}>
      {/* Header de la tarjeta con imagen y nombre */}
      <View style={styles.productHeader}>
        <View style={styles.productIconContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.productEmoji}>
              {getProductEmoji(item.name)}
            </Text>
          )}
        </View>
        <View style={styles.productHeaderInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPricePerUnit}>
            ${formatUSDPrice(item.estimatedPrice)} por unidad
          </Text>
        </View>
        {!isReadOnly && (
          <TouchableOpacity
            style={styles.removeProductButton}
            onPress={() => handleRemoveProduct(item.id, item.name)}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.removeProductButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Divisor sutil */}
      <View style={styles.productDivider} />

      {/* Footer con controles de cantidad */}
      <View style={styles.productFooter}>
        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Cantidad:</Text>
          <View style={styles.quantityControls}>
            {!isReadOnly && (
              <TouchableOpacity
                style={[
                  styles.quantityButton,
                  styles.quantityButtonMinus,
                  item.quantity <= 1 && styles.quantityButtonDisabled,
                ]}
                onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.quantityButtonText,
                    { color: "#EF4444" },
                    item.quantity <= 1 && styles.quantityButtonTextDisabled,
                  ]}
                >
                  −
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Text style={styles.quantityUnit}>und</Text>
            </View>

            {!isReadOnly && (
              <TouchableOpacity
                style={[styles.quantityButton, styles.quantityButtonPlus]}
                onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Sección separada para el precio total */}
      <View style={styles.productPriceFooter}>
        <View style={styles.priceSection}>
          <Text style={styles.priceSectionLabel}>TOTAL</Text>
          <View style={styles.totalPriceDisplay}>
            <Text style={styles.currencySymbol}>
              {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
            </Text>
            <Text style={styles.totalPrice}>
              {formatUSDPrice(item.estimatedPrice * item.quantity)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={formStyles.container}>
      {/* Sección de Participantes */}
      <EnhancedCard
        title="Participantes"
        subtitle={`${group.participantsList.length} miembros en el grupo`}
        icon="👥"
        style={{ marginBottom: 16 }}
      >
        <FlatList
          data={group.participantsList}
          renderItem={renderParticipantItem}
          keyExtractor={(item) => `${group.id}-participant-${item.id}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {!isReadOnly && (
          <EnhancedButton
            title="Agregar Participante"
            onPress={() => setShowAddParticipantModal(true)}
            variant="primary"
            icon="+"
            style={{ marginTop: 16 }}
          />
        )}

        {/* Modal para agregar participante */}
        <AddParticipantModal
          visible={showAddParticipantModal}
          onClose={() => {
            setShowAddParticipantModal(false);
            setParticipantErrors({});
          }}
          onAddParticipant={handleAddParticipant}
          errors={participantErrors}
        />
      </EnhancedCard>

      {/* Sección de Productos */}
      <EnhancedCard
        title="Productos del Pedido"
        subtitle={`${group.products.length} productos • Total: ${
          CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL
        }${formatUSDPrice(group.totalAmount)}`}
        icon="🛒"
        style={{ marginBottom: 16 }}
      >
        <FlatList
          data={group.products}
          renderItem={renderProductItem}
          keyExtractor={(item) => `${group.id}-product-${item.id}`}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />

        {!isReadOnly && (
          <EnhancedButton
            title="Agregar Producto"
            onPress={() => setShowAddProduct(!showAddProduct)}
            variant={showAddProduct ? "secondary" : "primary"}
            icon={showAddProduct ? "✕" : "+"}
            style={{ marginTop: 16 }}
          />
        )}

        {showAddProduct && !isReadOnly && (
          <View style={styles.addForm}>
            <EnhancedInput
              label="Nombre del producto"
              placeholder="Ej: Pizza Margarita"
              value={newProductName}
              onChangeText={setNewProductName}
              icon="🍕"
              required
            />
            <EnhancedInput
              label="Precio estimado (USD)"
              placeholder="0.00"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
              keyboardType="numeric"
              icon="💰"
              required
            />
            <View style={styles.addFormButtons}>
              <EnhancedButton
                title="Cancelar"
                onPress={() => {
                  setShowAddProduct(false);
                  setNewProductName("");
                  setNewProductPrice("");
                }}
                variant="ghost"
                style={{ flex: 1, marginRight: 8 }}
              />
              <EnhancedButton
                title="Agregar"
                onPress={handleAddProduct}
                loading={loading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        )}
      </EnhancedCard>

      {/* Alert de confirmación para eliminar */}
      <ConfirmationAlert
        visible={confirmDelete.show}
        title={`Eliminar ${
          confirmDelete.type === "participant" ? "Participante" : "Producto"
        }`}
        message={`¿Estás seguro de que quieres eliminar ${
          confirmDelete.type === "participant" ? "a" : ""
        } "${confirmDelete.name}"?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => handleConfirmDelete(true)}
        onCancel={() => handleConfirmDelete(false)}
        type="danger"
      />

      {error && (
        <EnhancedCard style={{ backgroundColor: "#FEE2E2", marginTop: 16 }}>
          <Text
            style={{
              color: colors.error,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        </EnhancedCard>
      )}
    </View>
  );
};

const styles = {
  sectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600" as const,
  },
  removeButton: {
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  removeButtonText: {
    color: "#DC3545",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  addForm: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addFormButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: 20,
  },

  // Estilos mejorados para participantes
  participantCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
    overflow: "hidden" as const,
  },
  instagramProfilePic: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  participantAvatarText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "white",
  },
  participantInfo: {
    flex: 1,
  },
  participantNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.textPrimary,
    marginRight: 8,
  },
  verifiedBadge: {
    fontSize: 12,
    color: "#4CAF50",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontWeight: "bold" as const,
  },
  participantEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  creatorBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start" as const,
  },
  creatorBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#8B7000",
  },

  // Estilos modernos para productos
  modernProductCard: {
    backgroundColor: "white",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F1F3F4",
  },
  productHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 20,
    paddingBottom: 16,
  },
  productIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.belandOrange + "15",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.belandOrange + "30",
  },
  productEmoji: {
    fontSize: 32,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  productHeaderInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  productPricePerUnit: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500" as const,
  },
  productDivider: {
    height: 1,
    backgroundColor: "#F1F3F4",
    marginHorizontal: 20,
  },
  productFooter: {
    flexDirection: "column" as const,
    padding: 20,
    paddingTop: 16,
  },
  productPriceFooter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  quantitySection: {
    width: "100%" as const,
    alignItems: "center" as const,
  },
  quantityLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quantityButtonMinus: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EF4444",
  },
  quantityButtonPlus: {
    backgroundColor: "#FFFFFF",
    borderColor: colors.primary,
  },
  quantityButtonDisabled: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.primary,
  },
  quantityButtonTextDisabled: {
    color: "#9CA3AF",
  },
  quantityDisplay: {
    alignItems: "center" as const,
    marginHorizontal: 20,
    minWidth: 60,
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.textPrimary,
  },
  quantityUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500" as const,
    marginTop: 2,
  },
  priceSection: {
    alignItems: "center" as const,
    width: "100%" as const,
  },
  priceSectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalPriceDisplay: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    backgroundColor: "rgba(248, 141, 42, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(248, 141, 42, 0.3)",
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.belandOrange,
    marginRight: 2,
  },
  totalPrice: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: colors.belandOrange,
    letterSpacing: -0.5,
  },
  removeProductButton: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    width: 36,
    height: 36,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginLeft: 12,
  },
  removeProductButtonText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "700" as const,
  },

  // Estilos legacy (mantener para compatibilidad)
  enhancedProductCard: {
    flexDirection: "column" as const,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productMainInfo: {
    flex: 1,
    marginBottom: 16,
  },
  productPriceInfo: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 8,
  },
  productTotalPrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.textPrimary,
  },
  quantityDisplayContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
    minWidth: 50,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  totalPriceContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: colors.primary + "15",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  totalPriceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
    fontWeight: "500" as const,
  },

  // Estilos adicionales para formularios
  cancelButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "500" as const,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600" as const,
  },
};
