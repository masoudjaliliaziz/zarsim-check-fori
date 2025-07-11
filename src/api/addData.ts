import toast from "react-hot-toast";
import { getDigest } from "./getDigest";

type Doc = {
  amount: string;
  status: string;
  dueDate: string;
  parent_GUID: string;
  title: string;
  salesExpert_text: string;
  salesExpertName: string;
  checkNum: string;
};

export async function handleAddTestItem(data: Doc) {
  const listName = "customerChecksDocFori";
  const itemType = "SP.Data.CustomerChecksDocForiListItem";
  const webUrl = "https://portal.zarsim.com";

  if (!data.amount && !data.dueDate && !data.status) {
    // setState({ message: "لطفاً یک عنوان وارد کنید." });
    toast("لطفاً همه عنوانین را وارد کنید.");
    return;
  }

  try {
    const digest = await getDigest();

    await fetch(`${webUrl}/_api/web/lists/getbytitle('${listName}')/items`, {
      method: "POST",
      headers: {
        Accept: "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest,
      },
      body: JSON.stringify({
        __metadata: { type: itemType },
        Title: String(data.title),
        amount: String(data.amount),
        status: String(data.status),
        dueDate: String(data.dueDate),
        salesExpertText: String(data.salesExpert_text),
        parent_GUID: data.parent_GUID,
        salesExertName: String(data.salesExpertName),
        checkNum: String(data.checkNum),
      }),
    });

    // setState({ message: `آیتم جدید (${title}) به لیست چک‌ها اضافه شد.`, title: "" });
    // onReload();
  } catch (err) {
    if (err instanceof Error) {
      console.error("خطا:", err.message);
    } else {
      console.error("خطای ناشناس:", err);
    }
  }
}
