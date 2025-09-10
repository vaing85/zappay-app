import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { storage } from '../utils/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import your reducers here
// import authReducer from './slices/authSlice';
// import paymentReducer from './slices/paymentSlice';
// import notificationReducer from './slices/notificationSlice';

const persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  // auth: persistReducer(persistConfig, authReducer),
  // payment: paymentReducer,
  // notification: notificationReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;