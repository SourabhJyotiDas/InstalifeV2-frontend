import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch, safeJson } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      if (res.ok) {
        const data = await safeJson(res);
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth Check Error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Login failed');
    setUser(data.user);
    return data.user;
  };

  const signup = async (name, email, password, avatarSeed) => {
    const res = await apiFetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, avatarSeed }),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const res = await apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    const data = await safeJson(res);
    if (!res.ok) throw new Error(data.message || 'Profile update failed');
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
