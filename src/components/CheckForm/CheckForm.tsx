import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import { useCustomers } from "../../hooks/useCustomerData";
import { useQuery } from "@tanstack/react-query";
import { fetchAllItems, getCurrentUser } from "../../api/itemsApi";
import { useUserRoles } from "../../hooks/useUserRoles";
import { FileUploader, type FileUploaderHandle } from "../../utils/FileUploader";
import CustomerSelector from "./CustomerSelector";
import CheckNumberInput from "./CheckNumberInput";
import { useCheckForm } from "../../hooks/useCheckForm";
import { useCheckNumValidation } from "../../hooks/useCheckNumValidation";
import CustomerModal from "../Modal/CustomerModal";

export default function CheckForm() {
  const { modalOpen, checkNum } = useSelector(
    (state: RootState) => state.checkForm
  );
  const fileUploaderRef = useRef<FileUploaderHandle>(null);

  const { data: customers = [] } = useCustomers();
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: fetchAllItems,
    refetchInterval: 5000,
  });

  const checkNumError = useCheckNumValidation(checkNum, items);
  const { handleSubmit } = useCheckForm(fileUploaderRef);

  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUsername)
      .catch((err) => console.error("خطا در دریافت کاربر فعلی:", err));
  }, []);

  const { isMaster } = useUserRoles(currentUsername);

  return (
    <div className="h-full flex justify-center p-4 overflow-auto relative">
      <form
        className="bg-white rounded-lg p-6 w-full max-w-4xl space-y-6 overflow-auto"
        onSubmit={(e) => handleSubmit(e, checkNumError)}
      >
        <CustomerSelector isMaster={isMaster} />
        <CheckNumberInput isMaster={isMaster} checkNumError={checkNumError} />

        <div className="flex flex-col w-60">
          <FileUploader
            folderGuid=""
            ref={fileUploaderRef}
            inputId="checkUploader"
            title="تصویر چک"
          />
        </div>

        {!isMaster ? (
          <p className="text-red-500 font-bold text-md">
            شما مجاز به ثبت چک نیستید
          </p>
        ) : (
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
          >
            ارسال
          </button>
        )}
      </form>

      {modalOpen && <CustomerModal customers={customers} />}
    </div>
  );
}
