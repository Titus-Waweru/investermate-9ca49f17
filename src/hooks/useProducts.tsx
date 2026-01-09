import { useQuery } from "@tanstack/react-query";
import { api, Product } from "@/lib/api";

export type { Product };

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { products } = await api.products.list();
      return products;
    },
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { product } = await api.products.get(productId);
      return product;
    },
    enabled: !!productId,
  });
};
