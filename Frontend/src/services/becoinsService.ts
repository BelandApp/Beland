import { apiRequest } from "./api";
import { userService } from "./userService";

// Interfaces para BeCoins
export interface BeCoinBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface BeCoinTransaction {
  id: string;
  userId: string;
  type: "earned" | "spent" | "transfer" | "refund";
  amount: number;
  description: string;
  category: string;
  relatedId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  status: "pending" | "completed" | "failed" | "cancelled";
}

export interface BeCoinTransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  category?: string;
}

export interface BeCoinEarnRequest {
  userId: string;
  amount: number;
  description: string;
  category: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export interface BeCoinSpendRequest {
  userId: string;
  amount: number;
  description: string;
  category: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export interface BeCoinTransactionFilter {
  userId?: string;
  type?: BeCoinTransaction["type"];
  category?: string;
  status?: BeCoinTransaction["status"];
  startDate?: Date;
  endDate?: Date;
  relatedId?: string;
}

class BeCoinsService {
  constructor() {
    console.log("✅ BeCoinsService instanciado correctamente");
  }

  // Obtener balance de BeCoins por usuario (usando email)
  async getBalance(userEmail: string): Promise<BeCoinBalance> {
    console.log("🔄 BeCoinsService.getBalance llamado para:", userEmail);
    try {
      // Obtener UUID del usuario
      const userUUID = await userService.getUserUUIDByEmail(userEmail);
      console.log("🔗 UUID del usuario:", userUUID);

      console.log("🌐 Intentando obtener wallet del usuario...");
      const wallet = await apiRequest(`/wallets/user/${userUUID}`, {
        method: "GET",
      });

      console.log("✅ Wallet obtenido:", wallet);

      return {
        userId: userEmail,
        balance: wallet.balance || 0,
        totalEarned: 0,
        totalSpent: 0,
        lastUpdated: new Date(wallet.updated_at || new Date()),
      };
    } catch (error) {
      console.error("❌ Error getting becoin balance:", error);
      throw error;
    }
  }

  // Gastar BeCoins
  async spendBeCoins(request: BeCoinSpendRequest): Promise<BeCoinTransaction> {
    console.log("🔄 BeCoinsService.spendBeCoins llamado con:", request);
    try {
      // Obtener UUID del usuario
      const userUUID = await userService.getUserUUIDByEmail(request.userId);
      console.log("🔗 UUID del usuario:", userUUID);

      console.log("🌐 Obteniendo wallet del usuario...");
      const wallet = await apiRequest(`/wallets/user/${userUUID}`, {
        method: "GET",
      });

      console.log("🌐 Creando transacción de gasto...");
      const transaction = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify({
          user_id: userUUID,
          wallet_id: wallet.id,
          amount: -request.amount,
          transaction_type_id: "1",
          transaction_state_id: "1",
          description: request.description,
          metadata: {
            category: request.category,
            ...request.metadata,
          },
        }),
      });

      console.log("✅ Transacción creada:", transaction);

      return this.convertTransactionToBeCoin(transaction, "spent");
    } catch (error) {
      console.error("❌ Error spending becoins:", error);
      throw error;
    }
  }

  // Obtener transacciones de BeCoins
  async getTransactions(
    filter: BeCoinTransactionFilter = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    transactions: BeCoinTransaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    console.log("🔄 BeCoinsService.getTransactions llamado con:", {
      filter,
      page,
      limit,
    });
    try {
      // Obtener UUID del usuario si se proporciona
      let userUUID = filter.userId;
      if (filter.userId) {
        userUUID = await userService.getUserUUIDByEmail(filter.userId);
      }

      const url = `/transactions?user_id=${userUUID}&page=${page}&limit=${limit}`;
      console.log("🌐 Consultando:", url);

      const response = await apiRequest(url, {
        method: "GET",
      });

      console.log("✅ Respuesta de transacciones:", response);

      // El backend devuelve [transactions[], total] desde TypeORM findAndCount
      const [transactionsArray, total] = Array.isArray(response)
        ? response
        : [response.transactions || [], response.total || 0];

      const transactions = (transactionsArray || []).map((tx: any) =>
        this.convertTransactionToBeCoin(tx, tx.amount > 0 ? "earned" : "spent")
      );

      return {
        transactions,
        total: total || transactions.length,
        page,
        limit,
        totalPages: Math.ceil((total || transactions.length) / limit),
      };
    } catch (error) {
      console.error("❌ Error getting becoin transactions:", error);
      throw error;
    }
  }

  // Transferir BeCoins entre usuarios
  async transferBeCoins(
    request: BeCoinTransferRequest
  ): Promise<BeCoinTransaction> {
    console.log("🔄 BeCoinsService.transferBeCoins llamado con:", request);
    try {
      // Obtener UUIDs de ambos usuarios
      const fromUUID = await userService.getUserUUIDByEmail(request.fromUserId);
      const toUUID = await userService.getUserUUIDByEmail(request.toUserId);

      const transfer = await apiRequest("/wallets/transfer", {
        method: "POST",
        body: JSON.stringify({
          sender_user_id: fromUUID,
          receiver_user_id: toUUID,
          amount: request.amount,
          description: request.description,
          transfer_type: "WALLET_TO_WALLET",
        }),
      });

      return {
        id: transfer.id || `transfer_${Date.now()}`,
        userId: request.fromUserId,
        type: "transfer",
        amount: request.amount,
        description: request.description,
        category: request.category || "transfer",
        createdAt: new Date(),
        status: "completed",
      };
    } catch (error) {
      console.error("❌ Error transferring becoins:", error);
      throw error;
    }
  }

  // Validar si el usuario tiene suficientes BeCoins
  async validateSufficientFunds(
    userId: string,
    amount: number
  ): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      return balance.balance >= amount;
    } catch (error) {
      console.error("❌ Error validating funds:", error);
      return false;
    }
  }

  // Función helper para convertir transacciones
  private convertTransactionToBeCoin(
    transaction: any,
    type: BeCoinTransaction["type"]
  ): BeCoinTransaction {
    return {
      id: transaction.id,
      userId: transaction.user_id,
      type,
      amount: Math.abs(transaction.amount),
      description: transaction.description || "",
      category: transaction.metadata?.category || "general",
      relatedId: transaction.reference_number,
      metadata: transaction.metadata,
      createdAt: new Date(transaction.created_at),
      status: "completed",
    };
  }
}

export const beCoinsService = new BeCoinsService();
console.log("✅ beCoinsService exportado:", !!beCoinsService);
