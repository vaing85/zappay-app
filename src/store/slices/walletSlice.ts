import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../types/User';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  loading: boolean;
}

const initialState: WalletState = {
  balance: 0,
  transactions: [],
  loading: false,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setBalance, addTransaction, setLoading } = walletSlice.actions;
export default walletSlice.reducer;
