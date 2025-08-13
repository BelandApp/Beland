import { useCartStore } from "../../stores/useCartStore";
import { useGroupAdminStore } from "../../stores/groupStores";
import React, { useState } from "react";
import { View, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { ConfirmationAlert } from "../../components/ui/ConfirmationAlert";
import { WaveBottomGray } from "../../components/icons";
import { GroupService } from "../../services/groupService";
import { InstagramUser } from "../../services/instagramService";
import { Participant } from "../../types";
import { useCreateGroupStore } from "../../stores/useCreateGroupStore";
import * as Haptics from "expo-haptics";

// Validación y utilidades
import { validateGroupForm } from "../../business/validation/groupValidation";
import { formatTimeInput, formatPersonName } from "./business/textUtils";

// Hooks personalizados
import { useCreateGroupForm, useTimeModal, useLocationModal } from "./hooks";

// Componentes
import {
  CreateGroupHeader,
  BasicGroupInfo,
  ParticipantsSection,
  TimeModal,
  LocationModal,
  CreateGroupButton,
} from "./components";
// import ProductsSection from './components/ProductsSection';

// Estilos
import { createGroupStyles } from "./styles";

export const CreateGroupScreen = ({ navigation, route }: any) => {
  // Hooks de Zustand para carrito y productos de grupo (deben ir dentro del componente)
  const { products: cartProducts, clearCart } = useCartStore();
  const { addProductToGroup } = useGroupAdminStore();
  // Store de Zustand
  const {
    groupName,
    groupType,
    description,
    location,
    deliveryTime,
    participants,
    setGroupName,
    setGroupType,
    setDescription,
    setLocation,
    setDeliveryTime,
    addParticipant,
    removeParticipant,
    setIsCreatingGroup,
    clearGroup,
  } = useCreateGroupStore();

  // Hooks personalizados (usando la implementación actual)
  const {
    newParticipantName,
    newParticipantInstagram,
    errors,
    setNewParticipantName,
    setNewParticipantInstagram,
    clearError,
    setError,
  } = useCreateGroupForm();

  // Estado para el usuario de Instagram seleccionado
  const [selectedInstagramUser, setSelectedInstagramUser] =
    useState<InstagramUser | null>(null);

  const {
    showTimeModal,
    selectedHour,
    selectedMinute,
    setShowTimeModal,
    setSelectedHour,
    setSelectedMinute,
    getFormattedDeliveryTime,
  } = useTimeModal();

  const {
    showLocationModal,
    currentLocation,
    isLoadingLocation,
    setShowLocationModal,
    getCurrentLocation,
  } = useLocationModal((locationFromMaps) => {
    // Callback que se ejecuta cuando se recibe ubicación de Google Maps
    setLocation(locationFromMaps);
    if (errors.location) {
      clearError("location");
    }
  });

  // Estados locales
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  const [
    showRemoveParticipantConfirmation,
    setShowRemoveParticipantConfirmation,
  ] = useState(false);
  const [participantToRemove, setParticipantToRemove] = useState<string | null>(
    null
  );
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
    groupId?: string;
  }>({
    title: "",
    message: "",
    type: "info",
    groupId: undefined,
  });

  // Función para mostrar alertas
  const showCustomAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    setAlertConfig({ title, message, type });
    setShowAlert(true);
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const validationErrors = validateGroupForm({
      groupName,
      groupType,
      location,
      deliveryTime,
      participants,
    });
    // Actualizar errors usando setError
    Object.keys(validationErrors).forEach((key) => {
      setError(
        key as any,
        validationErrors[key as keyof typeof validationErrors]!
      );
    });
    return Object.keys(validationErrors).length === 0;
  };

  // Funciones de manejo
  const handleGroupNameChange = (value: string) => {
    setGroupName(value);
    if (errors.groupName && value) {
      clearError("groupName");
    }
  };

  const handleGroupTypeChange = (value: string) => {
    setGroupType(value);
    if (errors.groupType && value) {
      clearError("groupType");
    }
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    if (errors.description && text.trim().length >= 10) {
      clearError("description");
    }
  };

  const handleParticipantNameChange = (text: string) => {
    setNewParticipantName(text);
    if (errors.newParticipantName && text.trim().length >= 2) {
      clearError("newParticipantName");
    }
  };

  const handleParticipantInstagramChange = (text: string) => {
    setNewParticipantInstagram(text);
    // Si hay un usuario seleccionado y se cambia el texto, limpiarlo
    if (selectedInstagramUser) {
      setSelectedInstagramUser(null);
    }
    if (errors.newParticipantInstagram && text.trim()) {
      clearError("newParticipantInstagram");
    }
  };

  const handleInstagramUserSelect = (user: InstagramUser) => {
    setSelectedInstagramUser(user);
    setNewParticipantInstagram(user.username);
    // Auto-completar el nombre si está vacío
    if (!newParticipantName.trim()) {
      setNewParticipantName(user.full_name);
    }
    if (errors.newParticipantInstagram) {
      clearError("newParticipantInstagram");
    }
  };

  // Ubicación y tiempo
  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setShowLocationModal(false);
    if (errors.location) {
      clearError("location");
    }
  };

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setLocation(location.address);
      setShowLocationModal(false);
      if (errors.location) {
        clearError("location");
      }
    }
  };

  const handleTimeConfirm = () => {
    const deliveryTime = getFormattedDeliveryTime();
    setDeliveryTime(deliveryTime);
    setShowTimeModal(false);
    if (errors.deliveryTime) {
      clearError("deliveryTime");
    }
  };

  // Agregar participante (usando la misma validación que GroupContentManager)
  const handleAddParticipant = () => {
    // Limpiar errores previos
    clearError("newParticipantName");
    clearError("newParticipantInstagram");

    // Validar nombre
    if (!newParticipantName.trim()) {
      setError("newParticipantName", "El nombre es requerido");
      return;
    }

    // Permitir agregar cualquier usuario de Instagram (texto libre)
    // Verificar que no esté duplicado
    const usernameToAdd = newParticipantInstagram.trim().replace(/^@/, "");
    const existingUsernames = participants
      .map((p) => (p.instagramUsername || "").toLowerCase())
      .filter((username) => username);

    if (
      usernameToAdd &&
      existingUsernames.includes(usernameToAdd.toLowerCase())
    ) {
      setError(
        "newParticipantInstagram",
        "Este usuario de Instagram ya está registrado"
      );
      return;
    }

    clearError("participants");

    const newParticipant: Participant = {
      id: Date.now().toString(),
      name: formatPersonName(newParticipantName),
      instagramUsername: usernameToAdd || undefined,
      instagramProfilePic: undefined,
      instagramFullName: undefined,
      isVerified: false,
    };

    addParticipant(newParticipant);
    setNewParticipantName("");
    setNewParticipantInstagram("");
    setSelectedInstagramUser(null);
  };

  const handleRemoveParticipant = (id: string) => {
    // Buscar el participante para obtener su nombre
    const participant = participants.find((p) => p.id === id);
    setParticipantToRemove(id);
    setShowRemoveParticipantConfirmation(true);
  };

  const confirmRemoveParticipant = () => {
    if (participantToRemove) {
      removeParticipant(participantToRemove);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setShowRemoveParticipantConfirmation(false);
    setParticipantToRemove(null);
  };

  // Navegación al catálogo
  // Funciones de navegación
  const handleBackToGroups = () => {
    // Verificar si hay datos en el formulario
    const hasFormData =
      groupName.trim() !== "" ||
      groupType.trim() !== "" ||
      description.trim() !== "" ||
      location !== null ||
      deliveryTime.trim() !== "" ||
      participants.length > 0;

    if (hasFormData) {
      // Mostrar confirmación si hay datos
      setShowCancelConfirmation(true);
    } else {
      // Navegar directamente si no hay datos
      confirmBackToGroups();
    }
  };

  const confirmBackToGroups = () => {
    // Limpiar el store antes de navegar
    clearGroup();
    setShowCancelConfirmation(false);
    navigation.navigate("Groups", { screen: "GroupsList" });
  };

  // Crear grupo
  const handleCreateGroup = async () => {
    if (!validateForm()) {
      showCustomAlert(
        "Formulario incompleto",
        "Por favor completa todos los campos requeridos correctamente.",
        "error"
      );
      return;
    }

    setIsLoading(true);

    try {
      const newGroup = await GroupService.createGroup({
        name: groupName,
        type: groupType,
        description: description,
        location: location,
        deliveryTime: deliveryTime,
        participants: participants,
      });

      setAlertConfig({
        title: "¡Grupo creado!",
        message:
          "Ahora puedes agregar productos y asignar consumos a los participantes desde la administración del grupo.",
        type: "success",
        // Guardar el id del grupo para usarlo en el handler
        groupId: newGroup.id,
      });
      setShowAlert(true);
      clearGroup();
    } catch (error) {
      showCustomAlert(
        "Error al crear grupo",
        "Hubo un problema al crear el grupo. Por favor intenta nuevamente.",
        "error"
      );
      console.error("Error creating group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función que se ejecuta cuando se cierra el alert
  const handleAlertClose = () => {
    setShowAlert(false);
  };

  const handleGoToGroupAdmin = () => {
    setShowAlert(false);
    const groupId = alertConfig.groupId;
    if (typeof groupId === "string" && groupId.length > 0) {
      // Mover productos del carrito al grupo
      if (cartProducts && cartProducts.length > 0) {
        cartProducts.forEach((prod) => {
          addProductToGroup(groupId, {
            id: prod.id,
            name: prod.name,
            quantity: prod.quantity,
            estimatedPrice: prod.price,
            totalPrice: prod.price * prod.quantity,
            category: "",
            basePrice: prod.price,
            image: prod.image || "",
          });
        });
        clearCart();
      }
      navigation.navigate("GroupManagement", { groupId });
    }
  };

  const handleGoToGroupsList = () => {
    setShowAlert(false);
    navigation.navigate("Groups", { screen: "GroupsList" });
  };

  return (
    <SafeAreaView style={createGroupStyles.container} edges={[]}>
      <ScrollView style={createGroupStyles.scrollView}>
        <View style={createGroupStyles.content}>
          {/* Header */}
          <CreateGroupHeader onBackPress={handleBackToGroups} />

          {/* Información básica del grupo */}
          <BasicGroupInfo
            groupName={groupName}
            groupType={groupType}
            description={description}
            location={location}
            deliveryTime={deliveryTime}
            errors={errors}
            onGroupNameChange={handleGroupNameChange}
            onGroupTypeChange={handleGroupTypeChange}
            onDescriptionChange={handleDescriptionChange}
            onLocationPress={() => setShowLocationModal(true)}
            onTimePress={() => setShowTimeModal(true)}
          />

          {/* Participantes */}
          <ParticipantsSection
            participants={participants}
            newParticipantName={newParticipantName}
            newParticipantInstagram={newParticipantInstagram}
            errors={errors}
            onParticipantNameChange={handleParticipantNameChange}
            onParticipantInstagramChange={handleParticipantInstagramChange}
            onInstagramUserSelect={handleInstagramUserSelect}
            onAddParticipant={handleAddParticipant}
            onRemoveParticipant={handleRemoveParticipant}
          />

          {/* Botón crear grupo */}
          <CreateGroupButton
            isLoading={isLoading}
            groupName={groupName}
            onPress={handleCreateGroup}
          />
        </View>
      </ScrollView>

      {/* Ola de fondo */}
      <View style={createGroupStyles.waveContainer}>
        <WaveBottomGray width={Dimensions.get("window").width} height={120} />
      </View>

      {/* Alerta personalizada */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={handleAlertClose}
        primaryButton={{
          text: "Ir a administrar grupo",
          onPress: handleGoToGroupAdmin,
        }}
        secondaryButton={{
          text: "Volver a grupos",
          onPress: handleGoToGroupsList,
        }}
      />

      {/* Alerta de confirmación para cancelar */}
      <ConfirmationAlert
        visible={showCancelConfirmation}
        title="¿Cancelar creación del grupo?"
        message="Se perderán todos los datos ingresados. Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Continuar editando"
        type="warning"
        icon="⚠️"
        onConfirm={confirmBackToGroups}
        onCancel={() => setShowCancelConfirmation(false)}
      />

      {/* Alerta de confirmación para eliminar participante */}
      <ConfirmationAlert
        visible={showRemoveParticipantConfirmation}
        title="¿Eliminar participante?"
        message={`¿Estás seguro de que quieres eliminar a ${
          participantToRemove
            ? participants.find((p) => p.id === participantToRemove)?.name ||
              "este participante"
            : "este participante"
        } del grupo?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        type="danger"
        icon="👥"
        onConfirm={confirmRemoveParticipant}
        onCancel={() => {
          setShowRemoveParticipantConfirmation(false);
          setParticipantToRemove(null);
        }}
      />

      {/* Modal de ubicación */}
      <LocationModal
        visible={showLocationModal}
        currentLocation={currentLocation}
        isLoadingLocation={isLoadingLocation}
        onLocationSelect={handleLocationSelect}
        onGetCurrentLocation={handleGetCurrentLocation}
        onClose={() => setShowLocationModal(false)}
      />

      {/* Modal de tiempo */}
      <TimeModal
        visible={showTimeModal}
        selectedHour={selectedHour}
        selectedMinute={selectedMinute}
        onHourChange={setSelectedHour}
        onMinuteChange={setSelectedMinute}
        onConfirm={handleTimeConfirm}
        onClose={() => setShowTimeModal(false)}
      />
    </SafeAreaView>
  );
};
