// CheckNumberInput.tsx
import { useDispatch, useSelector } from "react-redux";
import { setCheckNum } from "../../features/checkForm/checkFormSlice";
import type { RootState } from "../../../store/store";


export default function CheckNumberInput({
  isMaster,
  checkNumError,
}: {
  isMaster: boolean;
  checkNumError: boolean;
}) {
  const { checkNum } = useSelector((state: RootState) => state.checkForm);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col w-60">
      <label className="mb-1 font-semibold text-gray-700">شماره چک</label>
      <input
        disabled={!isMaster}
        type="text"
        value={checkNum}
        onChange={(e) => dispatch(setCheckNum(e.target.value))}
        placeholder="شماره چک را وارد کنید"
        className={`border rounded px-3 py-2 focus:outline-none ${
          checkNumError ? "border-red-500 bg-red-100" : "border-gray-300"
        }`}
      />
    </div>
  );
}
