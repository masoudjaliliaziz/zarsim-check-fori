import { getDigest } from "./getDigest";

export async function markAsSeen(ID: number, seenCol: string) {
  const digest = await getDigest();
  const address = "https://portal.zarsim.com";
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

  if (!res.ok) throw new Error("باشه");
}
