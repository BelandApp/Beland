import React from "react";
import { Platform, View, StyleSheet, Button } from "react-native";

// Solo importamos WebView en mobile
let WebView: any = null;
if (Platform.OS !== "web") {
  WebView = require("react-native-webview").WebView;
}

interface PayphoneBoxProps {
  token: string;
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  service: number;
  tip?: number;
  storeId: string;
  reference: string;
  currency?: string;
  clientTransactionId: string;
  backgroundColor?: string;
  onClose?: () => void;
  // Para mobile
  urlMobile?: string;
}

export const PayphoneWidget: React.FC<PayphoneBoxProps> = ({
  token,
  amount,
  amountWithoutTax,
  amountWithTax,
  tax,
  service,
  tip = 0,
  storeId,
  reference,
  currency = "USD",
  clientTransactionId,
  backgroundColor = "#F88D2A",
  onClose,
  urlMobile,
}) => {
  // WEB: Cajita oficial
  if (Platform.OS === "web") {
    React.useEffect(() => {
      // Cargar CSS y JS solo una vez
      if (!document.getElementById("payphone-box-css")) {
        const link = document.createElement("link");
        link.id = "payphone-box-css";
        link.rel = "stylesheet";
        link.href =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("payphone-box-js")) {
        const script = document.createElement("script");
        script.id = "payphone-box-js";
        script.type = "module";
        script.src =
          "https://cdn.payphonetodoesposible.com/box/v1.1/payphone-payment-box.js";
        document.body.appendChild(script);
      }
    }, []);

    React.useEffect(() => {
      // Renderizar la cajita cuando cambian los props
      if ((window as any).PPaymentButtonBox) {
        const box = new (window as any).PPaymentButtonBox({
          token,
          amount,
          amountWithoutTax,
          amountWithTax,
          tax,
          service,
          tip,
          storeId,
          reference,
          currency,
          clientTransactionId,
          backgroundColor,
        });
        box.render("pp-button");
      }
    }, [
      token,
      amount,
      amountWithoutTax,
      amountWithTax,
      tax,
      service,
      tip,
      storeId,
      reference,
      currency,
      clientTransactionId,
      backgroundColor,
    ]);

    return (
      <div style={{ width: "100%", minHeight: 400 }}>
        <div id="pp-button" />
        {onClose && (
          <button style={{ marginTop: 16 }} onClick={onClose}>
            Cerrar
          </button>
        )}
      </div>
    );
  }

  // Mobile: WebView
  if (WebView && urlMobile) {
    return (
      <View style={styles.webviewContainer}>
        <WebView source={{ uri: urlMobile }} style={{ flex: 1 }} />
        {onClose && <Button title="Cerrar" onPress={onClose} />}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
