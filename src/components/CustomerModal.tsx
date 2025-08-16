import { useDispatch } from "react-redux";
import {
  setModalOpen,
  setSelectedCustomer,
  setSalesExpertName,
  setSalesExpert_text,
} from "../features/checkForm/checkFormSlice";

interface CustomerModalProps {
  customers: {
    Title: string;
    SalesExpert?: string;
    SalesExpertAcunt_text?: string;
  }[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function CustomerModal({
  customers,
  searchTerm,
  setSearchTerm,
}: CustomerModalProps) {
  const dispatch = useDispatch();
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
                const customer = customers.find((c) => c.Title === title);
                dispatch(setSalesExpertName(customer?.SalesExpert ?? null));
                dispatch(
                  setSalesExpert_text(customer?.SalesExpertAcunt_text ?? null)
                );
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
