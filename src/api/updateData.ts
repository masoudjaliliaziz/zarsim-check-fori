import { getDigest } from "./getDigest";

export async function markAsSeen(ID: number, seenCol: string): Promise<void> {
  const validSeenColumns: string[] = [
    "seen",
    "khajiabadiSeen",
    "zibaniatiSeen",
    "zniatiSeen",
    "tsaniSeen",
    "habediniSeen",
    "apazokiSeen",
    "sakbariSeen",
    "mmoradabadiSeen",
  ];

  if (!validSeenColumns.includes(seenCol)) {
    console.error("Invalid seenCol:", seenCol);
    throw new Error(`فیلد نامعتبر: ${seenCol}`);
  }

  const digest = await getDigest();
  const address = "https://portal.zarsim.com";

  console.log("MarkAsSeen - ID:", ID, "seenCol:", seenCol); // لاگ برای دیباگ

  const res = await fetch(
    `${address}/_api/web/lists/getbytitle('CheckForiEditHistory')/items(${ID})`,
    {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
        "X-HTTP-Method": "MERGE",
        "IF-MATCH": "*",
      },
      body: JSON.stringify({
        __metadata: { type: "SP.Data.CheckForiEditHistoryListItem" },
        [seenCol]: "1",
      }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Error in markAsSeen:", errorText);
    throw new Error(`خطا در به‌روزرسانی اعلان: ${errorText}`);
  }
}