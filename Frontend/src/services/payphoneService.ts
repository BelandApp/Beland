// Servicio para obtener la URL de pago de Payphone desde el backend

export interface PayphonePaymentParams {
  token: string;
  storeId: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  service: number;
  tip: number;
  reference: string;
  currency: string;
  clientTransactionId: string;
  phone: string;
}

export async function createPayphonePayment(
  params: PayphonePaymentParams
): Promise<string> {
  // Cambia esta URL por la de tu backend
  const backendUrl = "http://localhost:8081/api/payphone";
  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    const data = await response.json();
    // El backend debe devolver { url: "..." }
    return data.url || ""; // El backend debe devolver { url: "http://localhost:8081/payphone-success" }
  } catch (error) {
    console.error("Error obteniendo URL de pago desde backend:", error);
    return "";
  }
}
