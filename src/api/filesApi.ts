export async function fetchFiles(folderPath: string): Promise<string[]> {
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


// api/filesApi.ts

export async function deleteFile(fileUrl: string): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const relativeUrl = fileUrl.replace(webUrl, "");

  try {
    const res = await fetch(`${webUrl}/_api/web/GetFileByServerRelativeUrl('${relativeUrl}')`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": (document.getElementById("__REQUESTDIGEST") as HTMLInputElement)?.value,
        "IF-MATCH": "*", // یعنی بدون توجه به ورژن فایل حذفش کن
        "X-HTTP-Method": "DELETE",
      },
    });

    if (!res.ok) {
      throw new Error("حذف فایل با شکست مواجه شد");
    }
  } catch (err) {
    console.error("خطا در حذف فایل:", err);
    throw err;
  }
}


export async function fetchStatusFiles(folderPath: string): Promise<string[]> {
  // فایل‌های داخل زیرپوشه statusDoc
  return fetchFiles(`${folderPath}/statusDoc`);
}
