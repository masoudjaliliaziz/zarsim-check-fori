import { useDispatch } from "react-redux";
import {
  setModalOpen,
  setSelectedCustomer,
  setSalesExpertName,
  setSalesExpert_text,
} from "../../features/checkForm/checkFormSlice";
import { useState } from "react";

interface Customer {
  Title?: string;
  SalesExpert?: string | null;
  SalesExpertAcunt_text?: string | null;
}

export default function CustomerModal({
  customers,
}: {
  customers: Customer[];
}) {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");

  // استخراج نام مشتری‌ها و حذف موارد تکراری
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 max-h-[70vh] overflow-auto p-4">
        {/* هدر مودال */}
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

        {/* لیست مشتری‌ها */}
        <ul className="max-h-60 overflow-y-auto">
          {filteredTitles.map((title) => (
            <li
              key={title}
              className="p-2 cursor-pointer hover:bg-indigo-100 rounded"
              onClick={() => {
                dispatch(setSelectedCustomer(title));

                // پیدا کردن مشتری انتخاب شده
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
  );
}
