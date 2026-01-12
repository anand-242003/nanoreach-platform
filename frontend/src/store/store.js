import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import campaignReducer from './slices/campaignSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    campaigns: campaignReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
