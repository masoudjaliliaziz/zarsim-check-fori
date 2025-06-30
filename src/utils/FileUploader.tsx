import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import toast from "react-hot-toast";

interface FileUploaderProps {
  folderGuid: string; // فقط همین برای مسیر پوشه کافی است
  title?: string;
  inputId: string;
}

export interface FileUploaderHandle {
  getFiles: () => File[];
  clearFiles: () => void;
  uploadFiles: () => Promise<void>;
}

const FileUploader = forwardRef<FileUploaderHandle, FileUploaderProps>(
  ({ folderGuid, title, inputId }, ref) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadStatus, setUploadStatus] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      getFiles: () => selectedFiles,
      clearFiles: () => {
        setSelectedFiles([]);
        setUploadStatus("");
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      uploadFiles: async () => {
        if (selectedFiles.length === 0) {
          setUploadStatus("لطفا حداقل یک فایل انتخاب کنید");
          return;
        }

        const webUrl = "https://crm.zarsim.com";
        const libraryName = "customer_checks_back";
        const fullFolderPath = `${libraryName}/${folderGuid}`;

        try {
          const contextInfo = await fetch(`${webUrl}/_api/contextinfo`, {
            method: "POST",
            headers: { Accept: "application/json;odata=verbose" },
          });
          const data = await contextInfo.json();
          const digest = data.d.GetContextWebInformation.FormDigestValue;

          // ساخت پوشه هدف در صورت نیاز
          await fetch(`${webUrl}/_api/web/folders/add('${fullFolderPath}')`, {
            method: "POST",
            headers: {
              Accept: "application/json;odata=verbose",
              "X-RequestDigest": digest,
            },
          }).catch((err) => {
            console.error("ایجاد پوشه ناموفق بود:", err.message);
          });

          let successCount = 0;

          for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const cleanFileName = file.name.replace(/[#%*<>?/\\|]/g, "_");
            const arrayBuffer = await file.arrayBuffer();

            const uploadRes = await fetch(
              `${webUrl}/_api/web/GetFolderByServerRelativeUrl('${fullFolderPath}')/Files/add(overwrite=true, url='${cleanFileName}')`,
              {
                method: "POST",
                body: arrayBuffer,
                headers: {
                  Accept: "application/json;odata=verbose",
                  "X-RequestDigest": digest,
                },
              }
            );

            if (uploadRes.ok) {
              successCount++;
            } else {
              throw new Error(`خطا در آپلود فایل ${file.name}`);
            }

            setUploadProgress(
              Math.round(((i + 1) / selectedFiles.length) * 100)
            );
          }

          if (successCount === selectedFiles.length) {
            toast.success("همه فایل‌ها با موفقیت آپلود شدند");
            setUploadStatus("آپلود موفقیت‌آمیز");
          } else {
            toast.error("برخی فایل‌ها آپلود نشدند");
            setUploadStatus("برخی فایل‌ها آپلود نشدند");
          }
        } catch (error) {
          console.error("خطا در آپلود:", error);
          toast.error("خطا در آپلود فایل‌ها");
          setUploadStatus("خطا در آپلود فایل‌ها");
          setUploadProgress(0);
        }
      },
    }));

    return (
      <div className="flex flex-col gap-3 border-2 border-primary rounded-md p-4">
        <label
          htmlFor={inputId}
          className="rounded-md p-2 bg-gray-800 text-white text-center cursor-pointer hover:bg-white hover:text-gray-800"
        >
          {title}
        </label>

        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              setSelectedFiles(Array.from(e.target.files));
              setUploadStatus("");
              setUploadProgress(0);
            }
          }}
        />

        {selectedFiles.length > 0 ? (
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center">
                <p className="text-sm font-bold">{file.name}</p>
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = selectedFiles.filter(
                      (_, i) => i !== index
                    );
                    setSelectedFiles(newFiles);
                    setUploadStatus("");
                    setUploadProgress(0);
                    if (newFiles.length === 0 && fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="w-[30px] h-[30px] flex items-center justify-center bg-red-600 text-white rounded-md text-lg font-bold hover:bg-white hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-semibold text-base-content">
            هنوز فایلی انتخاب نشده
          </p>
        )}

        {uploadStatus && (
          <div
            className={`font-bold ${
              uploadProgress === 100 ? "text-green-700" : "text-red-700"
            }`}
          >
            {uploadStatus} {uploadProgress > 0 && ` (${uploadProgress}%)`}
          </div>
        )}
      </div>
    );
  }
);

export { FileUploader };
