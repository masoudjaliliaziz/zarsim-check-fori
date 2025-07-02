import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { DateObject } from "react-multi-date-picker";

interface CheckFormState {
  selectedCustomer: string;
  modalOpen: boolean;
  amount: number | "";
  dueDate: DateObject | null;
  status: "تامین وجه" | "عودت چک";
  parent_GUID: string;
  salesExpertName: string | null;
  salesExpert_text: string | null;
  checkNum: string;
}

const initialState: CheckFormState = {
  selectedCustomer: "",
  modalOpen: false,
  amount: "",
  dueDate: null,
  status: "تامین وجه",
  parent_GUID: "",
  salesExpertName: null,
  salesExpert_text: null,
  checkNum: "",
};

const checkFormSlice = createSlice({
  name: "checkForm",
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<string>) => {
      state.selectedCustomer = action.payload;
    },
    setCheckNum: (state, action: PayloadAction<string>) => {
      state.checkNum = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.modalOpen = action.payload;
    },
    setAmount: (state, action: PayloadAction<number | "">) => {
      state.amount = action.payload;
    },
    setDueDate: (state, action: PayloadAction<DateObject | null>) => {
      state.dueDate = action.payload;
    },
    setStatus: (state, action: PayloadAction<"تامین وجه" | "عودت چک">) => {
      state.status = action.payload;
    },

    setParentGUID: (state, action: PayloadAction<string>) => {
      state.parent_GUID = action.payload;
    },

    setSalesExpertName: (state, action: PayloadAction<string | null>) => {
      state.salesExpertName = action.payload;
    },

    setSalesExpert_text: (state, action: PayloadAction<string | null>) => {
      state.salesExpert_text = action.payload;
    },

    resetForm: (state) => {
      state.selectedCustomer = "";
      state.amount = "";
      state.dueDate = null;
      state.status = "تامین وجه";
      state.checkNum = "";
    },
  },
});

export const {
  setSelectedCustomer,
  setModalOpen,
  setAmount,
  setDueDate,
  setStatus,
  setSalesExpertName,
  setSalesExpert_text,
  setParentGUID,
  setCheckNum,
  resetForm,
} = checkFormSlice.actions;

export default checkFormSlice.reducer;
