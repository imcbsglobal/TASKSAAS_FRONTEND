import { createSlice } from '@reduxjs/toolkit';

const Localuser = JSON.parse(localStorage.getItem('user'));
const initialState = {
    user: Localuser || null,
    isAuthenticated: !!Localuser,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.user = action.payload;   // e.g. { id, name, email }
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
