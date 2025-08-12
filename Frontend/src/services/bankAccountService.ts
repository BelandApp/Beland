import { apiRequest } from "./api";

// Tipos para Cuentas Bancarias según el backend
export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  account_type_id: string;
  routing_number?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  account_type?: BankAccountType;
}

export interface BankAccountType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface CreateBankAccountRequest {
  user_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  account_type_id: string;
  routing_number?: string;
}

export interface BankAccountFilters {
  user_id?: string;
  bank_name?: string;
  is_verified?: boolean;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

class BankAccountService {
  // Listar cuentas bancarias con filtros
  async getBankAccounts(
    filters: BankAccountFilters = {}
  ): Promise<{ bank_accounts: BankAccount[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiRequest(
        `/bank_account?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Error getting bank accounts:", error);
      throw error;
    }
  }

  // Obtener cuenta bancaria por ID
  async getBankAccountById(accountId: string): Promise<BankAccount> {
    try {
      const response = await apiRequest(`/bank_account/${accountId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error getting bank account by ID:", error);
      throw error;
    }
  }

  // Crear nueva cuenta bancaria
  async createBankAccount(
    accountData: CreateBankAccountRequest
  ): Promise<BankAccount> {
    try {
      const response = await apiRequest("/bank_account", {
        method: "POST",
        body: JSON.stringify(accountData),
      });
      return response;
    } catch (error) {
      console.error("Error creating bank account:", error);
      throw error;
    }
  }

  // Actualizar cuenta bancaria
  async updateBankAccount(
    accountId: string,
    updateData: Partial<BankAccount>
  ): Promise<BankAccount> {
    try {
      const response = await apiRequest(`/bank_account/${accountId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      return response;
    } catch (error) {
      console.error("Error updating bank account:", error);
      throw error;
    }
  }

  // Eliminar cuenta bancaria
  async deleteBankAccount(accountId: string): Promise<void> {
    try {
      await apiRequest(`/bank_account/${accountId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting bank account:", error);
      throw error;
    }
  }

  // Obtener tipos de cuenta bancaria
  async getBankAccountTypes(): Promise<BankAccountType[]> {
    try {
      const response = await apiRequest("/bank-account-types", {
        method: "GET",
      });
      return response.bank_account_types || response;
    } catch (error) {
      console.error("Error getting bank account types:", error);
      throw error;
    }
  }

  // Obtener cuentas bancarias por usuario
  async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
    try {
      const response = await this.getBankAccounts({
        user_id: userId,
        is_active: true,
      });
      return response.bank_accounts;
    } catch (error) {
      console.error("Error getting bank accounts by user ID:", error);
      throw error;
    }
  }

  // Verificar cuenta bancaria
  async verifyBankAccount(accountId: string): Promise<BankAccount> {
    try {
      return await this.updateBankAccount(accountId, {
        is_verified: true,
      });
    } catch (error) {
      console.error("Error verifying bank account:", error);
      throw error;
    }
  }
}

export const bankAccountService = new BankAccountService();
