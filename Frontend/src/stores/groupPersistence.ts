// Persistencia multiplataforma para el store de creación de grupos
// Inspirado en useBeCoinsStore

let AsyncStorage: any = undefined;
if (typeof navigator !== "undefined" && navigator.product === "ReactNative") {
  try {
    AsyncStorage = require("@react-native-async-storage/async-storage").default;
  } catch {}
}

const STORAGE_KEY = "create-group-store";

function isWeb() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

// Solo guardar propiedades serializables (sin funciones)
const serializableKeys = [
  "groupName",
  "description",
  "location",
  "deliveryTime",
  "participants",
  "products",
  "isCreatingGroup",
  "consumo",
];

export function saveGroupState(state: any) {
  const serializableState: any = {};
  for (const key of serializableKeys) {
    serializableState[key] = state[key];
  }
  const data = JSON.stringify(serializableState);
  console.log(
    "[Persistencia] Guardando estado del grupo (solo datos):",
    serializableState
  );
  if (isWeb()) {
    window.localStorage.setItem(STORAGE_KEY, data);
    console.log("[Persistencia] Guardado en localStorage:", data);
  } else if (AsyncStorage) {
    AsyncStorage.setItem(STORAGE_KEY, data);
    console.log("[Persistencia] Guardado en AsyncStorage:", data);
  }
}

export async function loadGroupState() {
  try {
    if (isWeb()) {
      const data = window.localStorage.getItem(STORAGE_KEY);
      console.log(
        "[Persistencia] Cargando estado del grupo desde localStorage:",
        data
      );
      return data ? JSON.parse(data) : null;
    } else if (AsyncStorage) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      console.log(
        "[Persistencia] Cargando estado del grupo desde AsyncStorage:",
        data
      );
      return data ? JSON.parse(data) : null;
    }
    return null;
  } catch (e) {
    console.log("[Persistencia] Error al cargar estado del grupo:", e);
    return null;
  }
}
