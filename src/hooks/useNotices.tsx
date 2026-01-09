import { useQuery } from "@tanstack/react-query";
import { api, Notice } from "@/lib/api";

export type { Notice };

export const useNotices = () => {
  return useQuery({
    queryKey: ["notices"],
    queryFn: async () => {
      const { notices } = await api.public.notices();
      return notices;
    },
  });
};
