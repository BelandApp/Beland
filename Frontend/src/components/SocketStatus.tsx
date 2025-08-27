import React from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useAuth } from "src/hooks/AuthContext";

const SocketStatus = () => {
  const { socketData } = useAuth();
  const [visible, setVisible] = React.useState(false);
  const [localData, setLocalData] = React.useState(socketData);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(-60)).current;
  const [progress, setProgress] = React.useState(0);
  const duration = 4000;

  React.useEffect(() => {
    if (socketData) {
      setLocalData(socketData);
      setVisible(true);
      setProgress(0);
      // Animación de entrada
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
      ]).start();

      // Barra de progreso
      let start = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        setProgress(Math.min(elapsed / duration, 1));
      }, 40);

      // Ocultar y animación de salida
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
          Animated.timing(slideAnim, {
            toValue: -60,
            duration: 350,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ]).start(() => {
          setVisible(false);
        });
        clearInterval(interval);
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [socketData]);

  if (!localData || !visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.iconWrap}>
        <Text style={localData.success ? styles.iconSuccess : styles.iconError}>
          {localData.success ? "✔" : "✖"}
        </Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>{localData.message}</Text>
        <Text style={styles.amount}>Monto: {localData.amount}</Text>
      </View>
      <View style={styles.progressBarWrap}>
        <View style={styles.progressBarBg}>
          <Animated.View
            style={[styles.progressBarFg, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  progressBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 6,
    paddingHorizontal: 0,
  },
  progressBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "#e0e0e0",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },
  progressBarFg: {
    height: 6,
    backgroundColor: "#43b86a",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  toast: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "#43b86a",
    zIndex: 9999,
  },
  iconWrap: {
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e8f5e9",
    borderWidth: 1,
    borderColor: "#43b86a",
  },
  iconSuccess: {
    fontSize: 24,
    color: "#43b86a",
    fontWeight: "bold",
  },
  iconError: {
    fontSize: 24,
    color: "#d32f2f",
    fontWeight: "bold",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#222",
    marginBottom: 2,
  },
  message: {
    fontSize: 16,
    color: "#388e3c",
    marginBottom: 4,
  },
  amount: {
    fontSize: 15,
    color: "#007AFF",
    marginBottom: 4,
  },
  success: {
    fontSize: 15,
    color: "#43b86a",
  },
});

export default SocketStatus;
