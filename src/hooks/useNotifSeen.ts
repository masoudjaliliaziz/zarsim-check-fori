import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsSeen } from "../api/updateData";
import toast from "react-hot-toast";

export function useNotifSeen() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ID }: { ID: number }) => markAsSeen(ID),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => toast.error("خطا در استعلام ثبت چک صیاد"),
  });
}
