import { useState, useCallback } from "react";
import { Group, Participant, Product, PaymentMode } from "../../../types";
import { GroupService } from "../../../services/groupService";

export interface UseGroupManagementReturn {
  // Estados
  loading: boolean;
  error: string | null;

  // Gestión de participantes
  addParticipant: (
    groupId: string,
    participant: Participant
  ) => Promise<Group | null>;
  removeParticipant: (
    groupId: string,
    participantId: string
  ) => Promise<Group | null>;

  // Gestión de productos
  addProduct: (groupId: string, product: Product) => Promise<Group | null>;
  removeProduct: (groupId: string, productId: string) => Promise<Group | null>;
  updateProductQuantity: (
    groupId: string,
    productId: string,
    quantity: number
  ) => Promise<Group | null>;

  // Gestión de pagos
  updatePaymentMode: (
    groupId: string,
    paymentMode: PaymentMode,
    payingUserId?: string
  ) => Promise<Group | null>;
  updateParticipantCustomAmount: (
    groupId: string,
    participantId: string,
    amount: number
  ) => Promise<Group | null>;

  // Utilidades
  clearError: () => void;
}

export const useGroupManagement = (): UseGroupManagementReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsyncOperation = async <T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      return result;
    } catch (err) {
      setError(errorMessage);
      console.error(errorMessage, err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addParticipant = useCallback(
    async (groupId: string, participant: Participant) => {
      return handleAsyncOperation(
        () => GroupService.addParticipantToGroup(groupId, participant),
        "Error al agregar participante al grupo"
      );
    },
    []
  );

  const removeParticipant = useCallback(
    async (groupId: string, participantId: string) => {
      return handleAsyncOperation(
        () => GroupService.removeParticipantFromGroup(groupId, participantId),
        "Error al remover participante del grupo"
      );
    },
    []
  );

  const addProduct = useCallback(async (groupId: string, product: Product) => {
    return handleAsyncOperation(
      () => GroupService.addProductToGroup(groupId, product),
      "Error al agregar producto al grupo"
    );
  }, []);

  const removeProduct = useCallback(
    async (groupId: string, productId: string) => {
      return handleAsyncOperation(
        () => GroupService.removeProductFromGroup(groupId, productId),
        "Error al remover producto del grupo"
      );
    },
    []
  );

  const updateProductQuantity = useCallback(
    async (groupId: string, productId: string, quantity: number) => {
      return handleAsyncOperation(
        () => GroupService.updateProductQuantity(groupId, productId, quantity),
        "Error al actualizar cantidad del producto"
      );
    },
    []
  );

  const updatePaymentMode = useCallback(
    async (
      groupId: string,
      paymentMode: PaymentMode,
      payingUserId?: string
    ) => {
      return handleAsyncOperation(
        () =>
          GroupService.updatePaymentMode(groupId, paymentMode, payingUserId),
        "Error al actualizar modo de pago"
      );
    },
    []
  );

  const updateParticipantCustomAmount = useCallback(
    async (groupId: string, participantId: string, amount: number) => {
      return handleAsyncOperation(
        () =>
          GroupService.updateParticipantCustomAmount(
            groupId,
            participantId,
            amount
          ),
        "Error al actualizar monto personalizado"
      );
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    addParticipant,
    removeParticipant,
    addProduct,
    removeProduct,
    updateProductQuantity,
    updatePaymentMode,
    updateParticipantCustomAmount,
    clearError,
  };
};
