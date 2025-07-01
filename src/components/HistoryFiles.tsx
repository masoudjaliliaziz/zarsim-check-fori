import { useEffect, useState } from "react";
import { fetchFiles } from "../api/filesApi";

type HistoryFilesProps = {
  folderGuid: string;
  subFolder: string;
};

export function HistoryFiles({ folderGuid, subFolder }: HistoryFilesProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        const fetchedFiles = await fetchFiles(
          `customer_checks_back/${folderGuid}/${subFolder}`
        );
        setFiles(fetchedFiles);
      } catch (err) {
        console.error("خطا در بارگذاری فایل‌های تاریخچه:", err);
        setError("خطا در بارگذاری فایل‌ها.");
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [folderGuid, subFolder]);

  if (loading)
    return (
      <p className="text-sm text-gray-500 mt-2">در حال بارگذاری فایل‌ها...</p>
    );

  if (error) return <p className="text-sm text-red-500 mt-2">{error}</p>;

  if (files.length === 0)
    return (
      <p className="text-sm text-gray-500 mt-2">
        فایلی برای این تغییر وجود ندارد.
      </p>
    );

  return (
    <div className="mt-2">
      <p className="font-semibold">فایل‌های این تغییر:</p>
      <ul className="list-disc ml-6">
        {files.map((link, index) => (
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
    </div>
  );
}
