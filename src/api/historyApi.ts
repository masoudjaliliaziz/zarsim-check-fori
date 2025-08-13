import { getDigest } from "./getDigest";

export async function addEditHistory(
  itemId: number,
  statusType: string,
  agentDescription: string,
  salesExpertText?: string,
  checkNum?: string
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
          agentDescription: agentDescription,
          seen: "0",
          mmoradabadiSeen: "0",
          sakbariSeen: "0",
          khajiabadiSeen: "0",
          zibaniatiSeen: "0",
          zniatiSeen: "0",
          tsaniSeen: "0",
          habediniSeen: "0",
          apazokiSeen: "0",
          checkNum,
          salesExpertText,
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

export async function fetchEditHistory(itemId: number): Promise<
  {
    StatusType: string;
    Editor: { Title: string };
    Modified: string;
    agentDescription: string;
    Author: { Title: string };
    Created: string;
  }[]
> {
  const webUrl = "https://portal.zarsim.com";
  try {
    const res = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('CheckForiEditHistory')/items?$filter=ItemId eq ${itemId}&$orderby=Modified desc&$expand=Editor,Author&$select=StatusType,Editor/Title,Author/Title,Author/Id,Author/EMail,Created,Modified,FolderName,agentDescription`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    const data = await res.json();
    return data.d.results as {
      StatusType: string;
      Editor: { Title: string };
      Modified: string;
      agentDescription: string;
      Author: { Title: string };
      Created: string;
    }[];
  } catch (err) {
    console.error("خطا در دریافت تاریخچه:", err);
    return [];
  }
}

export async function fetchAllEditHistory(): Promise<
  {
    ID: number;
    checkNum: string;
    StatusType: string;
    Editor: { Title: string };
    Modified: string;
    agentDescription: string;
    seen: string;
    khajiabadiSeen: string;
    zibaniatiSeen: string;
    zniatiSeen: string;
    tsaniSeen: string;
    habediniSeen: string;
    apazokiSeen: string;
    sakbariSeen: string;
    mmoradabadiSeen: string;
    salesExpertText: string;
  }[]
> {
  const webUrl = "https://portal.zarsim.com";
  try {
    const res = await fetch(
      `${webUrl}/_api/web/lists/getbytitle('CheckForiEditHistory')/items` +
        `?$orderby=Modified desc` +
        `&$expand=Editor` +
        `&$select=StatusType,Editor/Title,Modified,FolderName,agentDescription,seen,checkNum,ID`,
      {
        headers: { Accept: "application/json;odata=verbose" },
      }
    );

    const data = await res.json();
    return data.d.results as {
      StatusType: string;
      Editor: { Title: string };
      Modified: string;
      agentDescription: string;
      ID: number;
      checkNum: string;
      seen: string;
      khajiabadiSeen: string;
      zibaniatiSeen: string;
      zniatiSeen: string;
      tsaniSeen: string;
      habediniSeen: string;
      apazokiSeen: string;
      sakbariSeen: string;
      mmoradabadiSeen: string;
      salesExpertText: string;
    }[];
  } catch (err) {
    console.error("خطا در دریافت تاریخچه:", err);
    return [];
  }
}
