import { useQuery } from "@tanstack/react-query";
import type { CustomerItem } from "../types/apiTypes";
import { loadItems } from "../api/getData";


export function useCustomers() {
  return useQuery<CustomerItem[], Error>({
    queryKey: ["customers"],
    queryFn: loadItems,
  });
}
