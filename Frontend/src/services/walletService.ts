import { apiRequest } from "./api";
// import { userService } from "./userService";

// Tipos para Wallet según el backend
export interface Wallet {
  id: string;
  user_id: string;
  becoin_balance: number;
  locked_balance: number;
  address?: string;
  alias?: string;
  qr?: string;
  private_key_encrypted?: string;
  created_at: string;
}

export interface RechargeRequest {
  wallet_id: string;
  amountUsd: number;
  referenceCode: string;
  clientTransactionId: string; // UUID
  payphone_transactionId: number;
  // recarge_method?: "CREDIT_CARD" | "DEBIT_CARD" | "PAYPHONE" | "BANK_TRANSFER";
}

export interface TransferRequest {
  sender_user_id?: string;
  receiver_user_id: string;
  amount: number;
  description?: string;
  transfer_type: "WALLET_TO_WALLET" | "WALLET_TO_BANK" | "BANK_TO_WALLET";
}

export interface WalletCreateRequest {
  userId?: string; // El DTO del backend espera userId, pero puede omitirse si el usuario está autenticado
  address?: string;
  alias?: string;
  private_key_encrypted?: string;
}

export interface PendingTransferRequest {
  sender_user_id: string;
  recipient_identifier: string; // email, alias o teléfono
  amount: number;
  description?: string;
}

class WalletService {
  // Crear compra de BeCoins (registro correcto de tipo de transferencia)
  async createPurchaseBecoin(purchaseData: {
    toWalletId: string;
    amountBecoin: number;
    description?: string;
  }): Promise<any> {
    try {
      console.log("🛒 Creando compra de BeCoins:", purchaseData);
      const response = await apiRequest("/wallets/purchase-becoin", {
        method: "POST",
        body: JSON.stringify(purchaseData),
      });
      console.log("✅ Compra registrada:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creando compra de BeCoins:", error);
      throw error;
    }
  }
  // Eliminar preset de monto
  async deletePresetAmount(id: string): Promise<any> {
    try {
      const response = await apiRequest(`/preset-amount/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Error al eliminar preset de monto:", error);
      throw error;
    }
  }
  // Obtener QR de la wallet usando un token explícito
  async getWalletQRWithToken(token: string): Promise<string | null> {
    console.log("getWalletQRWithToken called");
    console.log("Token actual:", token);
    if (!token) {
      console.error(
        "No hay token de autenticación. El usuario debe iniciar sesión."
      );
      return null;
    }
    try {
      const resp = await apiRequest("/wallets/qr", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp?.qr) return resp.qr;
      return null;
    } catch (error) {
      console.error("Error al obtener el QR:", error);
      return null;
    }
  }
  // Obtener datos de pago tras escanear QR
  async getDataPayment(walletId: string): Promise<any> {
    try {
      const response = await apiRequest(`/wallets/data-Payment/${walletId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error al obtener datos de pago:", error);
      throw error;
    }
  }
  // Listar presets de monto
  async getPresetAmounts(): Promise<any[]> {
    try {
      const response = await apiRequest("/preset-amount", { method: "GET" });
      return response || [];
    } catch (error) {
      console.error("Error al obtener presets de monto:", error);
      throw error;
    }
  }

  // Crear preset de monto
  async createPresetAmount(data: {
    name: string;
    amount: number;
    message?: string;
  }): Promise<any> {
    try {
      const response = await apiRequest("/preset-amount", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error("Error al crear preset de monto:", error);
      throw error;
    }
  }
  // Obtener montos a cobrar
  async getAmountsToPayment(): Promise<any[]> {
    try {
      const response = await apiRequest("/amount-to-payment", {
        method: "GET",
      });
      return response || [];
    } catch (error) {
      console.error("Error al obtener montos a cobrar:", error);
      throw error;
    }
  }

  // Crear monto a cobrar
  async createAmountToPayment(amount: number): Promise<any> {
    try {
      const payload = { amount };
      console.log("[createAmountToPayment] Payload enviado:", payload);
      const response = await apiRequest("/amount-to-payment", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("[createAmountToPayment] Respuesta backend:", response);
      return response;
    } catch (error) {
      console.error("Error al crear monto a cobrar:", error);
      throw error;
    }
  }

  // Eliminar monto a cobrar
  async deleteAmountToPayment(id: string): Promise<any> {
    try {
      const response = await apiRequest(`/amount-to-payment/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Error al eliminar monto a cobrar:", error);
      throw error;
    }
  }

  // Recarga usando el modo API Payphone (el backend hace toda la integración)
  async rechargeWithPayphoneAPI(data: {
    userId: string;
    email: string;
    amount: number;
    paymentMethod: string;
  }): Promise<{ wallet: Wallet }> {
    // Validación de monto
    const amountNum = Number(data.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      throw new Error(
        "El monto de recarga debe ser un número válido y mayor a cero."
      );
    }
    // Utiliza el userId si es UUID válido, si no genera uno
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const clientTransactionId = uuidRegex.test(data.userId)
      ? data.userId
      : typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-fake-uuid-frontend`;
    const payload = {
      wallet_id: data.userId,
      amountUsd: amountNum,
      referenceCode: `RCH-${Date.now()}`,
      clientTransactionId,
      payphone_transactionId: Date.now(), // Valor temporal para pruebas
    };
    console.log("[Recarga API] Payload enviado al backend:", payload);
    const response = await apiRequest("/wallets/recharge", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    console.log("[Recarga API] Respuesta recibida del backend:", response);
    return response;
  }
  // Obtener billetera por email de usuario
  async getWalletByUserId(userEmail: string, userId?: string): Promise<Wallet> {
    try {
      // El backend devuelve la wallet del usuario autenticado
      const response = await apiRequest(`/wallets/user`, {
        method: "GET",
      });
      if (response && response.id) {
        return response;
      }
      throw new Error(
        "No existe una wallet para este usuario. Contacta soporte."
      );
    } catch (error) {
      console.error("Error getting wallet by user email:", error);
      throw error;
    }
  }

  // Obtener billetera por ID
  async getWalletById(walletId: string): Promise<Wallet> {
    try {
      const response = await apiRequest(`/wallets/${walletId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error getting wallet by ID:", error);
      throw error;
    }
  }

  // Crear nueva billetera
  async createWallet(walletData: WalletCreateRequest): Promise<Wallet> {
    try {
      console.log("🔧 Creando wallet con datos:", walletData);
      console.log("🔍 Debugging - userId enviado:", walletData.userId);
      console.log("🔍 Debugging - JSON stringify:", JSON.stringify(walletData));
      const response = await apiRequest("/wallets", {
        method: "POST",
        body: JSON.stringify(walletData),
      });
      console.log("✅ Wallet creada exitosamente:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating wallet:", error);
      throw error;
    }
  }

  // Crear recarga (compra de BeCoins)
  async createRecharge(
    rechargeData: RechargeRequest
  ): Promise<{ wallet: Wallet }> {
    try {
      console.log("🔧 Creando recarga con datos:", rechargeData);
      const response = await apiRequest("/wallets/recharge", {
        method: "POST",
        body: JSON.stringify(rechargeData),
      });
      console.log("✅ Recarga creada exitosamente:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating recharge:", error);
      throw error;
    }
  }

  // Función helper para recargar usando email del usuario
  async rechargeByUserEmail(
    userEmail: string,
    userId: string,
    amountUsd: number,
    recargeMethod:
      | "CREDIT_CARD"
      | "DEBIT_CARD"
      | "PAYPHONE"
      | "BANK_TRANSFER" = "CREDIT_CARD"
  ): Promise<{ wallet: Wallet }> {
    try {
      console.log(`💰 Iniciando recarga para ${userEmail}: $${amountUsd} USD`);

      // Obtener la wallet del usuario
      const wallet = await this.getWalletByUserId(userEmail, userId);
      console.log("📱 Wallet obtenida:", wallet.id);

      // Generar código de referencia único
      const referenceCode = `RCH-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Crear la recarga con los tipos correctos
      const numericReference =
        Number(referenceCode.replace(/\D/g, "")) || Date.now();
      // Generar UUID único para la transacción
      let clientTransactionId;
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        clientTransactionId = crypto.randomUUID();
      } else {
        clientTransactionId = `${Date.now()}-tx-uuid`;
      }
      const rechargeData = {
        wallet_id: wallet.id,
        amountUsd: amountUsd,
        referenceCode: referenceCode,
        payphone_transactionId: Date.now(), // número
        clientTransactionId,
      };

      const result = await this.createRecharge(rechargeData);

      console.log(`✅ Recarga completada: $${amountUsd} USD → ${wallet.id}`);
      return result;
    } catch (error) {
      console.error("❌ Error en recarga por email:", error);
      throw error;
    }
  }

  // Crear transferencia
  async createTransfer(transferData: {
    toWalletId: string;
    amountBecoin: number;
    description?: string;
  }): Promise<any> {
    try {
      console.log("🔄 Creando transferencia:", transferData);
      const response = await apiRequest("/wallets/transfer", {
        method: "POST",
        body: JSON.stringify(transferData),
      });
      console.log("✅ Transferencia creada:", response);
      return response;
    } catch (error) {
      console.error("❌ Error creating transfer:", error);
      throw error;
    }
  }

  // Actualizar billetera
  async updateWallet(
    walletId: string,
    updateData: Partial<Wallet>
  ): Promise<Wallet> {
    try {
      console.log(`🔧 Actualizando wallet ${walletId}:`, updateData);
      const response = await apiRequest(`/wallets/${walletId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      console.log("✅ Wallet actualizada:", response);
      return response;
    } catch (error) {
      console.error("❌ Error updating wallet:", error);
      throw error;
    }
  }

  // Listar billeteras (para admin)
  async getAllWallets(
    page: number = 1,
    limit: number = 10
  ): Promise<{ wallets: Wallet[]; total: number }> {
    try {
      const response = await apiRequest(
        `/wallets?page=${page}&limit=${limit}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Error getting all wallets:", error);
      throw error;
    }
  }

  // Buscar wallet por alias (para transferencias)
  async findWalletByIdentifier(alias: string): Promise<Wallet | null> {
    try {
      const response = await apiRequest(`/wallets/alias/${alias}`, {
        method: "GET",
      });
      if (response && response.id) return response;
      return null;
    } catch (error) {
      console.log("⚠️ Wallet no encontrada por alias:", alias);
      return null;
    }
  }

  // Transferencia entre usuarios (solo usuarios registrados por ahora)
  async transferBetweenUsers(
    senderEmail: string,
    recipientIdentifier: string,
    amount: number
  ): Promise<any> {
    try {
      console.log(
        `💸 Iniciando transferencia de ${senderEmail} a ${recipientIdentifier}: ${amount} BeCoins`
      );

      // Buscar wallet del destinatario
      const recipientWallet = await this.findWalletByIdentifier(
        recipientIdentifier
      );

      if (!recipientWallet) {
        // Sin sistema de transferencias pendientes disponible
        throw new Error(
          "El destinatario debe estar registrado en Beland para recibir BeCoins"
        );
      }

      // Usuario registrado - transferencia directa
      console.log("✅ Usuario encontrado, realizando transferencia directa...");
      const transferData = {
        toWalletId: recipientWallet.id,
        amountBecoin: amount,
        // description eliminado porque el backend no lo acepta
      };

      const result = await this.createTransfer(transferData);
      return { ...result, isPending: false };
    } catch (error) {
      console.error("❌ Error en transferencia entre usuarios:", error);
      throw error;
    }
  }

  // Obtener QR de la wallet del usuario/comercio
  async getWalletQR(): Promise<string | null> {
    console.log("getWalletQR called");
    const { token } =
      require("../stores/useAuthTokenStore").useAuthTokenStore.getState();
    console.log("Token actual:", token);
    if (!token) {
      console.error(
        "No hay token de autenticación. El usuario debe iniciar sesión."
      );
      return null;
    }
    try {
      const resp = await apiRequest("/wallets/qr", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp?.qr) return resp.qr;
      return null;
    } catch (error) {
      console.error("Error al obtener el QR:", error);
      return null;
    }
  }

  // Función de diagnóstico para verificar el estado del servicio
  async healthCheck(): Promise<{ status: string; message: string }> {
    try {
      // Intentar una llamada simple al backend para verificar conectividad
      const response = await apiRequest("/wallets?page=1&limit=1", {
        method: "GET",
      });
      return {
        status: "OK",
        message: "WalletService está funcionando correctamente",
      };
    } catch (error) {
      console.error("❌ WalletService health check failed:", error);
      return {
        status: "ERROR",
        message: `WalletService no está disponible: ${
          error instanceof Error ? error.message : "Error desconocido"
        }`,
      };
    }
  }
}

export const walletService = new WalletService();

// Log de inicialización
console.log("📱 WalletService inicializado correctamente");

// Exportar también la clase para casos especiales
export { WalletService };
