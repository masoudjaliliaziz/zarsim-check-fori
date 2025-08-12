import App from "./../App";
import { ItemsList } from "./ItemsList";
import { useEffect, useState } from "react";
import { loadCustomer } from "../api/getData";
import { getCurrentUser } from "../api/itemsApi";
import { useUserRoles } from "../hooks/useUserRoles";
import { Bell, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEditHistory } from "../api/historyApi";
import BellModal from "./BellModal";

export default function MainPage() {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [bellOpen, setBellOpen] = useState(false);
  const { isTreasury } = useUserRoles(currentUsername);
  const { data: bellData } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const notifications = await fetchAllEditHistory();
      return notifications;
    },
    refetchInterval: 1000,
  });
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
  const unreadCount =
    bellData?.filter((n) => String(n.seen) === "0").length || 0;

  return (
    <>
      <BellModal
        isOpen={bellOpen}
        onClose={() => setBellOpen(false)}
        notifications={bellData}
      />
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
          <div className="bg-white rounded-lg shadow p-6 max-h-screen flex flex-col items-center justify-start gap-3 ">
            <div className="flex justify-start items-center gap-3">
              <a
                className="flex justify-center items-center w-8 h-8 rounded-md bg-slate-700 text-white sticky top-1 right-1 hover:bg-white hover:text-slate-700 cursor-pointer "
                href="https://crm.zarsim.com/SitePages/checksTr.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <QrCode width={20} height={20} />
              </a>

              <div
                className="flex justify-center items-center w-8 h-8 rounded-md bg-slate-700 text-white sticky top-1 right-1 hover:bg-white hover:text-slate-700 cursor-pointer "
                onClick={() => {
                  setBellOpen(true);
                }}
              >
                <Bell width={20} height={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
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
