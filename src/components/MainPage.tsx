import { useSelector } from "react-redux";
import type { RootState } from "./../../store/store";
import App from "./../App";
import { ItemsList } from "./ItemsList";
import { useEffect, useState } from "react";
import { loadCustomer } from "../api/getData";
import { getCurrentUser } from "../api/itemsApi";
import { useUserRoles } from "../hooks/useUserRoles";

export default function MainPage() {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const { isTreasury } = useUserRoles(currentUsername);
  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUsername)
      .catch((err) => console.error("خطا در دریافت کاربر فعلی:", err));
  }, []);
  useEffect(() => {
    async function test() {
      await loadCustomer().then((res) =>
        console.log("jjjjjjjjjjjjjjjjjjjkjkjjjjjjjjjjj", res)
      );
    }
    test();
  }, []);
  const parent_GUID = useSelector(
    (state: RootState) => state.checkForm.parent_GUID
  );
  console.log("dispatch", parent_GUID);
  return (
    <>
      {isTreasury && (
        <div
          className="min-h-screen p-6 bg-slate-200 sticky top-6"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr ",
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
      )}
      {!isTreasury && (
        <div className="min-h-screen w-full p-6 bg-slate-200 sticky top-6">
          <div className="bg-white rounded-lg shadow p-4 overflow-auto max-h-screen">
            <ItemsList />
          </div>
        </div>
      )}
    </>
  );
}
