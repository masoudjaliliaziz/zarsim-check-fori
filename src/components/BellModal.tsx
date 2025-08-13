import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Copy, CircleCheckBig, ListChecks } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifSeen } from "../hooks/useNotifSeen";
import { getCurrentUser } from "../api/itemsApi";

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

export type BellNotification = {
  ID: number;
  seen: string;
  checkNum: string;
  StatusType: string;
  Editor: { Title: string };
  Modified: string;
  agentDescription: string;
} & Record<SeenColumn, string>;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  notifications?: BellNotification[];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("fa-IR", { hour12: false });
};

export default function BellModal({
  isOpen,
  onClose,
  notifications = [],
}: Props) {
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [notifUser, setNotifUser] = useState<SeenColumn>("seen");
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

  const { mutate } = useNotifSeen();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);
  console.log(notifications.map((n) => ({ ID: n.ID, seen: n.seen })));

  const unreadNotifications = notifications.filter(
    (n) => String(n[notifUser]) === "0"
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-black"
          />

          {/* modal panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.99 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <Bell className="text-sky-600" />
                </div>
                <div>
                  <div className="font-bold text-base">اعلان ها</div>
                  <p className="text-xs text-gray-500">
                    {unreadNotifications.length} آیتم
                  </p>
                </div>
              </div>

              <div
                aria-label="بستن"
                onClick={onClose}
                className="p-2 rounded-md hover:bg-gray-100 transition w-8 h-8 flex justify-center items-center cursor-pointer"
              >
                <X width={20} height={20} />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-3 space-y-3">
              {unreadNotifications.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  نوتیفیکیشنی وجود ندارد
                </div>
              ) : (
                unreadNotifications.map((n) => (
                  <motion.div
                    key={n.ID}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className={`flex gap-3 items-start p-3 rounded-lg border ${
                      n.seen === "1" ? "bg-white" : "bg-sky-50 border-sky-100"
                    }`}
                  >
                    <div className="flex-0 w-3">
                      {n.seen === "0" && (
                        <div className="w-3 h-3 rounded-full bg-sky-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        {n.Modified && (
                          <span className="text-xs text-gray-400">
                            {formatDate(n.Modified)}
                          </span>
                        )}
                        <button
                          onClick={() =>
                            mutate({ ID: n.ID, seenCol: notifUser })
                          }
                          className="px-2 py-1 text-xs rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition"
                          type="button"
                        >
                          <CircleCheckBig />
                        </button>
                      </div>

                      {n.StatusType && (
                        <div className="text-sm font-bold text-gray-600 flex flex-row-reverse items-center justify-end gap-1">
                          <span> {n.StatusType}</span>
                          <span> تغییر وضعیت به</span>
                        </div>
                      )}
                      {n.checkNum && (
                        <p className="text-xs text-gray-600 mt-1 flex items-center gap-2 font-semibold">
                          شماره چک:
                          <span>{n.checkNum}</span>
                          <div
                            onClick={() => {
                              navigator.clipboard
                                .writeText(n.checkNum)
                                .then(() => {
                                  toast.success("شماره چک کپی شد!");
                                })
                                .catch(() => {
                                  toast.error("خطا در کپی شماره چک");
                                });
                            }}
                            className=" rounded hover:bg-gray-200 w-8 h-8 flex justify-center items-center cursor-pointer"
                            aria-label="کپی شماره چک"
                            title="کپی شماره چک"
                          >
                            <Copy className="w-5 h-5 text-gray-600" />
                          </div>
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="p-3 border-t flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition"
              >
                بستن
              </button>
              <button
                type="button"
                onClick={() => {
                  unreadNotifications.forEach((notif) => {
                    mutate({ ID: notif.ID, seenCol: notifUser });
                  });
                  toast.success(
                    "همه اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند"
                  );
                }}
                className="px-3 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                <ListChecks />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
