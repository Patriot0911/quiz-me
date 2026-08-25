import type { RootState } from '@/store';
import { createSelector } from "@reduxjs/toolkit";

export const authStatusSelector = createSelector(
  (state: RootState) => state,
  (state) => state.auth.status,
);
export const authSelector = createSelector(
  (state: RootState) => state,
  (state) => state.auth,
);
