import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authAPI from '../api/auth';

const initialState = {
  user: null,
  isAuthenticated: false,
  verificationStatus: null,
  loading: false,
  error: null,
  initialized: false,
};

// Async Thunks
export const signup = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authAPI.signupAPI(userData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authAPI.loginAPI(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logoutAPI();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getMeAPI();
      return data.user;
    } catch (error) {
      return rejectWithValue('Not authenticated');
    }
  }
);

export const fetchVerificationStatus = createAsyncThunk(
  'auth/fetchVerificationStatus',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getVerificationStatusAPI();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to fetch');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.verificationStatus = action.payload.user?.verificationStatus || 'PENDING';
        state.initialized = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.verificationStatus = action.payload.user?.verificationStatus || 'PENDING';
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.initialized = true;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.verificationStatus = null;
        state.error = null;
        state.initialized = true;
      })
      
      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.verificationStatus = action.payload?.verificationStatus || 'PENDING';
        state.initialized = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.verificationStatus = null;
        state.initialized = true;
      })
      
      // Fetch Verification Status
      .addCase(fetchVerificationStatus.fulfilled, (state, action) => {
        state.verificationStatus = action.payload.verificationStatus || 'PENDING';
        if (state.user) {
          state.user.verificationStatus = action.payload.verificationStatus || 'PENDING';
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
