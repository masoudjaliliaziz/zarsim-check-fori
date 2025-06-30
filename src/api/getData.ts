import type { CustomerItem } from "../types/apiTypes";

export async function loadItems(): Promise<CustomerItem[]> {
  const BASE_URL = "https://portal.zarsim.com";
  const listGuid = "0FC217E3-006E-4B85-A47A-4C016249C958";
  let allResults: CustomerItem[] = [];
  let nextUrl = `${BASE_URL}/_api/web/lists(guid'${listGuid}')/items`;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      });

      const data = await response.json();

      // فرض می‌کنیم data.d.results دقیقاً CustomerItem[] هست
      allResults = [...allResults, ...data.d.results];

      nextUrl = data.d.__next || null;
    }

    return allResults;
  } catch (err) {
    console.error("خطا در دریافت آیتم‌ها:", err);
    return [];
  }
}

export async function getAgents() {
  const webUrl = "https://portal.zarsim.com";
  const listGuid = "47DD699E-D73C-4D3D-82D3-FB30F84C29D7";

  try {
    const response = await fetch(
      `${webUrl}/_api/web/lists(guid'${listGuid}')/items`,
      {
        headers: {
          Accept: "application/json;odata=verbose",
        },
      }
    );

    const data = await response.json();
    return data.d.results;
  } catch (err) {
    console.error("خطا در دریافت آیتم‌ها:", err);
    return [];
  }
}

// Declare _spPageContextInfo as a global variable for TypeScript
declare const _spPageContextInfo: { webAbsoluteUrl: string };

export async function getCurrentUser() {
  const response = await fetch(
    `${_spPageContextInfo.webAbsoluteUrl}/_api/web/currentuser`,
    {
      headers: { Accept: "application/json;odata=verbose" },
      credentials: "same-origin",
    }
  );

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  const data = await response.json();
  return data.d;
}
