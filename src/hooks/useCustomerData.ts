import { useQuery } from "@tanstack/react-query";
import { loadItems } from "../api/getData";
import type { CustomerItem } from "../types/apiTypes";

export const useCustomers = () =>
  useQuery<CustomerItem[]>({
    queryKey: ["customers"],
    queryFn: async () => await loadItems(),
  });
