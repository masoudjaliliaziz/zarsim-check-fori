export interface CustomerItem {
  Seller: string;
}

export interface AgentItem {
  Title: string;
  ID: number;
  // فیلدهای دیگه‌ای که داری رو هم می‌تونی اضافه کنی
}

export interface SharePointUser {
  Id: number;
  Title: string;
  LoginName: string;
  Email: string;
}

export interface AddCheckData {
  amount: string;
  status: string;
  dueDate: string;
  parent_GUID: string;
}
