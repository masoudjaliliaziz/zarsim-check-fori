import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setParentGUID, resetForm } from "../features/checkForm/checkFormSlice";
import uuidv4 from "../utils/createGuid";
import { useSubmitCheck } from "./useSubmitCheck";
import { addEditHistory } from "../api/historyApi";
import type { FileUploaderHandle } from "../utils/FileUploader";
import type { RootState } from "../../store/store";

export function useCheckForm(
  fileUploaderRef: React.RefObject<FileUploaderHandle | null>
) {
  const dispatch = useDispatch();
  const {
    amount,
    dueDate,
    selectedCustomer,
    parent_GUID,
    salesExpertName,
    salesExpert_text,
    checkNum,
  } = useSelector((state: RootState) => state.checkForm);

  const { mutateAsync: submitCheck } = useSubmitCheck();

  // ست کردن GUID جدید در mount
  useEffect(() => {
    dispatch(setParentGUID(uuidv4()));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent, checkNumError: boolean) => {
    e.preventDefault();

    if (!selectedCustomer) return alert("لطفا مشتری را انتخاب کنید");
    if (amount === "") return alert("لطفا مبلغ را وارد کنید");
    if (checkNumError) {
      return alert("امکان ثبت وجود ندارد، شماره چک تکراری است!");
    }

    try {
      // آپلود فایل
      await fileUploaderRef.current?.uploadFiles();

      if (salesExpertName && salesExpert_text) {
        await submitCheck({
          title: selectedCustomer,
          amount: String(amount),
          checkNum: String(checkNum),
          dueDate: String(dueDate?.format("YYYY/MM/DD")),
          status: "0",
          parent_GUID,
          salesExpertName,
          salesExpert_text,
        });
      }

      // ثبت در تاریخچه
      await addEditHistory(
        0,
        "در انتظار تعیین وضعیت کارشناس",
        "",
        String(salesExpert_text),
        checkNum
      );

      // ریست کردن فرم و ساختن GUID جدید
      dispatch(resetForm());
      dispatch(setParentGUID(uuidv4()));

      // پاک کردن فایل‌های آپلود شده
      fileUploaderRef.current?.clearFiles();
    } catch (err) {
      console.error("خطا در ارسال فرم:", err);
    }
  };

  return { handleSubmit };
}
