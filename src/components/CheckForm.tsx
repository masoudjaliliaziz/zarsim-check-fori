import { useSelector, useDispatch } from "react-redux";

import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import {
  setAmount,
  setDueDate,
  setModalOpen,
  setCheckNum,
} from "../features/checkForm/checkFormSlice";
import { FileUploader, type FileUploaderHandle } from "../utils/FileUploader";
import type { RootState } from "../../store/store";

interface CheckFormProps {
  isMaster: boolean;
  checkNumError: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  fileUploaderRef: React.RefObject<FileUploaderHandle>;
  parent_GUID: string;
}

export default function CheckForm({
  isMaster,
  checkNumError,
  handleSubmit,
  fileUploaderRef,
  parent_GUID,
}: CheckFormProps) {
  const dispatch = useDispatch();
  const { amount, checkNum, dueDate } = useSelector(
    (state: RootState) => state.checkForm
  );

  const CheckFormInputs = ({
    isMaster,
    checkNumError,
    amount,
    checkNum,
    dueDate,
    dispatch,
  }: {
    isMaster: boolean;
    checkNumError: boolean;
    amount: number | "";
    checkNum: string;
    dueDate: DateObject | null;
    dispatch: ReturnType<typeof useDispatch>;
  }) => (
    <>
      <div className="flex flex-col w-60">
        <label className="mb-1 font-semibold text-gray-700">نام مشتری</label>
        <input
          readOnly
          disabled={!isMaster}
          value={amount}
          onClick={() => dispatch(setModalOpen(true))}
          placeholder="انتخاب مشتری"
          className="border border-gray-300 rounded px-3 py-2 cursor-pointer bg-gray-50 focus:outline-none"
        />
      </div>
      <div className="flex flex-col w-60">
        <label className="mb-1 font-semibold text-gray-700">شماره چک</label>
        <input
          disabled={!isMaster}
          type="text"
          value={checkNum}
          onChange={(e) => dispatch(setCheckNum(String(e.target.value)))}
          placeholder="شماره چک را وارد کنید"
          className={`border rounded px-3 py-2 focus:outline-none ${
            checkNumError ? "border-red-500 bg-red-100" : "border-gray-300"
          }`}
        />
      </div>
      <div className="flex flex-col w-60">
        <label className="mb-1 font-semibold text-gray-700">مبلغ</label>
        <input
          disabled={!isMaster}
          type="text"
          value={
            amount === ""
              ? ""
              : amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          onChange={(e) => {
            const cleaned = e.target.value.replace(/,/g, "");
            const parsed = parseInt(cleaned, 10);
            dispatch(setAmount(isNaN(parsed) ? "" : parsed));
          }}
          placeholder="مبلغ را وارد کنید"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none"
        />
      </div>
      <div className="flex flex-col w-60">
        <FileUploader
          folderGuid={parent_GUID}
          ref={fileUploaderRef}
          inputId="checkUploader"
          title="تصویر چک"
        />
      </div>
      <div className="flex flex-col w-60">
        <label className="mb-1 font-semibold text-gray-700">تاریخ سررسید</label>
        <DatePicker
          disabled={!isMaster}
          calendar={persian}
          locale={persian_fa}
          value={dueDate}
          onChange={(val: DateObject | null) => { dispatch(setDueDate(val)); }}
          inputClass="w-full px-2 py-1 border-2 border-primary rounded-md font-semibold focus:outline-none"
          format="YYYY/MM/DD"
        />
      </div>
    </>
  );

  return (
    <form
      className="bg-white rounded-lg p-6 w-full max-w-4xl space-y-6 overflow-auto"
      onSubmit={handleSubmit}
    >
      <CheckFormInputs
        isMaster={isMaster}
        checkNumError={checkNumError}
        amount={amount}
        checkNum={checkNum}
        dueDate={dueDate}
        dispatch={dispatch}
      />
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
  );
}
