export async function loadItems() {
  const BASE_URL = "https://crm.zarsim.com";
  const listTitle = "customer_info";
  let allResults: unknown[] = [];
  let nextUrl = `${BASE_URL}/_api/web/lists/getbytitle('${listTitle}')/items`;

  try {
    while (nextUrl) {
      const response = await fetch(nextUrl, {
        method: "GET",
        headers: {
          Accept: "application/json;odata=verbose",
        },
      });

      const data = await response.json();

      allResults = [...allResults, ...data.d.results];

      nextUrl = data.d.__next || null;
    }

    return allResults;
  } catch (err) {
    console.error("خطا در دریافت آیتم‌ها:", err);
    return [];
  }
}
