import { getDigest } from "./getDigest";

export async function addEditHistory(
  itemId: number,
  statusType: string,
  folderName: string
): Promise<void> {
  const webUrl = "https://portal.zarsim.com";

  try {
    // مرحله 1: گرفتن Digest

    const digest = await getDigest();

    // مرحله 2: ارسال درخواست POST به لیست
    const postResponse = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('CheckForiEditHistory')/items`,
      {
        method: "POST",
        headers: {
          Accept: "application/json;odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": digest, // 🔑 کلید طلایی
        },
        body: JSON.stringify({
          __metadata: { type: "SP.Data.CheckForiEditHistoryListItem" },
          ItemId: itemId,
          StatusType: statusType,
          FolderName: folderName, // 🔥 اضافه کردن فولدر
        }),
      }
    );

    if (!postResponse.ok) {
      throw new Error("خطا در ثبت تاریخچه");
    }

    console.log("تاریخچه با موفقیت ثبت شد");
  } catch (err) {
    console.error("خطا در ثبت تاریخچه:", err);
  }
}

export async function fetchEditHistory(
  itemId: number
): Promise<
  {
    StatusType: string;
    Editor: { Title: string };
    Modified: string;
    FolderName: string;
  }[]
> {
  const webUrl = "https://portal.zarsim.com";
  try {
    const res = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('CheckForiEditHistory')/items?$filter=ItemId eq ${itemId}&$orderby=Modified desc&$expand=Editor&$select=StatusType,Editor/Title,Modified,FolderName`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    const data = await res.json();
    return data.d.results as {
      StatusType: string;
      Editor: { Title: string };
      Modified: string;
      FolderName: string; // 🔥 باید دقیقا مثل کوئری باشه
    }[];
  } catch (err) {
    console.error("خطا در دریافت تاریخچه:", err);
    return [];
  }
}
  