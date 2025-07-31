import { useState } from "react";
import { AVAILABLE_PRODUCTS } from "../../../data/products";

export const useCatalogModals = () => {
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showProductAddedModal, setShowProductAddedModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    (typeof AVAILABLE_PRODUCTS)[0] | null
  >(null);

  const openDeliveryModal = (product: (typeof AVAILABLE_PRODUCTS)[0]) => {
    setSelectedProduct(product);
    setShowDeliveryModal(true);
  };

  const closeDeliveryModal = () => {
    setShowDeliveryModal(false);
    setSelectedProduct(null);
  };

  const openProductAddedModal = (product: (typeof AVAILABLE_PRODUCTS)[0]) => {
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
