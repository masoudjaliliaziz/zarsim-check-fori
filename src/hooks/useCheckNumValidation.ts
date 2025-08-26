import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { Item } from "../types/apiTypes";

export function useCheckNumValidation(checkNum: string, items: Partial<Item>[]) {
  const [checkNumError, setCheckNumError] = useState(false);

  useEffect(() => {
    if (!checkNum) {
      setCheckNumError(false);
      return;
    }

    const exists = items.some((item) => item.checkNum === checkNum);
    if (exists) {
      setCheckNumError(true);
      toast.error("این شماره چک از قبل موجود است!");
    } else {
      setCheckNumError(false);
    }
  }, [checkNum, items]);

  return checkNumError;
}
