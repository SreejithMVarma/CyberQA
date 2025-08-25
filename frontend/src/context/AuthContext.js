import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
const base = process.env.REACT_APP_API_URL;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchUser = async () => {
  try {
    const res = await axios.get(`${base}/api/auth/me`, { withCredentials: true });
    setUser(res.data);
  } catch (err) {
    if (err.response?.status === 401) {
      setUser(null);
    } else {
      console.error("Unexpected error fetching user:", err.response?.status, err.response?.data);
      setUser(null);
    }
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${base}/api/auth/login`, { email, password }, { withCredentials: true });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      throw err.response?.data?.message || 'Login failed';
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${base}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}