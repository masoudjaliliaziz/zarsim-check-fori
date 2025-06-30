import { configureStore } from "@reduxjs/toolkit";
import checkFormReducer from "../src/features/checkForm/checkFormSlice";

export const store = configureStore({
  reducer: {
    checkForm: checkFormReducer,
  },
});

// ✅ تایپ‌های گلوبال برای استفاده در پروژه
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
