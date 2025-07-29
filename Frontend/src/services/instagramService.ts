/**
 * Servicio mock para simular la búsqueda de usuarios de Instagram
 * En producción, esto se conectaría a la API real de Instagram
 */

export interface InstagramUser {
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
  follower_count?: number;
}

// Datos mock de usuarios de Instagram
const MOCK_INSTAGRAM_USERS: InstagramUser[] = [
  {
    username: "ana_martinez",
    full_name: "Ana Martínez",
    profile_pic_url: "https://i.pravatar.cc/150?img=1",
    is_verified: false,
    follower_count: 1250,
  },
  {
    username: "carlosg",
    full_name: "Carlos González",
    profile_pic_url: "https://i.pravatar.cc/150?img=2",
    is_verified: false,
    follower_count: 890,
  },
  {
    username: "laura_rod",
    full_name: "Laura Rodríguez",
    profile_pic_url: "https://i.pravatar.cc/150?img=3",
    is_verified: true,
    follower_count: 15600,
  },
  {
    username: "sofia_herrera",
    full_name: "Sofía Herrera",
    profile_pic_url: "https://i.pravatar.cc/150?img=4",
    is_verified: false,
    follower_count: 567,
  },
  {
    username: "diego_m",
    full_name: "Diego Morales",
    profile_pic_url: "https://i.pravatar.cc/150?img=5",
    is_verified: false,
    follower_count: 2340,
  },
  {
    username: "maria_lopez",
    full_name: "María López",
    profile_pic_url: "https://i.pravatar.cc/150?img=6",
    is_verified: false,
    follower_count: 789,
  },
  {
    username: "pedro_diaz",
    full_name: "Pedro Díaz",
    profile_pic_url: "https://i.pravatar.cc/150?img=7",
    is_verified: false,
    follower_count: 1123,
  },
  {
    username: "carmen_v",
    full_name: "Carmen Vega",
    profile_pic_url: "https://i.pravatar.cc/150?img=8",
    is_verified: false,
    follower_count: 445,
  },
  {
    username: "robertos",
    full_name: "Roberto Silva",
    profile_pic_url: "https://i.pravatar.cc/150?img=9",
    is_verified: false,
    follower_count: 3200,
  },
  {
    username: "sofia_torres",
    full_name: "Sofía Torres",
    profile_pic_url: "https://i.pravatar.cc/150?img=10",
    is_verified: true,
    follower_count: 45600,
  },
];

export class InstagramService {
  /**
   * Simula la búsqueda de usuarios de Instagram
   * @param query - Término de búsqueda
   * @returns Promise con usuarios que coinciden
   */
  static async searchUsers(query: string): Promise<InstagramUser[]> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!query.trim()) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().replace(/^@/, "");

    return MOCK_INSTAGRAM_USERS.filter(
      (user) =>
        user.username.toLowerCase().includes(normalizedQuery) ||
        user.full_name.toLowerCase().includes(normalizedQuery)
    ).slice(0, 5); // Limitar a 5 resultados
  }

  /**
   * Obtiene información de un usuario específico
   * @param username - Nombre de usuario (sin @)
   * @returns Promise con la información del usuario o null si no existe
   */
  static async getUserInfo(username: string): Promise<InstagramUser | null> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 200));

    const normalizedUsername = username.replace(/^@/, "").toLowerCase();

    return (
      MOCK_INSTAGRAM_USERS.find(
        (user) => user.username.toLowerCase() === normalizedUsername
      ) || null
    );
  }

  /**
   * Valida si un usuario existe en Instagram
   * @param username - Nombre de usuario (sin @)
   * @returns Promise con true si existe, false si no
   */
  static async validateUsername(username: string): Promise<boolean> {
    const user = await this.getUserInfo(username);
    return user !== null;
  }
}
