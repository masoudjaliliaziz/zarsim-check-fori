export interface CustomerItem {
  Title: string;
  SalesExpertAcunt_text: string;
  SalesExpert: string;
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

export interface Item {
  Id: number;
  Title: string;
  amount: string;
  dueDate: string;
  status: string;
  parent_GUID: string;
  statusType?: string;
  Created: string;
  Author: { Title: string };
  Editor: { Title: string };
  Modified: string;
  salesExpertText: string;
  salesExertName: string;
  checkNum: string;
  agentDescription: string;
}
