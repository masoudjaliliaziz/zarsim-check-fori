// ... import ها بدون تغییر
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { FileUploader } from "./../utils/FileUploader";
import type { FileUploaderHandle } from "./../utils/FileUploader";

import {
  fetchAllItems,
  updateItemStatus,
  getCurrentUser,
} from "../api/itemsApi";

import { fetchFiles, fetchStatusFiles } from "../api/filesApi";
import { addEditHistory, fetchEditHistory } from "../api/historyApi";
import { useUserRoles } from "../hooks/useUserRoles";

export function ItemsList() {
  const queryClient = useQueryClient();
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [fileLinksMap, setFileLinksMap] = useState<{
    general: Record<string, string[]>;
    status: Record<string, string[]>;
  }>({ general: {}, status: {} });

  const [selectedStatusMap, setSelectedStatusMap] = useState<
    Record<number, string>
  >({});
  const [historyModalId, setHistoryModalId] = useState<number | null>(null);
  const [editModalId, setEditModalId] = useState<number | null>(null);
  const [historyData, setHistoryData] = useState<
    {
      StatusType: string;
      Editor: { Title: string };
      Modified: string;
      FolderName: string; // 🔥 این باید حتما باشه
    }[]
  >([]);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const uploaderRefs = useRef<Record<string, FileUploaderHandle | null>>({});
  const { isAgent, isMaster } = useUserRoles(currentUsername);

  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: fetchAllItems,
    refetchInterval: 5000,
  });

  const mutation = useMutation({
    mutationFn: ({ id, statusType }: { id: number; statusType: string }) =>
      updateItemStatus(id, statusType),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUsername)
      .catch((err) => console.error("خطا در دریافت کاربر فعلی:", err));
  }, []);

  useEffect(() => {
    async function loadFiles() {
      const generalLinksMap: Record<string, string[]> = {};
      const statusLinksMap: Record<string, string[]> = {};
      for (const item of items) {
        const generalLinks = await fetchFiles(
          `customer_checks_back/${item.parent_GUID}`
        ).catch(() => []);
        const statusLinks = await fetchStatusFiles(
          `customer_checks_back/${item.parent_GUID}`
        ).catch(() => []);
        generalLinksMap[item.parent_GUID] = generalLinks;
        statusLinksMap[item.parent_GUID] = statusLinks;
      }
      setFileLinksMap({ general: generalLinksMap, status: statusLinksMap });
    }
    if (items.length > 0) loadFiles();
  }, [items]);

  if (isLoading) return <p>در حال بارگذاری...</p>;
  if (error instanceof Error) return <p>خطا: {error.message}</p>;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("fa-IR", { hour12: false });
  };

  const filteredItems = items.filter(
    (item) =>
      item.Title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (isMaster || item.salesExpertText === currentUsername)
  );

  const openEditModal = (item: (typeof items)[0]) => {
    setSelectedStatusMap((prev) => ({
      ...prev,
      [item.Id]: item.statusType || "",
    }));
    setEditModalId(item.Id);
  };

  const openHistoryModal = async (itemId: number) => {
    setHistoryModalId(itemId);
    try {
      const history = await fetchEditHistory(itemId);
      setHistoryData(history);
    } catch (err) {
      console.error("خطا در دریافت تاریخچه:", err);
      setHistoryData([]);
    }
  };

  const handleStatusSubmit = async (item: (typeof items)[0]) => {
    const uploader = uploaderRefs.current[item.Id];

    // 👇 بررسی کن فقط اگر فایل داشت آپلود کن
    if (uploader && uploader.getFiles().length > 0) {
      await uploader.uploadFiles();
    }

    const selectedStatus = selectedStatusMap[item.Id];

    if (selectedStatus === "__RESET__") {
      await updateItemStatus(item.Id, "");
      await addEditHistory(item.Id, "", `${item.Id}-ریست`);
    } else {
      mutation.mutate({
        id: item.Id,
        statusType: selectedStatus,
      });

      await addEditHistory(
        item.Id,
        selectedStatus,
        `${item.Id}-${selectedStatus}`
      );
    }

    if (historyModalId === item.Id) {
      try {
        const history = await fetchEditHistory(item.Id);
        setHistoryData(history);
      } catch (err) {
        console.error("خطا در بروزرسانی تاریخچه:", err);
      }
    }
  };

  return (
    <div>
      <h2 className="font-bold text-lg mb-4">لیست چک‌ها</h2>

      <input
        type="text"
        placeholder="جستجو بر اساس عنوان چک"
        className="mb-4 border p-2 rounded w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredItems.map((item) => {
        const uploaderId = `uploader-${item.Id}`;
        const showHistory = historyModalId === item.Id;

        const generalFiles = fileLinksMap.general[item.parent_GUID] || [];
        const statusFiles = fileLinksMap.status[item.parent_GUID] || [];

        return (
          <div key={item.Id} className="p-4 bg-white shadow rounded mb-6">
            <div className="flex justify-between items-center w-full font-bold text-md">
              <p className="">عنوان: {item.Title}</p>
              <p className="text-indigo-600">کارشناس: {item.salesExertName}</p>
            </div>

            <div className="flex justify-between items-center w-full font-semibold text-md">
              <p>مبلغ: {parseInt(item.amount).toLocaleString()} تومان</p>
              <p>تاریخ سررسید: {item.dueDate}</p>
              <p
                className={
                  item.status === "0" ? "text-orange-500" : "text-green-500"
                }
              >
                وضعیت:{" "}
                {item.status === "0" ? "در انتظار کارشناس" : "تعیین وضعیت شده"}
              </p>
            </div>
            <div className="flex justify-between items-center w-full font-semibold text-md">
              <p
                className={
                  item.statusType === "تامین وجه شد"
                    ? "text-green-500"
                    : "text-orange-500"
                }
              >
                وضعیت تعیین‌شده: {item.statusType || "-"}
              </p>
              <p>ساخته شده توسط: {item.Author?.Title}</p>
              <p>تاریخ ایجاد: {formatDate(item.Created)}</p>
            </div>

            {/* فایل‌های عمومی */}
            <div className="flex justify-between items-center w-full ">
              {generalFiles.length > 0 && (
                <ul className="list-disc ml-6 mt-2">
                  {generalFiles.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        دانلود فایل {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex justify-center items-center gap-3">
                {item.status === "1" && (
                  <button
                    type="button"
                    onClick={() => openHistoryModal(item.Id)}
                    className=" bg-blue-700 text-white font-bold px-3 py-1.5 rounded-md cursor-pointer hover:bg-blue-400 "
                  >
                    مشاهده تاریخچه وضعیت
                  </button>
                )}

                {isMaster && (
                  <button
                    type="button"
                    className=" bg-yellow-500 text-white font-bold  px-3 py-1.5 rounded-md cursor-pointer hover:bg-yellow-400"
                    onClick={() => openEditModal(item)}
                  >
                    ویرایش وضعیت
                  </button>
                )}
              </div>
            </div>

            {/* تعیین وضعیت برای Agent */}
            {isAgent && item.status === "0" && (
              <div className="mt-4 space-y-2">
                <select
                  className="border p-2 rounded"
                  onChange={(e) =>
                    setSelectedStatusMap((prev) => ({
                      ...prev,
                      [item.Id]: e.target.value,
                    }))
                  }
                  defaultValue=""
                >
                  <option value="" disabled>
                    انتخاب وضعیت
                  </option>
                  <option value="تامین وجه شد">تامین وجه شد</option>
                  <option value="عودت چک">عودت چک</option>
                </select>

                <FileUploader
                  folderGuid={item.parent_GUID}
                  subFolder={"statusDoc"}
                  inputId={uploaderId}
                  title="بارگذاری مدارک وضعیت"
                  ref={(el) => {
                    uploaderRefs.current[item.Id] = el;
                  }}
                />

                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={!selectedStatusMap[item.Id]}
                  onClick={() => handleStatusSubmit(item)}
                >
                  ثبت وضعیت
                </button>
              </div>
            )}

            {/* ویرایش وضعیت برای Master */}
            {editModalId === item.Id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                <div className="bg-white rounded-lg p-6 w-96 relative">
                  <h3 className="text-lg font-bold mb-2">ویرایش وضعیت چک</h3>

                  <select
                    className="border p-2 rounded w-full mb-4"
                    value={selectedStatusMap[item.Id] || ""}
                    onChange={(e) =>
                      setSelectedStatusMap((prev) => ({
                        ...prev,
                        [item.Id]: e.target.value,
                      }))
                    }
                  >
                    <option value="" disabled>
                      انتخاب وضعیت
                    </option>
                    <option value="تامین وجه شد">تامین وجه شد</option>
                    <option value="عودت چک">عودت چک</option>
                    <option value="__RESET__">ریست وضعیت</option>
                  </select>

                  <FileUploader
                    folderGuid={item.parent_GUID}
                    subFolder="statusDoc"
                    inputId={`edit-uploader-${item.Id}`}
                    title="بارگذاری مدارک وضعیت"
                    ref={(el) => {
                      uploaderRefs.current[item.Id] = el;
                    }}
                  />

                  <div className="flex gap-4 items-center justify-end space-x-2">
                    <button
                      type="button"
                      className="bg-gray-300 px-4 py-2 rounded"
                      onClick={() => setEditModalId(null)}
                    >
                      لغو
                    </button>
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 py-2 rounded"
                      disabled={!selectedStatusMap[item.Id]}
                      onClick={async () => {
                        await handleStatusSubmit(item);
                        setEditModalId(null);
                      }}
                    >
                      ثبت تغییرات
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* مودال تاریخچه */}
            {showHistory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 relative">
                  <h3 className="text-lg font-bold mb-2">
                    تاریخچه تعیین وضعیت
                  </h3>

                  {historyData.length > 0 ? (
                    <ul className="space-y-2 max-h-96 overflow-y-auto">
                      {historyData.map((history, index) => (
                        <li
                          key={index}
                          className="border p-2 rounded bg-gray-100"
                        >
                          <p>وضعیت: {history.StatusType}</p>
                          <p>توسط: {history.Editor?.Title}</p>
                          <p>تاریخ: {formatDate(history.Modified)}</p>

                          {/* فایل‌های مربوط به همین ویرایش */}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>تاریخچه‌ای برای این آیتم یافت نشد.</p>
                  )}

                  {/* فایل‌های وضعیت */}
                  {statusFiles.length > 0 && (
                    <>
                      <p className="mt-4 font-semibold">فایل‌های وضعیت:</p>
                      <ul className="list-disc ml-6">
                        {statusFiles.map((link, index) => (
                          <li key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              دانلود فایل {index + 1}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setHistoryModalId(null)}
                    className="absolute top-2 left-2 text-gray-500 hover:text-black"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
