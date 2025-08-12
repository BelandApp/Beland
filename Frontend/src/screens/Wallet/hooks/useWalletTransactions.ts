import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/AuthContext";
import { transactionService } from "../../../services/transactionService";
import { walletService } from "../../../services/walletService";
import { Transaction as BackendTransaction } from "../../../services/transactionService";
import { Transaction } from "../types";
import { convertBackendTransactionAmount } from "../../../utils/balanceConverter";

// Función para mapear transacciones del backend al formato del frontend
const mapBackendTransactionToFrontend = (
  backendTransaction: BackendTransaction
): Transaction => {
  // Mapear tipo de transacción según el backend
  let type: Transaction["type"] = "exchange";
  if (
    backendTransaction.type?.name ||
    backendTransaction.transaction_type?.name
  ) {
    const typeName = (
      backendTransaction.type?.name ||
      backendTransaction.transaction_type?.name ||
      ""
    ).toLowerCase();
    if (typeName.includes("recarga") || typeName.includes("recharge")) {
      type = "recharge";
    } else if (
      typeName.includes("transferencia") ||
      typeName.includes("transfer")
    ) {
      type = "transfer";
    } else if (typeName.includes("retiro") || typeName.includes("withdraw")) {
      type = "transfer";
    } else if (typeName.includes("recibido") || typeName.includes("receive")) {
      type = "receive";
    } else if (typeName.includes("canje") || typeName.includes("exchange")) {
      type = "exchange";
    }
  }

  // Mapear estado
  let status: Transaction["status"] = "completed";
  if (
    backendTransaction.status?.name ||
    backendTransaction.transaction_state?.name
  ) {
    const stateName = (
      backendTransaction.status?.name ||
      backendTransaction.transaction_state?.name ||
      ""
    ).toLowerCase();
    if (stateName.includes("pendiente") || stateName.includes("pending")) {
      status = "pending";
    } else if (
      stateName.includes("fallido") ||
      stateName.includes("failed") ||
      stateName.includes("error")
    ) {
      status = "failed";
    } else if (
      stateName.includes("completado") ||
      stateName.includes("completed") ||
      stateName.includes("exitoso")
    ) {
      status = "completed";
    }
  }

  // Formatear fecha
  const date = new Date(backendTransaction.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let formattedDate: string;
  if (diffDays === 0) {
    formattedDate = `Hoy, ${date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays === 1) {
    formattedDate = `Ayer, ${date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else if (diffDays < 7) {
    formattedDate = `${diffDays} días atrás`;
  } else {
    formattedDate = date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return {
    id: backendTransaction.id,
    type,
    amount: Math.abs(
      convertBackendTransactionAmount(backendTransaction.amount)
    ), // Usar la utilidad de conversión
    description: getTransactionDescription(type, backendTransaction),
    date: formattedDate,
    status,
    // Campos opcionales según el tipo
    from:
      type === "receive"
        ? backendTransaction.reference ||
          backendTransaction.reference_number ||
          "Usuario"
        : undefined,
    to:
      type === "transfer"
        ? backendTransaction.reference ||
          backendTransaction.reference_number ||
          "Usuario"
        : undefined,
  };
};

// Función helper para generar descripción de transacción
const getTransactionDescription = (
  type: Transaction["type"],
  backendTransaction: BackendTransaction
): string => {
  switch (type) {
    case "recharge":
      return "Recarga de billetera";
    case "transfer":
      return `Transferencia ${
        backendTransaction.amount > 0 ? "recibida" : "enviada"
      }`;
    case "receive":
      return "Pago recibido";
    case "exchange":
      return "Canjeado por premio";
    default:
      return backendTransaction.description || "Transacción";
  }
};

// Mock data para desarrollo y demo (usado como fallback)
const getMockTransactions = (): Transaction[] => [
  {
    id: "1",
    type: "receive",
    amount: 150,
    description: "Recibido de juan.beland",
    date: "Hoy, 14:30",
    status: "completed",
    from: "juan.beland",
  },
  {
    id: "2",
    type: "recharge",
    amount: 500,
    description: "Recarga con tarjeta",
    date: "Ayer, 09:15",
    status: "completed",
  },
  {
    id: "3",
    type: "transfer",
    amount: 200,
    description: "Enviado a maria.beland",
    date: "2 días atrás",
    status: "completed",
    to: "maria.beland",
  },
  {
    id: "4",
    type: "exchange",
    amount: 100,
    description: "Canjeado por premio",
    date: "3 días atrás",
    status: "completed",
  },
  {
    id: "5",
    type: "transfer",
    amount: 50,
    description: "Enviado a carlos.beland",
    date: "1 semana atrás",
    status: "pending",
    to: "carlos.beland",
  },
];

export const useWalletTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    setError(null);

    try {
      // Determinar si usar modo demo o producción
      const isDemoMode = process.env.EXPO_PUBLIC_USE_DEMO_MODE === "true";

      console.log("🔧 useWalletTransactions configuración:");
      console.log("- isDemoMode:", isDemoMode);
      console.log("- user.email:", user.email);

      if (!isDemoMode) {
        try {
          // Modo producción: intentar usar API real

          // Primero obtener la billetera del usuario para tener el wallet_id
          const wallet = await walletService.getWalletByUserId(user.email);

          // Obtener transacciones del backend
          const response = await transactionService.getTransactions({
            wallet_id: wallet.id,
            limit: 20,
            page: 1,
          });

          // Mapear transacciones del backend al formato del frontend
          const mappedTransactions = response.transactions.map(
            mapBackendTransactionToFrontend
          );

          console.log(
            "✅ Transacciones obtenidas del backend:",
            mappedTransactions.length
          );
          setTransactions(mappedTransactions);
        } catch (apiError: any) {
          console.warn("API no disponible, usando modo demo:", apiError);

          // Si hay error de red, usar datos mock como fallback
          setTransactions(getMockTransactions());
        }
      } else {
        // Modo demo: usar datos mock
        console.log("📝 Usando transacciones mock (modo demo)");

        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setTransactions(getMockTransactions());
      }
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Error al cargar transacciones");

      // En caso de error, mostrar datos mock como fallback
      setTransactions(getMockTransactions());
    } finally {
      setIsLoading(false);
    }
  };

  const refetchTransactions = () => {
    fetchTransactions();
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.email]);

  return {
    transactions,
    isLoading,
    error,
    refetch: refetchTransactions,
  };
};
