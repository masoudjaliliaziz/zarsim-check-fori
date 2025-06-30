import { useEffect, useState, useRef } from "react";
import { loadItems } from "./api/getData";
import { FileUploader } from "./utils/FileUploader";
import type { FileUploaderHandle } from "./utils/FileUploader";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { handleAddTestItem } from "./api/addData";
import uuidv4 from "./utils/createGuid";
interface Customer {
  Title: string;
}

function App() {
  const [item, setItem] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [dueDate, setDueDate] = useState<DateObject | null>();
  const [amount, setAmount] = useState<number | "">("");
  const [status, setStatus] = useState<"تامین وجه" | "عودت چک">("تامین وجه");
  const [parent_GUID, setParent_GUID] = useState("");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const fileUploaderRef = useRef<FileUploaderHandle>(null);
  useEffect(() => {
    setParent_GUID(uuidv4());
  }, []);
  useEffect(() => {
    async function customerInfo() {
      const customers = await loadItems();
      setItem(customers as Customer[]);
      console.log(status);
      console.log(date);
    }
    customerInfo();
  }, []);

  const uniqueTitles = Array.from(
    new Set(
      item
        .map((i) => i.Title)
        .filter((title) =>
          title.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter((title) => title !== "")
    )
  );

  const formatNumber = (num: number | "") => {
    if (num === "") return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseNumber = (str: string) => {
    const cleaned = str.replace(/,/g, "");
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? "" : parsed;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const files = fileUploaderRef.current?.getFiles();

    if (!selectedCustomer) {
      alert("لطفا مشتری را انتخاب کنید");
      return;
    }
    if (amount === "") {
      alert("لطفا مبلغ را وارد کنید");
      return;
    }
    if (!files || files.length === 0) {
      alert("لطفا یک یا چند تصویر چک را آپلود کنید");
      return;
    }

    try {
      await fileUploaderRef.current?.uploadFiles();

      const data = {
        amount: String(amount),
        dueDate: String(dueDate) ? String(dueDate?.format("YYYY/MM/DD")) : "",
        status: "0",
        parent_GUID,
      };
      console.log(data);

      await handleAddTestItem(data);

      // بعد از ارسال، فرم رو ریست کن
      setSelectedCustomer("");
      setAmount("");
      setStatus("تامین وجه");
      setDate(new Date().toISOString().slice(0, 10));
      fileUploaderRef.current?.clearFiles();
    } catch (error) {
      console.error("خطا در ارسال فرم:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-700 p-4">
      <form
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl space-y-6"
        onSubmit={handleSubmit}
      >
        {/* نام مشتری */}
        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">نام مشتری</label>
          <input
            type="text"
            readOnly
            value={selectedCustomer}
            placeholder="انتخاب مشتری"
            onClick={() => setModalOpen(true)}
            className="border border-gray-300 rounded px-3 py-2 cursor-pointer bg-gray-50 focus:outline-none"
          />
        </div>

        {/* مبلغ */}
        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">مبلغ</label>
          <input
            type="text"
            value={formatNumber(amount)}
            onChange={(e) => setAmount(parseNumber(e.target.value))}
            placeholder="مبلغ را وارد کنید"
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
          />
        </div>

        {/* آپلود تصویر چک با کامپوننت جدید */}
        <div className="flex flex-col w-60">
          <FileUploader
            folderGuid={parent_GUID}
            ref={fileUploaderRef}
            inputId="checkImageUploader"
            title="تصاویر چک"
          />
        </div>

        <div className="flex flex-col w-60">
          <label className="mb-1 font-semibold text-gray-700">
            تاریخ سر رسید
          </label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={dueDate}
            onChange={(date: DateObject) => {
              setDueDate(date);
            }}
            inputClass="w-full sm:w-48 px-2 py-1 border-2 border-primary rounded-md font-semibold focus:outline-none"
            placeholder="تاریخ را انتخاب کنید"
            format="YYYY/MM/DD"
          />
        </div>

        {/* دکمه ارسال */}
        <button
          type="submit"
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
        >
          ارسال
        </button>
      </form>

      {/* مودال انتخاب مشتری */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[70vh] overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                placeholder="جستجو نام مشتری..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
              <button
                onClick={() => setModalOpen(false)}
                className="mr-2 text-red-500 font-bold"
                type="button"
              >
                ×
              </button>
            </div>

            <ul className="max-h-60 overflow-y-auto">
              {uniqueTitles.length === 0 && (
                <li className="text-center text-gray-500">موردی یافت نشد</li>
              )}

              {uniqueTitles.map((title) => (
                <li
                  key={title}
                  className="p-2 cursor-pointer hover:bg-indigo-100 rounded"
                  onClick={() => {
                    setSelectedCustomer(title);
                    setModalOpen(false);
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
