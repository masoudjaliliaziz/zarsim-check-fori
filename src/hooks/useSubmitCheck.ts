import { useMutation } from "@tanstack/react-query";
import { handleAddTestItem } from "../api/addData";

export interface Doc {
  amount: string;
  status: string;
  dueDate: string;
  parent_GUID: string;
  title: string;
}

export const useSubmitCheck = () =>
  useMutation<void, unknown, Doc>({
    mutationFn: async (data: Doc) => {
      await handleAddTestItem(data);
    },
  });
