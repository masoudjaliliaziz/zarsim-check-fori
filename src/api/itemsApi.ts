import type { Item } from "../types/apiTypes";
import { getDigest } from "./getDigest";

export async function fetchAllItems(): Promise<Item[]> {
  const BASE_URL = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const url = `${BASE_URL}/_api/web/lists/getbytitle('${listName}')/items?$select=Id,Title,amount,dueDate,status,parent_GUID,salesExertName,salesExpertText,statusType,Created,Author/Title,Modified,Editor/Title&$expand=Author,Editor`;
  const res = await fetch(url, {
    headers: { Accept: "application/json;odata=verbose" },
  });
  if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
  const data = await res.json();
  return (data.d.results as Item[]).sort(
    (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
  );
}

declare const _spPageContextInfo: {
  webAbsoluteUrl: string;
  [key: string]: unknown;
};

export async function getCurrentUser(): Promise<string> {
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

export async function updateItemStatus(
  id: number,
  statusType: string
): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const digest = await getDigest();
  const entityTypeName = await getListItemEntityTypeName(listName);

  const isReset = statusType.trim() === "";

  const body = {
    __metadata: { type: entityTypeName },
    statusType: isReset ? "" : statusType,
    status: isReset ? "0" : "1", // 👈 اینجا شرطی کردیم
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

export async function getListItemEntityTypeName(
  listName: string
): Promise<string> {
  const webUrl = "https://portal.zarsim.com";
  const url = `${webUrl}/_api/web/lists/getbytitle('${listName}')?$select=ListItemEntityTypeFullName`;
  const res = await fetch(url, {
    headers: { Accept: "application/json;odata=verbose" },
  });
  if (!res.ok) throw new Error("خطا در دریافت نوع موجودیت لیست");
  const data = await res.json();
  return data.d.ListItemEntityTypeFullName;
}
