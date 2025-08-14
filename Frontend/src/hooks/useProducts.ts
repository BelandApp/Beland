import { useState, useEffect, useCallback } from "react";
import {
  productsService,
  Product,
  ProductQuery,
  ProductsResponse,
} from "../services/productsService";

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
  }, [
    query.page,
    query.limit,
    query.sortBy,
    query.order,
    query.category,
    query.name,
  ]);

  return {
    products,
    total,
    page,
    limit,
    loading,
    error,
    setQuery,
    fetchProducts,
  };
}
