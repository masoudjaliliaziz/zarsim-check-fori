import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsSeen } from "../api/updateData";
import toast from "react-hot-toast";

type SeenColumn =
  | "khajiabadiSeen"
  | "zibaniatiSeen"
  | "zniatiSeen"
  | "tsaniSeen"
  | "habediniSeen"
  | "apazokiSeen"
  | "sakbariSeen"
  | "mmoradabadiSeen"
  | "seen";
export function useNotifSeen() {
  const queryClient = useQueryClient();
  const validSeenColumns: SeenColumn[] = [
    "seen",
    "khajiabadiSeen",
    "zibaniatiSeen",
    "zniatiSeen",
    "tsaniSeen",
    "habediniSeen",
    "apazokiSeen",
    "sakbariSeen",
    "mmoradabadiSeen",
  ];

  return useMutation({
    mutationFn: ({ ID, seenCol }: { ID: number; seenCol: string }) => {
      if (!validSeenColumns.includes(seenCol as SeenColumn)) {
        throw new Error(`فیلد نامعتبر: ${seenCol}`);
      }
      return markAsSeen(ID, seenCol);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.refetchQueries({ queryKey: ["notifications"] });
      toast.success("اعلان با موفقیت به‌عنوان خوانده شده علامت‌گذاری شد");
    },
    onError: (error) => {
      console.error("خطا در علامت‌گذاری اعلان:", error.message, error);
      toast.error(`خطا در علامت‌گذاری اعلان: ${error.message}`);
    },
  });
}
