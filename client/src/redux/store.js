import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import { saveState, loadState } from './localStorage';

const preloadedState = loadState();

export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState,
});

store.subscribe(() => {
  saveState(store.getState());
});
