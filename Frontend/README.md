# 🌱 Beland

**Aplicación móvil de reciclaje inteligente con incentivos BeCoins**

Beland Native es una aplicación React Native que fomenta el reciclaje responsable a través de un sistema de recompensas gamificado. Los usuarios pueden reciclar botellas en máquinas inteligentes, ganar BeCoins y canjearlos por productos sustentables.

---

## 📱 Características Principales

### ✅ **Sistema de Reciclaje Inteligente**

- 🔍 **Escáner QR** para máquinas de reciclaje
- 📊 **Tracking de botellas** recicladas en tiempo real
- 🌳 **Impacto ambiental** visualizado (árboles salvados)
- 🎯 **Ubicación de máquinas** con MapSelector integrado

### ✅ **Sistema BeCoins**

- 💰 **Wallet digital** con balance en tiempo real
- 🎁 **Marketplace de recompensas** sustentables
- 📈 **Historial de transacciones** y actividades
- 🏆 **Sistema de logros** y niveles

### ✅ **Creación de Grupos**

- 👥 **Grupos colaborativos** para reciclaje en equipo
- 📍 **Selección automática de ubicación** con mapa interactivo
- ⏰ **Programación de entregas** flexible
- 🎯 **Metas grupales** y seguimiento de progreso

### ✅ **Experiencia de Usuario Premium**

- 🎨 **Diseño modular** con componentes reutilizables
- 📱 **Interfaz nativa** optimizada para móviles
- 🔄 **Navegación fluida** con haptic feedback
- 🌙 **Modo oscuro** y personalización

---

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico**

```
Frontend:     React Native + Expo SDK 51
Language:     TypeScript (100% tipado)
Navigation:   Expo Router (file-based routing)
State:        Zustand (estado global)
Maps:         OpenStreetMap + Leaflet.js + Nominatim API
Camera:       expo-camera (escáner QR)
Location:     expo-location (GPS + geocoding)
WebView:      react-native-webview (mapa integrado)
Styling:      StyleSheet nativo (modular)
```

### **Arquitectura Modular**

```
src/
├── components/           # Componentes reutilizables
│   ├── icons/           # Iconos SVG personalizados
│   ├── layout/          # Layouts y estructuras
│   ├── ui/              # Componentes de interfaz
│   └── MapSelector.tsx  # Selector de ubicación con mapa
├── screens/             # Pantallas principales
│   ├── CreateGroup/     # Creación de grupos (modular)
│   │   ├── components/  # Componentes específicos
│   │   ├── hooks/       # Hooks personalizados
│   │   └── styles/      # Estilos modulares
│   └── DashboardScreen.tsx
├── utils/               # Utilidades y servicios
│   └── locationUtils.ts # Servicios de ubicación
└── styles/
    └── colors.ts        # Paleta de colores centralizada
```

---

## 🗺️ **MapSelector**: Innovación en Selección de Ubicación

### **Problema Resuelto**

Tradicionalmente, seleccionar ubicaciones en apps móviles requiere:

- Abrir aplicaciones externas (Google Maps)
- Copiar y pegar direcciones manualmente
- Cambiar entre múltiples apps

### **Nuestra Solución: MapSelector Automático**

```typescript
// Selección automática con un solo toque
<MapSelector
  visible={showMapSelector}
  onLocationSelect={(address, coords) => {
    // Dirección y coordenadas automáticamente
    setSelectedLocation(address);
  }}
  onClose={() => setShowMapSelector(false)}
/>
```

### **Funcionalidades**

- 🗺️ **Mapa embebido** usando OpenStreetMap (sin API keys)
- 👆 **Un toque = ubicación lista** con geocodificación automática
- 📍 **Marcador visual** en tiempo real
- 🔄 **Nominatim API** para direcciones precisas
- 📱 **WebView nativo** sin dependencias externas

### **Flujo de Usuario**

1. **Toque en "🎯 Seleccionar en Mapa"**
2. **Se abre mapa interactivo integrado**
3. **Toque en cualquier punto del mapa**
4. **Marcador se coloca automáticamente**
5. **Dirección se obtiene vía geocodificación**
6. **"Confirmar Ubicación" completa el proceso**

---

## 🎯 Funcionalidades Implementadas

### **✅ Dashboard Principal**

- 📊 Balance de BeCoins en tiempo real
- 🍾 Contador de botellas recicladas
- 🌳 Impacto ambiental (árboles salvados)
- 🎁 Acceso rápido a recompensas
- 📋 Historial de actividades recientes

### **✅ Navegación Unificada**

- 🏠 **Inicio** - Dashboard principal
- 📱 **Escanear** - QR scanner para máquinas
- 🏪 **Tienda** - Marketplace de recompensas
- 👥 **Grupos** - Creación y gestión de equipos
- 🗺️ **Mapa** - Ubicaciones de máquinas
- 👤 **Perfil** - Configuración personal

### **✅ Creación de Grupos Avanzada**

- 📝 **Formulario modular** con validación TypeScript
- 📍 **3 métodos de ubicación**:

# 🌱 Beland Frontend

**Aplicación móvil de reciclaje inteligente con incentivos BeCoins**

Beland Native es una app React Native que promueve el reciclaje responsable mediante recompensas gamificadas. Los usuarios reciclan botellas en máquinas inteligentes, ganan BeCoins y los canjean por productos sustentables.

---

## 📱 Características Principales

- Escáner QR para máquinas de reciclaje
- Tracking de botellas recicladas en tiempo real
- Visualización de impacto ambiental (árboles salvados)
- Ubicación de máquinas con MapSelector integrado
- Wallet digital con balance en tiempo real
- Marketplace de recompensas
- Historial de transacciones y actividades
- Sistema de logros y niveles
- Creación de grupos colaborativos
- Selección automática de ubicación con mapa interactivo
- Programación de entregas flexible
- Metas grupales y seguimiento de progreso
- Modo oscuro y personalización

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend:** React Native + Expo SDK 51
- **Lenguaje:** TypeScript (100% tipado)
- **Navegación:** Expo Router (file-based routing)
- **Estado global:** Zustand
- **Mapas:** OpenStreetMap + Leaflet.js + Nominatim API
- **Cámara:** expo-camera
- **Ubicación:** expo-location
- **WebView:** react-native-webview
- **Estilos:** StyleSheet nativo modular

### Estructura de Carpetas

```
Node.js >= 18.0.0
npm >= 9.0.0
Expo CLI >= 6.0.0
Git >= 2.30.0
```

### **Instalación Rápida**

````bash
# Clonar el repositorio
git clone https://github.com/GabrieLZ19/Beland.git
cd Beland

# Instalar dependencias
npm install

# Iniciar en modo desarrollo

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI >= 6.0.0
- Git >= 2.30.0

### Instalación Rápida

```bash
# Clonar el repositorio
npm start
````

# Instalar dependencias

# Iniciar en modo desarrollo

### **Dependencias Principales**

````

### Scripts Disponibles

```bash
npm start          # Desarrollo con Expo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
npm run build      # Build para producción
````

---

## 🗺️ MapSelector: Selección de Ubicación Innovadora

- Mapa embebido usando OpenStreetMap (sin API keys)
- Selección automática con un toque
- Geocodificación vía Nominatim API
- Marcador visual en tiempo real
- WebView nativo sin dependencias externas

### Ejemplo de uso

```tsx
<MapSelector
  visible={showMapSelector}
  onLocationSelect={(address, coords) => setSelectedLocation(address)}
  onClose={() => setShowMapSelector(false)}
/>
```

---

## 🎯 Funcionalidades Implementadas

- Dashboard con balance de BeCoins y estadísticas
- Contador de botellas recicladas
- Impacto ambiental (árboles salvados)
- Acceso rápido a recompensas
- Historial de actividades
- Navegación unificada por tabs
- Creación de grupos avanzada con validación
- Sistema de ubicación completo (GPS, MapSelector, apps externas)
- Wallet digital con autenticación facial simulada
- Sistema de logros y niveles

---

## 📄 Roadmap de Desarrollo

### En Desarrollo

- [ ] Integración con backend real
- [ ] Sistema de notificaciones push
- [ ] Modo offline con sincronización
- [ ] Análisis avanzado de datos

### Próximas Versiones

- [ ] Sistema de referidos
- [ ] Integración con redes sociales
- [ ] Gamificación avanzada
- [ ] AR para ubicación de máquinas

### Metas a Largo Plazo

- [ ] Expansión regional
- [ ] Partnerships con marcas
- [ ] Impacto medible CO2
- [ ] Marketplace P2P

---

## 🤝 Contribución

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Estándares de Código

- TypeScript estricto
- Componentes modulares y reutilizables
- Hooks personalizados
- Estilos organizados
- Nomenclatura descriptiva

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## 👤 Equipo

**Gabriel Lazo** - _Full Stack Developer_
📧 Email: gabriellazo48@gmail.com
🔗 GitHub: [@GabrieLZ19](https://github.com/GabrieLZ19)

---

## 🙏 Agradecimientos

- Expo Team
- OpenStreetMap
- Nominatim
- React Native Community

---

## 📞 Soporte

- Documentación: Wiki del proyecto
- Reportar bugs: Issues en GitHub
- Comunidad: Discord de Beland
- Contacto directo: support@beland.com

---

**🌱 Juntos hacia un futuro más sustentable con Beland** 🌱

```json
{
  "expo": "~51.0.28",
  "react-native": "0.74.5",
  "expo-router": "~3.5.23",
  "zustand": "^4.5.5",
  "expo-location": "~17.0.1",
  "expo-camera": "~15.0.16",
  "react-native-webview": "13.15.0",
  "expo-haptics": "~13.0.1"
}
```

### **Scripts Disponibles**

```bash
npm start          # Desarrollo con Expo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
npm run build      # Build para producción
```

---

## 📱 Capturas de Pantalla

### **Dashboard Principal**

- Balance BeCoins y estadísticas
- Contador de impacto ambiental
- Acceso rápido a funciones principales

### **MapSelector en Acción**

- Mapa interactivo embebido
- Selección con un toque
- Geocodificación automática

### **Creación de Grupos**

- Formulario modular optimizado
- Selección de ubicación avanzada
- Programación de entregas

---

## 🔧 Configuración Avanzada

### **Variables de Entorno** (Futuro)

```env
# Google Places API (opcional)
GOOGLE_PLACES_API_KEY=tu_api_key

# Backend API
API_BASE_URL=https://api.beland.com

# Analytics
ANALYTICS_KEY=tu_analytics_key
```

### **Configuración de Maps**

```typescript
// src/components/MapSelector.tsx
const mapConfig = {
  provider: "OpenStreetMap", // Sin API keys
  geocoding: "Nominatim", // Gratuito
  initialZoom: 13,
  center: [-34.6118, -58.396], // Buenos Aires
};
```

---

## 📋 Roadmap de Desarrollo

### **🔄 En Desarrollo**

- [ ] Integración con backend real
- [ ] Sistema de notificaciones push
- [ ] Modo offline con sincronización
- [ ] Análisis avanzado de datos

### **📅 Próximas Versiones**

- [ ] Sistema de referidos
- [ ] Integración con redes sociales
- [ ] Gamificación avanzada
- [ ] AR para ubicación de máquinas

### **🎯 Metas a Largo Plazo**

- [ ] Expansión regional
- [ ] Partnerships con marcas
- [ ] Impacto medible CO2
- [ ] Marketplace P2P

---

## 🤝 Contribución

### **¿Cómo Contribuir?**

1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### **Estándares de Código**

- ✅ TypeScript estricto (100% tipado)
- ✅ Componentes modulares y reutilizables
- ✅ Hooks personalizados para lógica
- ✅ Estilos modulares y organizados
- ✅ Nomenclatura descriptiva y consistente

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## � Equipo

**Gabriel Lazo** - _Full Stack Developer_  
📧 Email: [gabriellazo48@gmail.com]  
🔗 GitHub: [@GabrieLZ19](https://github.com/GabrieLZ19)

---

## 🙏 Agradecimientos

- **Expo Team** - Por el excelente SDK y tooling
- **OpenStreetMap** - Por los mapas gratuitos y abiertos
- **Nominatim** - Por la geocodificación sin API keys
- **React Native Community** - Por los componentes y librerías

---

## 📞 Soporte

¿Necesitas ayuda?

- 📖 **Documentación**: [Wiki del proyecto]
- 🐛 **Reportar bugs**: [Issues en GitHub]
- 💬 **Comunidad**: [Discord de Beland]
- 📧 **Contacto directo**: support@beland.com

---

**🌱 Juntos hacia un futuro más sustentable con Beland ** 🌱

- 💳 **Wallet** - Billetera digital con autenticación facial
- 🎁 **Premios** - Catálogo de recompensas (próximamente)
- 📊 **Historial** - Historial de actividades (próximamente)
- 👤 **Perfil** - Configuración del usuario (próximamente)

### ✅ Funcionalidades Nativas

#### Escáner QR

- Acceso completo a la cámara del dispositivo
- Detección de códigos QR y PDF417
- Interfaz intuitiva con marco de escaneo
- Manejo de permisos de cámara
- Alertas para procesar códigos detectados

#### Wallet con Biometría

- Autenticación facial simulada
- Balance de BeCoins en tiempo real
- Estadísticas de reciclaje y ahorro de CO₂
- Sistema de niveles (Eco Warrior)
- Funciones de enviar/recibir BeCoins

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── icons/           # Íconos SVG personalizados
│   │   ├── BottleIcon.tsx
│   │   ├── TreesIcon.tsx
│   │   ├── HomeIcon.tsx
│   │   ├── QRIcon.tsx
│   │   ├── WalletIcon.tsx
│   │   ├── HistoryIcon.tsx
│   │   ├── ProfileIcon.tsx
│   │   ├── GiftIcon.tsx
│   │   └── index.ts
│   ├── layout/
│   │   └── MainTabNavigator.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Card.tsx
├── screens/
│   ├── DashboardScreen.tsx
│   ├── QRScannerScreen.tsx
│   └── WalletScreen.tsx
└── styles/
    └── colors.ts
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 16+
- Expo CLI
- React Native development environment

### Comandos de desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo web
npm run web

# Desarrollo móvil
npm run android  # Android
npm run ios      # iOS

# Iniciar servidor de desarrollo
npm start
```

## 📱 Funcionalidades Nativas Implementadas

### 1. **Cámara QR** (`expo-camera`)

- Escaneo de códigos QR de máquinas de reciclaje
- Detección automática de códigos
- Manejo de permisos
- Interfaz de usuario nativa

### 2. **Autenticación Facial** (Preparado para `expo-face-detector`)

- Simulación de autenticación biométrica
- Acceso seguro al wallet
- Interface preparada para implementación real

### 3. **Almacenamiento Seguro** (Preparado para `expo-secure-store`)

- Estructura lista para guardar datos sensibles
- Tokens de autenticación
- Configuraciones del usuario

## 🎨 Sistema de Diseño

### Colores

```tsx
export const colors = {
  belandOrange: "#F88D2A", // Color principal
  belandGreen: "#6BA43A", // Verde secundario
  belandGreenLight: "#A9D195", // Verde claro
  background: "#FFFFFF", // Fondo
  textPrimary: "#1F2937", // Texto principal
  textSecondary: "#6B7280", // Texto secundario
  blue50: "#EFF6FF", // Azul claro
  blue200: "#BFDBFE", // Azul medio
  blue700: "#1D4ED8", // Azul oscuro
};
```

### Componentes UI

- **Button**: 3 variantes (primary, secondary, link)
- **Card**: Componente base para tarjetas
- **SafeAreaView**: Manejo de áreas seguras en dispositivos

## 🔄 Próximos Pasos de Migración

### Fase 2: Funcionalidades Avanzadas

- [ ] Implementar detección facial real con `expo-face-detector`
- [ ] Integrar notificaciones push (`expo-notifications`)
- [ ] Implementar geolocalización (`expo-location`)
- [ ] Agregar almacenamiento seguro real

### Fase 3: Pantallas Restantes

- [ ] Pantalla de Premios/Recompensas
- [ ] Pantalla de Historial completa
- [ ] Pantalla de Perfil de usuario
- [ ] Pantalla de configuraciones

### Fase 4: Integración Backend

- [ ] API para procesamiento de QR
- [ ] Sistema de autenticación completo
- [ ] Sincronización de datos
- [ ] Sistema de notificaciones

## 📚 Tecnologías Utilizadas

- **React Native**: Framework principal
- **Expo**: Plataforma de desarrollo
- **React Navigation**: Navegación entre pantallas
- **React Native SVG**: Íconos personalizados
- **TypeScript**: Tipado estático
- **Expo Camera**: Funcionalidad de cámara
- **Expo Face Detector**: Reconocimiento facial (preparado)

## 🐛 Debugging y Testing

### Comandos útiles

```bash
# Limpiar caché
expo start -c

# Logs detallados
expo start --verbose

---

**🌱 Juntos hacia un futuro más sustentable con Beland Native** 🌱
```
