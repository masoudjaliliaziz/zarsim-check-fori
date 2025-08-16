import App from "./../App";
import { ItemsList } from "./ItemsList";
import { useEffect, useState } from "react";
import { loadCustomer } from "../api/getData";
import { getCurrentUser } from "../api/itemsApi";
import { useUserRoles } from "../hooks/useUserRoles";
import { BanknoteArrowDown, Bell, QrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllEditHistory } from "../api/historyApi";
import BellModal from "./BellModal";
import { MasterUsers, treasury } from "../constants/userRoles";
type SeenColumn =
  | "khajiabadiSeen"
  | "zibaniatiSeen"
  | "zniatiSeen"
  | "tsaniSeen"
  | "habediniSeen"
  | "apazokiSeen"
  | "sakbariSeen"
  | "mmoradabadiSeen"
  | "seen";
export default function MainPage() {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const [notifUser, setNotifUser] = useState<SeenColumn>("seen");
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
    if (currentUsername === "i:0#.w|zarsim\\khajiabadi") {
      setNotifUser("khajiabadiSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\zibaniati") {
      setNotifUser("zibaniatiSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\zniati") {
      setNotifUser("zniatiSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\tsani") {
      setNotifUser("tsaniSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\habedini") {
      setNotifUser("habediniSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\apazoki") {
      setNotifUser("apazokiSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\sakbari") {
      setNotifUser("sakbariSeen");
    } else if (currentUsername === "i:0#.w|zarsim\\mmoradabadi") {
      setNotifUser("mmoradabadiSeen");
    } else if (
      currentUsername === "i:0#.w|zarsim\\Rashaadmin" ||
      currentUsername === "i:0#.w|zarsim\\mesmaeili"
    ) {
      setNotifUser("seen");
    }
  }, [currentUsername]);
  useEffect(() => {
    async function test() {
      await loadCustomer().then((res) =>
        console.log("jjjjjjjjjjjjjjjjjjjkjkjjjjjjjjjjj", res)
      );
    }
    test();
  }, []);
  const filteredBellData = bellData?.filter((n) => {
    const isUnread = String(n[notifUser]) === "0";

    // اگر کاربر مستر یا خزانه است، همه را نشان بده
    const isMasterOrTreasury =
      MasterUsers.includes(currentUsername || "") ||
      treasury.includes(currentUsername || "");

    // اگر مستر یا خزانه است، فقط unread بودن مهمه
    if (isMasterOrTreasury) return isUnread;

    // برای بقیه، فقط اگر salesExpertText برابر currentUsername باشد
    return isUnread && n.salesExpertText === currentUsername;
  });
  const unreadCount = filteredBellData?.length || 0;

  return (
    <>
      <BellModal
        isOpen={bellOpen}
        onClose={() => setBellOpen(false)}
        notifications={filteredBellData}
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

              <a
                className="flex justify-center items-center w-8 h-8 rounded-md bg-slate-700 text-white sticky top-1 right-1 hover:bg-white hover:text-slate-700 cursor-pointer "
                href="https://crm.zarsim.com/SitePages/CashExpertView.aspx"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BanknoteArrowDown width={20} height={20} />
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
            <div className="flex w-full bg-white justify-start items-center gap-3">
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
            <ItemsList />
          </div>
        </div>
      )}
    </>
  );
}
