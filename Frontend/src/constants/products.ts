/**
 * Constantes para productos circulares disponibles
 */

export interface AvailableProduct {
  id: string;
  name: string;
  basePrice: number;
  category: string;
  image: string;
}

export const AVAILABLE_PRODUCTS: AvailableProduct[] = [
  {
    id: "1",
    name: "Red Label (750ml)",
    basePrice: 26.5,
    category: "Bebidas",
    image:
      "https://images.unsplash.com/photo-1534221905680-192a9a88ac81?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Whisky
  },
  {
    id: "2",
    name: "Gin W (750ml)",
    basePrice: 17.0,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400", // Gin
  },
  {
    id: "3",
    name: "Antioqueño (750ml)",
    basePrice: 18.5,
    category: "Bebidas",
    image: "https://http2.mlstatic.com/D_878369-MLA86801869755_062025-C.jpg", // Aguardiente
  },
  {
    id: "4",
    name: "Antioqueño (350ml)",
    basePrice: 12.0,
    category: "Bebidas",
    image: "https://http2.mlstatic.com/D_878369-MLA86801869755_062025-C.jpg", // Aguardiente pequeño
  },
  {
    id: "5",
    name: "Abuelo (750ml)",
    basePrice: 15.0,
    category: "Bebidas",
    image:
      "https://maxiconsumo.com/media/catalog/product/cache/dee42de555cd0e5c071d2951391ded3b/2/0/2011.jpg", // Ron
  },
  {
    id: "6",
    name: "Jagger (750ml)",
    basePrice: 30.0,
    category: "Bebidas",
    image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400", // Licor herbal
  },
  {
    id: "7",
    name: "Club Platinum (330ml)",
    basePrice: 1.6,
    category: "Bebidas",
    image:
      "https://www.supermaxi.com/wp-content/uploads/2024/08/9497004256-1.jpg", // Cerveza premium
  },
  {
    id: "8",
    name: "Corona (270ml)",
    basePrice: 1.5,
    category: "Bebidas",
    image:
      "https://static.wixstatic.com/media/bdcc5c_73a9e91379fc4583b66f467d204af73b~mv2.png/v1/fill/w_980,h_980,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/bdcc5c_73a9e91379fc4583b66f467d204af73b~mv2.png", // Corona beer
  },
  {
    id: "9",
    name: "Pilsener (270ml)",
    basePrice: 1.25,
    category: "Bebidas",
    image:
      "https://walmartsv.vtexassets.com/arquivos/ids/384706/Cerveza-Pilsener-Lata-473Ml-2-3635.jpg?v=638416642330430000", // Pilsener beer
  },
  {
    id: "10",
    name: "Red Bull (270ml)",
    basePrice: 3.0,
    category: "Bebidas",
    image:
      "https://images.unsplash.com/photo-1561580425-68f0b7cfc4ca?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Red Bull energy drink
  },
];

export const PRODUCT_CATEGORIES = {
  BEBIDAS: "Bebidas",
} as const;
