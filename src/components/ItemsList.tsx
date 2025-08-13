// ... import ها بدون تغییر
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { FileUploader } from "./../utils/FileUploader";
import type { FileUploaderHandle } from "./../utils/FileUploader";
import DatePicker from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  fetchAllItems,
  updateItemStatus,
  getCurrentUser,
  deleteItem,
  updateItem,
} from "../api/itemsApi";

import { fetchFiles, fetchStatusFiles } from "../api/filesApi";
import { addEditHistory, fetchEditHistory } from "../api/historyApi";
import { useUserRoles } from "../hooks/useUserRoles";
import FileList from "./FileList";

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
      agentDescription: string;
      Author: { Title: string; Email?: string; Id?: number };
      Created: string; // 🔥 این باید حتما باشه
    }[]
  >([]);
  const [statusDescriptionMap, setStatusDescriptionMap] = useState<
    Record<string, string>
  >({});

  const uploaderRefs = useRef<Record<string, FileUploaderHandle | null>>({});
  const { isAgent, isMaster } = useUserRoles(currentUsername);
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const updateMutation = useMutation({
    mutationFn: (updatedItem: {
      id: number;
      title: string;
      amount: string;
      dueDate: string;
      checkNum: string;
    }) => updateItem(updatedItem),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  const [filters, setFilters] = useState<{
    statusTypes: string[]; // چند انتخابی برای وضعیت
    title: string;
    salesExpert: string;
    checkNum: string;
    createdFrom: string; // تاریخ از (ISO string)
    createdTo: string; // تاریخ تا (ISO string)
  }>({
    statusTypes: [],
    title: "",
    salesExpert: "",
    checkNum: "",
    createdFrom: "",
    createdTo: "",
  });
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["items"],
    queryFn: fetchAllItems,
    refetchInterval: 5000,
  });
  const [editItemModalId, setEditItemModalId] = useState<number | null>(null);
  const [editItemForm, setEditItemForm] = useState<{
    title: string;
    amount: string;
    dueDate: string;
    checkNum: string;
  }>({
    title: "",
    amount: "",
    dueDate: "",
    checkNum: "",
  });

  const openItemEditModal = (item: (typeof items)[0]) => {
    setEditItemModalId(item.Id);
    setEditItemForm({
      title: item.Title,
      amount: item.amount,
      dueDate: item.dueDate,
      checkNum: item.checkNum, // اضافه کن این خط رو
    });
  };
  const mutation = useMutation({
    mutationFn: ({
      id,
      statusType,
      agentDescription,
    }: {
      id: number;
      statusType: string;
      agentDescription: string;
    }) => updateItemStatus(id, statusType, agentDescription),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["items"] }),
  });

  useEffect(() => {
    getCurrentUser()
      .then(setCurrentUsername)
      .catch((err) => console.error("خطا در دریافت کاربر فعلی:", err));
  }, []);

  useEffect(() => {
    if (isMaster) {
      setFilters((prev) => ({
        ...prev,
        statusTypes: ["", "عودت چک"],
      }));
    } else if (isAgent) {
      setFilters((prev) => ({
        ...prev,
        statusTypes: [""],
      }));
    }
  }, [isMaster, isAgent]);

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

  const filteredItems = items.filter((item) => {
    // فیلتر عنوان
    const titleMatch = item.Title.toLowerCase().includes(
      filters.title.toLowerCase()
    );
    //فیلتر شماره چک
    const checkNumMatch = item.checkNum
      ?.toLowerCase()
      .includes(filters.checkNum.toLowerCase());

    // فیلتر کارشناس
    const expertMatch = item.salesExertName
      ?.toLowerCase()
      .includes(filters.salesExpert.toLowerCase());

    // فیلتر وضعیت‌ها (اگر هیچ کدام انتخاب نشده، همه رو قبول کن)
    const statusMatch =
      filters.statusTypes.length === 0 ||
      filters.statusTypes.includes(String(item.statusType || ""));

    // فیلتر تاریخ ایجاد (اگر فیلتر داده شده)
    const createdDate = new Date(item.Created);
    const fromDate = filters.createdFrom ? new Date(filters.createdFrom) : null;
    const toDate = filters.createdTo ? new Date(filters.createdTo) : null;

    const dateMatch =
      (!fromDate || createdDate >= fromDate) &&
      (!toDate || createdDate <= toDate);

    // فیلتر کاربر و مستر طبق قبل
    const userCheck = isMaster || item.salesExpertText === currentUsername;

    return (
      titleMatch &&
      expertMatch &&
      statusMatch &&
      dateMatch &&
      userCheck &&
      checkNumMatch
    );
  });
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
    const selectedStatus = selectedStatusMap[item.Id];
    const description = statusDescriptionMap[item.Id] || "";

    // 👇 بررسی کن فقط اگر فایل داشت آپلود کن
    if (uploader && uploader.getFiles().length > 0) {
      await uploader.uploadFiles();
    }

    if (selectedStatus === "__RESET__") {
      await updateItemStatus(item.Id, "", "");
      await addEditHistory(item.Id, "", `${item.Id}-ریست`);
    } else {
      mutation.mutate({
        id: item.Id,
        statusType: selectedStatus,
        agentDescription: description,
        // 👈 توضیحات اضافه شد
      });

      await addEditHistory(
        item.Id,
        selectedStatus,
        description,
        item.salesExpertText,
        item.checkNum
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

  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => {
      const exists = prev.statusTypes.includes(status);
      if (exists) {
        return {
          ...prev,
          statusTypes: prev.statusTypes.filter((s) => s !== status),
        };
      } else {
        return { ...prev, statusTypes: [...prev.statusTypes, status] };
      }
    });
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("آیا از حذف این چک اطمینان دارید؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSaveEdit = () => {
    if (editItemModalId === null) return; // ✅ جلوگیری از ارسال مقدار نامعتبر
    updateMutation.mutate({
      id: editItemModalId,
      title: editItemForm.title,
      amount: editItemForm.amount,
      dueDate: editItemForm.dueDate,
      checkNum: editItemForm.checkNum,
    });
    setEditItemModalId(null);
  };

  // قبل از return
  const totalAmount = filteredItems.reduce(
    (sum, item) => sum + parseInt(item.amount),
    0
  );

  return (
    <div className="flex gap-6">
      <aside className="w-64 p-4 bg-gray-100 rounded shadow-md sticky top-4 self-start">
        <div className="mb-4 p-4 bg-green-100  font-bold rounded shadow flex flex-col items-center justify-center gap-3">
          <span className="text-slate-600"> جمع کل مبالغ چک‌ها</span>
          <span className="text-green-800 ">
            {totalAmount.toLocaleString()} ریال
          </span>
        </div>
        <h3 className="font-bold mb-3 text-lg">فیلترها</h3>

        {/* فیلتر عنوان */}
        <label className="block mb-3">
          عنوان چک:
          <input
            type="text"
            value={filters.title}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, title: e.target.value }))
            }
            className="w-full border rounded p-1 mt-1"
            placeholder="جستجو در عنوان"
          />
        </label>
        {/* فیلتر شماره چک */}
        <label className="block mb-3">
          شماره چک:
          <input
            type="text"
            value={filters.checkNum}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, checkNum: e.target.value }))
            }
            className="w-full border rounded p-1 mt-1"
            placeholder="شماره چک"
          />
        </label>

        {/* فیلتر کارشناس */}
        {!isAgent && (
          <label className="block mb-3">
            کارشناس:
            <input
              type="text"
              value={filters.salesExpert}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, salesExpert: e.target.value }))
              }
              className="w-full border rounded p-1 mt-1"
              placeholder="نام کارشناس"
            />
          </label>
        )}

        {/* فیلتر وضعیت (چک باکس چندتایی) */}
        <fieldset className="mb-3">
          <legend className="font-semibold mb-1">وضعیت‌ها:</legend>
          {[
            { label: "تامین وجه شد", value: "تامین وجه شد" },
            { label: "عودت چک", value: "عودت چک" },
            { label: "بدون وضعیت", value: "" }, // واضح‌تر
            { label: "ارسال مجدد به بانک", value: "ارسال مجدد به بانک" },
            { label: "برگشت مجدد چک", value: "برگشت مجدد چک" },
          ].map(({ label, value }, i) => (
            <label key={i} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={filters.statusTypes.includes(value)}
                onChange={() => toggleStatusFilter(value)}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        {/* فیلتر تاریخ ایجاد */}
        <div className="mb-3">
          <label className="block mb-1">تاریخ ایجاد از:</label>
          <DatePicker
            value={filters.createdFrom}
            onChange={(date: DateObject | null) =>
              setFilters((prev) => ({
                ...prev,
                createdFrom: date ? date.toDate().toISOString() : "",
              }))
            }
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            inputClass="w-full border rounded p-1"
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">تا:</label>
          <DatePicker
            value={filters.createdTo}
            onChange={(date: DateObject | null) =>
              setFilters((prev) => ({
                ...prev,
                createdTo: date ? date.toDate().toISOString() : "",
              }))
            }
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-right"
            format="YYYY/MM/DD"
            inputClass="w-full border rounded p-1"
          />
        </div>

        {/* دکمه ریست فیلترها */}
        <button
          className="bg-red-500 text-white px-3 py-1 rounded-md font-bold"
          type="button"
          onClick={() =>
            setFilters({
              statusTypes: [],
              title: "",
              salesExpert: "",
              createdFrom: "",
              createdTo: "",
              checkNum: "",
            })
          }
        >
          پاکسازی فیلترها
        </button>
      </aside>
      <main className="flex-1">
        <h2 className="font-bold text-lg mb-4">
          لیست چک‌ها — تعداد: {filteredItems.length}
        </h2>

        {filteredItems.map((item) => {
          const uploaderId = `uploader-${item.Id}`;
          const showHistory = historyModalId === item.Id;

          const generalFiles = fileLinksMap.general[item.parent_GUID] || [];
          const statusFiles = fileLinksMap.status[item.parent_GUID] || [];

          return (
            <div key={item.Id} className="p-4 bg-white shadow rounded mb-6">
              <div className="flex justify-between items-center w-full font-bold text-md">
                <p className="">عنوان: {item.Title}</p>
                <p className="text-indigo-600">
                  کارشناس: {item.salesExertName}
                </p>
              </div>

              <div className="flex justify-between items-center w-full font-semibold text-md">
                <p>مبلغ: {parseInt(item.amount).toLocaleString()} ریال</p>
                <p>شماره چک : {item.checkNum}</p>

                <p>تاریخ سررسید: {item.dueDate}</p>
                <p
                  className={
                    item.status === "0" ? "text-orange-500" : "text-green-500"
                  }
                >
                  وضعیت:{" "}
                  {item.status === "0"
                    ? "در انتظار کارشناس"
                    : "تعیین وضعیت شده"}
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
                <div className="flex flex-col gap-[3.5px] items-center justify-center bg-slate-100 rounded-md text-xs p-0.5">
                  {" "}
                  <p>ساخته شده توسط: {item.Author?.Title}</p>
                  <p>تاریخ ایجاد: {formatDate(item.Created)}</p>
                </div>
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
                          دانلود چک {index + 1}
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
                    <div className="flex gap-3">
                      {" "}
                      <button
                        type="button"
                        className=" bg-yellow-500 text-white font-bold  px-3 py-1.5 rounded-md cursor-pointer hover:bg-yellow-400"
                        onClick={() => openEditModal(item)}
                      >
                        ویرایش وضعیت
                      </button>
                      <button
                        type="button"
                        className="bg-green-600 text-white px-4 py-2 rounded"
                        onClick={() => openItemEditModal(item)}
                      >
                        ویرایش اطلاعات چک
                      </button>
                      <button
                        type="button"
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={() => handleDeleteItem(item.Id)}
                      >
                        حذف چک
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* تعیین وضعیت برای Agent */}
              {isAgent && (
                <div className="mt-4 space-y-2">
                  {/* انتخاب وضعیت */}
                  <select
                    className="border p-2 rounded w-full"
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
                    <option value="ارسال مجدد به بانک">
                      ارسال مجدد به بانک
                    </option>
                    <option value="برگشت مجدد چک">برگشت مجدد چک</option>
                  </select>

                  {/* توضیحات */}
                  <textarea
                    placeholder="توضیحات مربوط به وضعیت چک..."
                    className="border p-2 rounded w-full min-h-[80px]"
                    onChange={(e) =>
                      setStatusDescriptionMap((prev) => ({
                        ...prev,
                        [item.Id]: e.target.value,
                      }))
                    }
                    value={statusDescriptionMap[item.Id] || ""}
                  />

                  {/* آپلود مدارک */}
                  <FileUploader
                    folderGuid={item.parent_GUID}
                    subFolder={"statusDoc"}
                    inputId={uploaderId}
                    title="بارگذاری مدارک وضعیت"
                    ref={(el) => {
                      uploaderRefs.current[item.Id] = el;
                    }}
                  />

                  {/* دکمه ثبت وضعیت */}
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
                  <div className="bg-white rounded-lg px-6 py-10 w-96 relative flex flex-col justify-center items-center gap-4">
                    <h3 className="text-lg font-bold mb-2">ویرایش وضعیت چک</h3>

                    {/* -- نمایش فایل های عمومی -- */}
                    <FileList folderGuid={item.parent_GUID} />

                    <select
                      className="border p-2 rounded w-full"
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
                      <option value="ارسال مجدد به بانک">
                        ارسال مجدد به بانک
                      </option>
                      <option value="برگشت مجدد چک">برگشت مجدد چک</option>
                    </select>

                    {/* textarea و فایل آپلودر */}
                    <textarea
                      placeholder="توضیحات مربوط به وضعیت چک..."
                      className="border p-2 rounded w-full min-h-[80px]"
                      onChange={(e) =>
                        setStatusDescriptionMap((prev) => ({
                          ...prev,
                          [item.Id]: e.target.value,
                        }))
                      }
                      value={statusDescriptionMap[item.Id] || ""}
                    />

                    <FileUploader
                      folderGuid={item.parent_GUID}
                      ref={(el) => {
                        uploaderRefs.current[item.Id] = el;
                      }}
                      inputId="checkUploader"
                      title="تصویر چک"
                    />

                    {/* دکمه‌ها */}
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
                            <p>توضیحات: {history.agentDescription}</p>

                            <p>توسط: {history.Author?.Title}</p>

                            <p>تاریخ: {formatDate(history.Created)}</p>

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
                                دانلود چک {index + 1}
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

              {editItemModalId === item.Id && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
                  <div className="bg-white rounded-lg p-6 w-96 relative">
                    <h3 className="text-lg font-bold mb-4">
                      ویرایش اطلاعات چک
                    </h3>

                    <label className="block mb-3">
                      عنوان چک:
                      <input
                        type="text"
                        className="border p-2 rounded w-full mt-1"
                        value={editItemForm.title}
                        onChange={(e) =>
                          setEditItemForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label className="block mb-3">
                      شماره چک:
                      <input
                        type="text"
                        className="border p-2 rounded w-full mt-1"
                        value={editItemForm.checkNum || ""}
                        onChange={(e) =>
                          setEditItemForm((prev) => ({
                            ...prev,
                            checkNum: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="block mb-3">
                      مبلغ:
                      <input
                        type="number"
                        className="border p-2 rounded w-full mt-1"
                        value={editItemForm.amount}
                        onChange={(e) =>
                          setEditItemForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="block mb-3">
                      تاریخ سررسید:
                      <input
                        type="text"
                        className="border p-2 rounded w-full mt-1"
                        value={editItemForm.dueDate}
                        onChange={(e) =>
                          setEditItemForm((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <div className="flex gap-4 justify-end mt-4">
                      <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => setEditItemModalId(null)}
                      >
                        لغو
                      </button>
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleSaveEdit}
                      >
                        ذخیره تغییرات
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
