import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEventState] = useState(null);
  const [workstation, setWorkstationState] = useState('Poste Principal');
  const [printerName, setPrinterNameState] = useState('Imprimante Badgeuse 1');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedWs = localStorage.getItem('workstation_name');
    const savedPrinter = localStorage.getItem('printer_name');
    const savedEvent = localStorage.getItem('selected_event');

    if (savedWs) setWorkstationState(savedWs);
    if (savedPrinter) setPrinterNameState(savedPrinter);
    if (savedEvent) {
      try {
        setSelectedEventState(JSON.parse(savedEvent));
      } catch (e) {}
    }

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      connectSocket();
      // Verify token
      api.get('/auth/me')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(receivedUser));

    connectSocket();
    return receivedUser;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    disconnectSocket();
  };

  const setSelectedEvent = (event) => {
    setSelectedEventState(event);
    if (event) {
      localStorage.setItem('selected_event', JSON.stringify(event));
    } else {
      localStorage.removeItem('selected_event');
    }
  };

  const setWorkstation = (wsName) => {
    setWorkstationState(wsName);
    localStorage.setItem('workstation_name', wsName);
  };

  const setPrinterName = (pName) => {
    setPrinterNameState(pName);
    localStorage.setItem('printer_name', pName);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'ADMIN',
        selectedEvent,
        setSelectedEvent,
        workstation,
        setWorkstation,
        printerName,
        setPrinterName
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
