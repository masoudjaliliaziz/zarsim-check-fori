import { useQuery } from "@tanstack/react-query";
import { useDeleteFile } from "../hooks/useDeleteFile";
import { fetchFiles } from "../api/filesApi"; // فرض بر اینه که این تابع رو داری

interface FileListProps {
  folderGuid: string;
}

export default function FileList({ folderGuid }: FileListProps) {
  // اصلاح isPending به isLoading و اصلاح تابع fetch
  const {
    data: files,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["files", folderGuid],
    queryFn: () => fetchFiles(`customer_checks_back/${folderGuid}`),
  });

  const deleteFileMutation = useDeleteFile(
    `customer_checks_back/${folderGuid}`
  );

  if (isLoading) return <p>در حال بارگذاری فایل‌ها...</p>;
  return (
    <div className="w-full p-6 flex flex-col justify-center items-center">
      <p className="font-semibold mb-2">فایل‌های عمومی:</p>
      {files && files.length > 0 ? (
        <ul>
          {files.map((fileUrl) => {
            const fileName = fileUrl.split("/").pop(); // اسم فایل را از URL بگیر
            return (
              <li
                key={fileUrl}
                className="flex justify-between items-center mb-1"
              >
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {fileName}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("آیا از حذف این فایل مطمئن هستید؟")) {
                      deleteFileMutation.mutate(fileUrl, {
                        onSuccess: () => {
                          refetch();
                        },
                      });
                    }
                  }}
                  className="text-red-600 hover:text-red-800"
                  title="حذف فایل"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>فایلی یافت نشد.</p>
      )}
    </div>
  );
}
