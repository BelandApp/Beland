import React from "react";
import { Alert, AlertButton } from "react-native";

interface StyledAlertProps {
  title: string;
  message: string;
  buttons?: AlertButton[];
}

export const StyledAlert = {
  // Alert de éxito
  success: (title: string, message: string, onOk?: () => void) => {
    Alert.alert(
      `✅ ${title}`,
      message,
      [
        {
          text: "¡Genial!",
          onPress: onOk,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  },

  // Alert de error
  error: (title: string, message: string, onOk?: () => void) => {
    Alert.alert(
      `❌ ${title}`,
      message,
      [
        {
          text: "Entendido",
          onPress: onOk,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  },

  // Alert de advertencia
  warning: (title: string, message: string, onOk?: () => void) => {
    Alert.alert(
      `⚠️ ${title}`,
      message,
      [
        {
          text: "Entendido",
          onPress: onOk,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  },

  // Alert de confirmación
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    Alert.alert(
      `💭 ${title}`,
      message,
      [
        {
          text: "Cancelar",
          onPress: onCancel,
          style: "cancel",
        },
        {
          text: "Confirmar",
          onPress: onConfirm,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  },

  // Alert de información
  info: (title: string, message: string, onOk?: () => void) => {
    Alert.alert(
      `ℹ️ ${title}`,
      message,
      [
        {
          text: "OK",
          onPress: onOk,
          style: "default",
        },
      ],
      { cancelable: false }
    );
  },
};
