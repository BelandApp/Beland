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
  // Obtener billetera por email de usuario
  async getWalletByUserId(userEmail: string, userId?: string): Promise<Wallet> {
    try {
      // El backend devuelve un solo objeto wallet para el usuario autenticado
      const wallet = await apiRequest(`/wallets`, {
        method: "GET",
      });
      if (wallet && wallet.id) {
        return wallet;
      } else {
        // Si no existe, crearla automáticamente
        const alias = userEmail.split("@")[0];
        if (!userId) {
          throw new Error(
            "No se puede crear la wallet: userId es requerido por el backend."
          );
        }
        const newWallet = await this.createWallet({
          userId,
          alias: alias,
        });
        console.log("✅ Billetera creada automáticamente con alias:", alias);
        return newWallet;
      }
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
      const rechargeData = {
        wallet_id: wallet.id,
        amountUsd: amountUsd,
        referenceCode: referenceCode,
        payphone_transactionId: Date.now(), // número
        clientTransactionId: wallet.id, // UUID string
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
  async createTransfer(transferData: TransferRequest): Promise<any> {
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

  // Buscar wallet por alias, email o teléfono (para transferencias)
  async findWalletByIdentifier(identifier: string): Promise<Wallet | null> {
    try {
      // Solo soportamos búsqueda por email por ahora
      if (identifier.includes("@")) {
        return await this.getWalletByUserId(identifier);
      }

      // Para alias u otros identificadores, necesitaríamos un endpoint específico
      // Por ahora lanzamos un error descriptivo
      throw new Error(
        "Solo se pueden hacer transferencias a emails registrados en Beland"
      );
    } catch (error) {
      console.log("⚠️ Wallet no encontrada por identificador:", identifier);
      return null;
    }
  }

  // Transferencia entre usuarios (solo usuarios registrados por ahora)
  async transferBetweenUsers(
    senderEmail: string,
    recipientIdentifier: string,
    amount: number,
    description?: string
  ): Promise<any> {
    try {
      console.log(
        `💸 Iniciando transferencia de ${senderEmail} a ${recipientIdentifier}: ${amount} BeCoins`
      );

      // TODO: Obtener el UUID del usuario de otra forma si es necesario
      // const senderUUID = await userService.getUserUUIDByEmail(senderEmail);
      const senderUUID = undefined; // El backend debe tomar el usuario del token

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
      const transferData: TransferRequest = {
        receiver_user_id: recipientWallet.user_id,
        amount: amount,
        description: description,
        transfer_type: "WALLET_TO_WALLET",
      };

      const result = await this.createTransfer(transferData);
      return { ...result, isPending: false };
    } catch (error) {
      console.error("❌ Error en transferencia entre usuarios:", error);
      throw error;
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
