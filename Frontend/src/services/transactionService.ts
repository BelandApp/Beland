import { apiRequest } from "./api";

// Tipos para Transacciones según el backend
export interface Transaction {
  id: string;
  user_id?: string;
  wallet_id: string;
  related_wallet_id?: string; // <-- agregado para transferencias
  amount: number;
  amount_beicon?: number;
  type_id?: string;
  status_id?: string;
  transaction_type_id?: string;
  transaction_state_id?: string;
  description?: string;
  reference_number?: string;
  reference?: string;
  metadata?: any;
  post_balance?: number;
  created_at: string;
  updated_at?: string;
  // Relaciones - pueden venir como 'type'/'status' o como 'transaction_type'/'transaction_state'
  type?: TransactionType;
  status?: TransactionState;
  transaction_type?: TransactionType;
  transaction_state?: TransactionState;
}

export interface TransactionType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface TransactionState {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface CreateTransactionRequest {
  user_id: string;
  wallet_id: string;
  amount: number;
  transaction_type_id: string;
  transaction_state_id: string;
  description?: string;
  reference_number?: string;
  metadata?: any;
}

export interface TransactionFilters {
  user_id?: string;
  wallet_id?: string;
  transaction_type_id?: string;
  transaction_state_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

class TransactionService {
  // Listar transacciones con filtros
  async getTransactions(
    filters: TransactionFilters = {}
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiRequest(
        `/transactions?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );

      // El backend devuelve [transactions[], total] desde TypeORM findAndCount
      const [transactionsArray, total] = Array.isArray(response)
        ? response
        : [response.transactions || [], response.total || 0];

      return {
        transactions: transactionsArray || [],
        total: total || 0,
      };
    } catch (error) {
      console.error("Error getting transactions:", error);
      throw error;
    }
  }

  // Obtener transacción por ID
  async getTransactionById(transactionId: string): Promise<Transaction> {
    try {
      const response = await apiRequest(`/transactions/${transactionId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error getting transaction by ID:", error);
      throw error;
    }
  }

  // Crear nueva transacción
  async createTransaction(
    transactionData: CreateTransactionRequest
  ): Promise<Transaction> {
    try {
      const response = await apiRequest("/transactions", {
        method: "POST",
        body: JSON.stringify(transactionData),
      });
      return response;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  // Actualizar transacción
  async updateTransaction(
    transactionId: string,
    updateData: Partial<CreateTransactionRequest>
  ): Promise<Transaction> {
    try {
      const response = await apiRequest(`/transactions/${transactionId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      return response;
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

  // Obtener tipos de transacción
  async getTransactionTypes(): Promise<TransactionType[]> {
    try {
      const response = await apiRequest("/transaction-type", {
        method: "GET",
      });
      return response.transaction_types || response;
    } catch (error) {
      console.error("Error getting transaction types:", error);
      throw error;
    }
  }

  // Obtener estados de transacción
  async getTransactionStates(): Promise<TransactionState[]> {
    try {
      const response = await apiRequest("/transaction-state", {
        method: "GET",
      });
      return response.transaction_states || response;
    } catch (error) {
      console.error("Error getting transaction states:", error);
      throw error;
    }
  }

  // Obtener transacciones por usuario
  async getTransactionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ transactions: Transaction[]; total: number }> {
    try {
      return await this.getTransactions({
        user_id: userId,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error getting transactions by user ID:", error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
