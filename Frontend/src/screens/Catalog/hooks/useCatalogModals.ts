import { useState } from "react";
import { AVAILABLE_PRODUCTS, AvailableProduct } from "../../../data/products";
import { Product } from "../../../services/productsService";

export const useCatalogModals = () => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductAddedModal, setShowProductAddedModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    AvailableProduct | Product | null
  >(null);

  const openDeliveryModal = (product: AvailableProduct | Product) => {
    setSelectedProduct(product);
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedProduct(null);
  };

  const openProductAddedModal = (product: AvailableProduct | Product) => {
    setSelectedProduct(product);
    setShowProductAddedModal(true);
  };

  const closeProductAddedModal = () => {
    setShowProductAddedModal(false);
    setSelectedProduct(null);
  };

  return {
    showDeliveryModal,
    showProductAddedModal,
    selectedProduct,
    openDeliveryModal,
    closeDeliveryModal,
    openProductAddedModal,
    closeProductAddedModal,
  };
};
