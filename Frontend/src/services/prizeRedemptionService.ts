import { apiRequest } from "./api";

// Tipos para Canjes de Premios según el backend
export interface PrizeRedemption {
  id: string;
  user_id: string;
  prize_id: string;
  becoins_spent: number;
  redemption_date: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED";
  tracking_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  prize?: Prize;
  user?: any;
}

export interface Prize {
  id: string;
  name: string;
  description?: string;
  becoins_cost: number;
  stock_quantity: number;
  image_url?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePrizeRedemptionRequest {
  user_id: string;
  prize_id: string;
  becoins_spent: number;
  notes?: string;
}

export interface PrizeRedemptionFilters {
  user_id?: string;
  prize_id?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

class PrizeRedemptionService {
  // Listar canjes de premios con filtros
  async getPrizeRedemptions(
    filters: PrizeRedemptionFilters = {}
  ): Promise<{ prize_redemptions: PrizeRedemption[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiRequest(
        `/prize-redemptions?${queryParams.toString()}`,
        {
          method: "GET",
        }
      );
      return response;
    } catch (error) {
      console.error("Error getting prize redemptions:", error);
      throw error;
    }
  }

  // Obtener canje de premio por ID
  async getPrizeRedemptionById(redemptionId: string): Promise<PrizeRedemption> {
    try {
      const response = await apiRequest(`/prize-redemptions/${redemptionId}`, {
        method: "GET",
      });
      return response;
    } catch (error) {
      console.error("Error getting prize redemption by ID:", error);
      throw error;
    }
  }

  // Crear nuevo canje de premio
  async createPrizeRedemption(
    redemptionData: CreatePrizeRedemptionRequest
  ): Promise<PrizeRedemption> {
    try {
      const response = await apiRequest("/prize-redemptions", {
        method: "POST",
        body: JSON.stringify(redemptionData),
      });
      return response;
    } catch (error) {
      console.error("Error creating prize redemption:", error);
      throw error;
    }
  }

  // Actualizar canje de premio
  async updatePrizeRedemption(
    redemptionId: string,
    updateData: Partial<PrizeRedemption>
  ): Promise<PrizeRedemption> {
    try {
      const response = await apiRequest(`/prize-redemptions/${redemptionId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });
      return response;
    } catch (error) {
      console.error("Error updating prize redemption:", error);
      throw error;
    }
  }

  // Eliminar canje de premio
  async deletePrizeRedemption(redemptionId: string): Promise<void> {
    try {
      await apiRequest(`/prize-redemptions/${redemptionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting prize redemption:", error);
      throw error;
    }
  }

  // Obtener canjes por usuario
  async getPrizeRedemptionsByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ prize_redemptions: PrizeRedemption[]; total: number }> {
    try {
      return await this.getPrizeRedemptions({
        user_id: userId,
        page,
        limit,
      });
    } catch (error) {
      console.error("Error getting prize redemptions by user ID:", error);
      throw error;
    }
  }

  // Obtener premios disponibles
  async getAvailablePrizes(): Promise<Prize[]> {
    try {
      const response = await apiRequest("/prizes?is_active=true", {
        method: "GET",
      });
      return response.prizes || response;
    } catch (error) {
      console.error("Error getting available prizes:", error);
      throw error;
    }
  }

  // Canjear premio (función helper)
  async redeemPrize(
    userId: string,
    prizeId: string,
    becoinsSpent: number,
    notes?: string
  ): Promise<PrizeRedemption> {
    try {
      return await this.createPrizeRedemption({
        user_id: userId,
        prize_id: prizeId,
        becoins_spent: becoinsSpent,
        notes,
      });
    } catch (error) {
      console.error("Error redeeming prize:", error);
      throw error;
    }
  }
}

export const prizeRedemptionService = new PrizeRedemptionService();
