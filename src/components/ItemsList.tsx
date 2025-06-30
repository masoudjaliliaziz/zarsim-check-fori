import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { FileUploader } from "./../utils/FileUploader";
import type { FileUploaderHandle } from "./../utils/FileUploader";
import { getDigest } from "../api/getDigest";

const allowedUsernames = [
  "i:0#.w|zarsim\\Rashaadmin",
  "i:0#.w|zarsim\\khajiabadi",
  "i:0#.w|zarsim\\dev1",
];

declare const _spPageContextInfo: {
  webAbsoluteUrl: string;
  [key: string]: unknown;
};

interface Item {
  Id: number;
  Title: string;
  amount: string;
  dueDate: string;
  status: string;
  parent_GUID: string;
  statusType?: string;
  Created: string;
  Author: { Title: string };
  Editor: { Title: string };
  Modified: string;
}

async function getCurrentUser(): Promise<string> {
  const response = await fetch(
    `${_spPageContextInfo.webAbsoluteUrl}/_api/web/currentuser`,
    {
      headers: { Accept: "application/json;odata=verbose" },
      credentials: "same-origin",
    }
  );
  if (!response.ok) throw new Error("کاربر یافت نشد");
  const data = await response.json();
  return data.d.LoginName as string;
}

async function getListItemEntityTypeName(listName: string): Promise<string> {
  const webUrl = "https://portal.zarsim.com";
  const url = `${webUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`;
  const res = await fetch(url, {
    headers: { Accept: "application/json;odata=verbose" },
  });
  if (!res.ok) throw new Error("خطا در دریافت نوع موجودیت لیست");
  const data = await res.json();
  return data.d.ListItemEntityTypeFullName;
}

async function fetchAllItems(): Promise<Item[]> {
  const BASE_URL = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const url = `${BASE_URL}/_api/web/lists/getbytitle('${listName}')/items?$select=Id,Title,amount,dueDate,status,parent_GUID,statusType,Created,Author/Title,Modified,Editor/Title&$expand=Author,Editor`;
  const res = await fetch(url, {
    headers: { Accept: "application/json;odata=verbose" },
  });
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
  const data = await res.json();
  return (data.d.results as Item[]).sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );
}

async function fetchFiles(folderPath: string): Promise<string[]> {
  const webUrl = "https://portal.zarsim.com";
  try {
    const res = await fetch(
      `${webUrl}/_api/web/GetFolderByServerRelativeUrl('${folderPath}')/Files`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );
    const data = await res.json();
    return (data.d.results as { ServerRelativeUrl: string }[]).map(
      (f) => `${webUrl}${f.ServerRelativeUrl}`
    );
  } catch (err) {
    console.error("خطا در دریافت فایل‌ها:", err);
    return [];
  }
}

async function fetchStatusFiles(folderPath: string): Promise<string[]> {
  // فایل‌های داخل زیرپوشه statusDoc
  return fetchFiles(`${folderPath}/statusDoc`);
}

async function updateItemStatus(id: number, statusType: string): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const digest = await getDigest();
  const entityTypeName = await getListItemEntityTypeName(listName);
  const body = {
    __metadata: { type: entityTypeName },
    statusType,
    status: "1",
  };
  const res = await fetch(
    `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`,
    {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "Content-Type": "application/json;odata=verbose",
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    throw new Error("خطا در بروزرسانی وضعیت چک");
  }
}

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const uploaderRefs = useRef<Record<string, FileUploaderHandle | null>>({});

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

  const filteredItems = items.filter((item) =>
    item.Title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        const isAgent =
          currentUsername && allowedUsernames.includes(currentUsername);
        const uploaderId = `uploader-${item.Id}`;
        const showHistory = item.status === "1" && historyModalId === item.Id;

        const generalFiles = fileLinksMap.general[item.parent_GUID] || [];
        const statusFiles = fileLinksMap.status[item.parent_GUID] || [];

        return (
          <div key={item.Id} className="p-4 bg-white shadow rounded mb-6">
            <p className="font-semibold">عنوان: {item.Title}</p>
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
              {" "}
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

            {/* فایل‌های عمومی (بیرون مدال) */}
            <div className="flex justify-between items-center w-full ">
              {" "}
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
              {item.status === "1" && (
                <button
                  type="button"
                  onClick={() => setHistoryModalId(item.Id)}
                  className="mt-4 bg-blue-700 text-white  font-bold px-3 py-1.5 rounded-md cursor-pointer hover:bg-blue-400 "
                >
                  مشاهده تاریخچه وضعیت
                </button>
              )}
            </div>
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
                  subFolder="statusDoc"
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
                  onClick={async () => {
                    const uploader = uploaderRefs.current[item.Id];
                    if (uploader) await uploader.uploadFiles();
                    mutation.mutate({
                      id: item.Id,
                      statusType: selectedStatusMap[item.Id],
                    });
                  }}
                >
                  ثبت وضعیت
                </button>
              </div>
            )}

            {showHistory && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96 relative">
                  <h3 className="text-lg font-bold mb-2">
                    تاریخچه تعیین وضعیت
                  </h3>
                  <p>وضعیت: {item.statusType}</p>
                  <p>توسط: {item.Editor?.Title}</p>
                  <p>تاریخ: {formatDate(item.Modified)}</p>

                  {/* فایل‌های agent داخل مدال */}
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
