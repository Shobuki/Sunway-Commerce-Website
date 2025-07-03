import React, { createContext, useState, useContext, useCallback } from "react";

const ErrorContext = createContext();

export function useError() {
  return useContext(ErrorContext);
}

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  // Fungsi untuk set error dari interceptor
  const showError = useCallback((msg) => {
    setError(msg);
  }, []);

  // Reset popup
  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}
