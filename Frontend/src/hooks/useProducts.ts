import { useState, useEffect, useCallback } from "react";
import {
  productsService,
  ProductQuery,
  ProductsResponse,
} from "../services/productsService";
import { Product } from "src/types/Products";

export function useProducts(initialQuery: ProductQuery = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialQuery.page || 1);
  const [limit, setLimit] = useState(initialQuery.limit || 10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<ProductQuery>(initialQuery);

  const fetchProducts = useCallback(
    async (overrideQuery?: ProductQuery) => {
      setLoading(true);
      setError(null);
      try {
        const q = { ...query, ...overrideQuery };
        const res: ProductsResponse = await productsService.getProducts(q);
        setProducts(res.products);
        setTotal(res.total);
        setPage(res.page);
        setLimit(res.limit);
      } catch (err: any) {
        setError(err.message || "Error al cargar productos");
      } finally {
        setLoading(false);
      }
    },
    [query]
  );

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const goToNextPage = useCallback(() => {
    if (page * limit < total) {
      setQuery(prev => ({ ...prev, page: prev.page ? prev.page + 1 : 2 }));
    }
  }, [page, limit, total]);

  const goToPreviousPage = useCallback(() => {
    if (page > 1) {
      setQuery(prev => ({ ...prev, page: prev.page ? prev.page - 1 : 1 }));
    }
  }, [page]);

  const updateQuery = useCallback((newQuery: Partial<ProductQuery>) => {
    setQuery(prev => {
      const merged = {
        ...prev,
        ...newQuery,
        page: 1,
      };
      // 👇 Evita el loop si el query no cambia realmente
      if (JSON.stringify(prev) === JSON.stringify(merged)) {
        return prev;
      }
      return merged;
    });
  }, []);

  return {
    products,
    total,
    page,
    limit,
    loading,
    error,
    query,
    fetchProducts,
    updateQuery,
    goToNextPage,
    goToPreviousPage,
  };
}
