// hooks/useDeleteFile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFile } from "../api/filesApi";

export function useDeleteFile(folderPath: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      // بعد از حذف، لیست فایل‌ها رو ریفچ کن
      queryClient.invalidateQueries({ queryKey: ["files", folderPath] });
    },
  });
}
