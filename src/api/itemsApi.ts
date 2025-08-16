import { getDigest } from "./getDigest";

export interface Item {
  Id: number;
  Title: string;
  amount: string;
  status: string;
  dueDate: string;
  parent_GUID: string;
  statusType: string;
  SalesExpert: string;
  salesExertName: string;
  salesExpertText: string;
  checkNum: string;
  Created: string;
  Modified: string;
  Author: { Title: string };
  Editor: { Title: string };
}

export async function fetchAllItems(): Promise<Item[]> {
  const BASE_URL = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  let allResults: Item[] = [];
  let nextUrl =
    `${BASE_URL}/_api/web/lists/getbytitle('${listName}')/items` +
    `?$select=Id,Title,amount,status,dueDate,parent_GUID,statusType,SalesExpert,salesExertName,salesExpertText,checkNum,Created,Modified,Author/Title,Editor/Title` +
    `&$expand=Author,Editor`;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 403)
          throw new Error("شما به این لیست دسترسی ندارید.");
        if (response.status === 401) throw new Error("لطفاً وارد سیستم شوید.");
        if (response.status === 404) throw new Error("مسیر لیست اشتباه است.");
        throw new Error(`خطا در درخواست: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data?.d?.results) throw new Error("خطا در ساختار پاسخ دریافتی.");

      allResults = [...allResults, ...data.d.results];
      nextUrl = data.d.__next || null;
    }

    return allResults.sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
  } catch (err: unknown) {
    console.error("خطا:", err);
    return [];
  }
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
  statusType: string,
  agentDescription: string
): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const digest = await getDigest();
  const entityTypeName = await getListItemEntityTypeName(listName);

  const isReset = statusType.trim() === "";

  const body = {
    __metadata: { type: entityTypeName },
    statusType: isReset ? "" : statusType,
    status: isReset ? "0" : "1", //
    agentDescription: agentDescription || "",
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

export async function updateItem(item: {
  id: number;
  title: string;
  amount: string;
  dueDate: string;
  checkNum: string;
}): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const digest = await getDigest();
  const entityTypeName = await getListItemEntityTypeName(listName);

  const body = {
    __metadata: { type: entityTypeName },
    Title: item.title,
    amount: item.amount,
    dueDate: item.dueDate,
    checkNum: item.checkNum,
  };

  const res = await fetch(
    `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${item.id})`,
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
    throw new Error("خطا در بروزرسانی اطلاعات چک");
  }
}

export async function deleteItem(id: number): Promise<void> {
  const webUrl = "https://portal.zarsim.com";
  const listName = "customerChecksDocFori";
  const digest = await getDigest();

  const res = await fetch(
    `${webUrl}/_api/web/lists/getbytitle('${listName}')/items(${id})`,
    {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "IF-MATCH": "*",
        "X-HTTP-Method": "DELETE",
      },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Error response:", text);
    throw new Error("خطا در حذف چک");
  }
}
