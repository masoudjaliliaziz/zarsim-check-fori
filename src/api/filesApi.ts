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

export async function fetchStatusFiles(folderPath: string): Promise<string[]> {
  // فایل‌های داخل زیرپوشه statusDoc
  return fetchFiles(`${folderPath}/statusDoc`);
}
