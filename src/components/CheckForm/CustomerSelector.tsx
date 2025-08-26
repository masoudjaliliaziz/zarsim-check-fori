import { useDispatch, useSelector } from "react-redux";
import { setModalOpen } from "../../features/checkForm/checkFormSlice";
import type { RootState } from "../../../store/store";

export default function CustomerSelector({ isMaster }: { isMaster: boolean }) {
  const { selectedCustomer } = useSelector(
    (state: RootState) => state.checkForm
  );
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col w-60">
      <label className="mb-1 font-semibold text-gray-700">نام مشتری</label>
      <input
        readOnly
        disabled={!isMaster}
        value={selectedCustomer}
        onClick={() => dispatch(setModalOpen(true))}
        placeholder="انتخاب مشتری"
        className="border border-gray-300 rounded px-3 py-2 cursor-pointer bg-gray-50 focus:outline-none"
      />
    </div>
  );
}
