import { useSelector } from "react-redux";
import type { RootState } from "./../../store/store";
import App from "./../App";
import { ItemsList } from "./ItemsList";

export default function MainPage() {
  const parent_GUID = useSelector(
    (state: RootState) => state.checkForm.parent_GUID
  );
  console.log("dispatch", parent_GUID);
  return (
    <div
      className="min-h-screen p-6 bg-slate-200"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 2fr ",
        gap: "20px",
      }}
    >
      {" "}
      <div className="bg-white rounded-lg shadow p-6 max-h-screen ">
        <App />
      </div>
      {/* سمت چپ: لیست چک‌ها */}
      <div className="bg-white rounded-lg shadow p-4 overflow-auto max-h-screen">
        <ItemsList />
      </div>
      {/* سمت راست: فرم اصلی */}
    </div>
  );
}
