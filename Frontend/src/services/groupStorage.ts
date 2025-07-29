import { Group } from "../types";

type StorageListener = () => void;

let AsyncStorage: any = undefined;
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch {}
}

const STORAGE_KEY = "groups-storage";

function isWeb() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

class GroupStorageService {
  private groups: Group[] = [];
  private listeners: StorageListener[] = [];

  // Método para suscribirse a cambios
  subscribe(listener: StorageListener): () => void {
    this.listeners.push(listener);
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notificar a todos los listeners cuando hay cambios
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  async persistGroups() {
    const data = JSON.stringify(this.groups);
    if (isWeb()) {
      window.localStorage.setItem(STORAGE_KEY, data);
    } else if (AsyncStorage) {
      await AsyncStorage.setItem(STORAGE_KEY, data);
    }
  }

  async hydrateGroups() {
    let data = null;
    if (isWeb()) {
      data = window.localStorage.getItem(STORAGE_KEY);
    } else if (AsyncStorage) {
      data = await AsyncStorage.getItem(STORAGE_KEY);
    }
    if (data) {
      try {
        this.groups = JSON.parse(data);
      } catch {}
    }
    this.notifyListeners();
  }

  async addGroup(group: Group) {
    this.groups.push(group);
    await this.persistGroups();
    this.notifyListeners();
  }

  getAllGroups(): Group[] {
    return [...this.groups];
  }

  getGroupById(id: string): Group | undefined {
    return this.groups.find((group) => group.id === id);
  }

  async updateGroup(id: string, updates: Partial<Group>): Promise<boolean> {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups[index] = { ...this.groups[index], ...updates };
      await this.persistGroups();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  async deleteGroup(id: string): Promise<boolean> {
    const index = this.groups.findIndex((group) => group.id === id);
    if (index !== -1) {
      this.groups.splice(index, 1);
      await this.persistGroups();
      this.notifyListeners();
      return true;
    }
    return false;
  }

  getActiveGroups(): Group[] {
    return this.groups.filter(
      (group) => group.status === "active" || group.status === "pending_payment"
    );
  }

  getCompletedGroups(): Group[] {
    return this.groups.filter((group) => group.status === "completed");
  }

  async clear() {
    this.groups = [];
    await this.persistGroups();
    this.notifyListeners();
  }
}

export const groupStorage = new GroupStorageService();
// Hidratar grupos al iniciar la app
if (typeof window !== "undefined" || AsyncStorage) {
  groupStorage.hydrateGroups();
}
