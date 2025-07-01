import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { FileUploader } from "./utils/FileUploader";
import type { FileUploaderHandle } from "./utils/FileUploader";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  setAmount,
  setDueDate,
  setModalOpen,
  setSelectedCustomer,
  setParentGUID,
  resetForm,
  setSalesExpertName,
  setSalesExpert_text,
} from "./features/checkForm/checkFormSlice";

import { useCustomers } from "./hooks/useCustomerData";
import { useSubmitCheck } from "./hooks/useSubmitCheck";
import uuidv4 from "./utils/createGuid";

function App() {
  const {
    amount,
    dueDate,
    modalOpen,
    selectedCustomer,
    parent_GUID,
    salesExpertName,
    salesExpert_text,
  } = useSelector((state: RootState) => state.checkForm);
  const dispatch = useDispatch();

  const fileUploaderRef = useRef<FileUploaderHandle>(null);
  const { data: customers = [] } = useCustomers();

  const { mutateAsync: submitCheck } = useSubmitCheck();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(setParentGUID(uuidv4()));
  }, []);

  const formatNumber = (num: number | "") =>
    num === "" ? "" : num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const parseNumber = (str: string): number | "" => {
    const cleaned = str.replace(/,/g, "");
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? "" : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const files = fileUploaderRef.current?.getFiles();

    if (!selectedCustomer) return alert("لطفا مشتری را انتخاب کنید");
    if (amount === "") return alert("لطفا مبلغ را وارد کنید");
    if (!files || files.length === 0)
      return alert("لطفا تصویر چک را آپلود کنید");

    try {
      await fileUploaderRef.current?.uploadFiles();
      if (salesExpertName && salesExpert_text) {
        await submitCheck({
          title: selectedCustomer, // این خط اضافه شده
          amount: String(amount),
          dueDate: String(dueDate?.format("YYYY/MM/DD")),
          status: "0",
          parent_GUID,
          salesExpertName,
          salesExpert_text,
        });
      }

      dispatch(resetForm());
      dispatch(setParentGUID(uuidv4()));
      fileUploaderRef.current?.clearFiles();
    } catch (err) {
      console.error("خطا در ارسال فرم:", err);
    }
  };

  const uniqueTitles = Array.from(
    new Set(
      customers
        .map((i) => i.Title)
        .filter((name): name is string => Boolean(name?.trim()))
    )
  );
  const filteredTitles = uniqueTitles.filter((title) =>
    title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex  justify-center  p-4">
      <form
        className="bg-white rounded-lg  p-6 w-full max-w-4xl space-y-6"
        onSubmit={handleSubmit}
      >
        {/* مشتری */}
        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">نام مشتری</label>
          <input
            readOnly
            value={selectedCustomer}
            onClick={() => dispatch(setModalOpen(true))}
            placeholder="انتخاب مشتری"
            className="border border-gray-300 rounded px-3 py-2 cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {/* مبلغ */}
        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">مبلغ</label>
          <input
            type="text"
            value={formatNumber(amount)}
            onChange={(e) => dispatch(setAmount(parseNumber(e.target.value)))}
            placeholder="مبلغ را وارد کنید"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
        </div>

        {/* آپلود فایل */}
        <div className="flex flex-col w-60">
          <FileUploader
            folderGuid={parent_GUID}
            ref={fileUploaderRef}
            inputId="checkUploader"
            title="تصویر چک"
          />
        </div>

        {/* تاریخ سررسید */}
        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">
            تاریخ سررسید
          </label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={dueDate}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onChange={(val: DateObject | null, _opts) => {
              dispatch(setDueDate(val));
            }}
            inputClass="w-full px-2 py-1 border-2 border-primary rounded-md font-semibold focus:outline-none"
            format="YYYY/MM/DD"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          ارسال
        </button>
      </form>

      {/* مودال مشتری */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[70vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="جستجو..."
                className="border border-gray-300 rounded px-3 py-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                onClick={() => dispatch(setModalOpen(false))}
                className="mr-2 text-red-500 font-bold"
                type="button"
              >
                ×
              </button>
            </div>

            <ul className="max-h-60 overflow-y-auto">
              {filteredTitles.map((title) => (
                <li
                  key={title}
                  className="p-2 cursor-pointer hover:bg-indigo-100 rounded"
                  onClick={() => {
                    dispatch(setSelectedCustomer(title));

                    // پیدا کردن SalesExpertAcunt_text مربوط به این title
                    const customer = customers.find((c) => c.Title === title);
                    const salesExpert_text =
                      customer?.SalesExpertAcunt_text ?? null;
                    const salesExpert = customer?.SalesExpert ?? null;

                    dispatch(setSalesExpertName(salesExpert));
                    dispatch(setSalesExpert_text(salesExpert_text));
                    dispatch(setModalOpen(false));
                  }}
                >
                  {title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
