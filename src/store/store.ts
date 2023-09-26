import { configureStore } from "@reduxjs/toolkit";
import attributesSlice from "./attributeSlice";

const store = configureStore({
  reducer: {
    attribute: attributesSlice.reducer,
  },
});

export const attributeActions = attributesSlice.actions;
export default store;
