// ErrorContext.js
import React, { createContext, useState, useContext, useCallback } from "react";

const ErrorContext = createContext();

export function useError() {
  return useContext(ErrorContext);
}

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  // ⛔ FILTER juga DI SINI!
  const showError = useCallback((msg) => {
    const denyPattern = /(request|status|500|internal|server\s*error|request\s*failed)/i;
    if (denyPattern.test(msg)) return;  // << SKIP error tertentu
    setError(msg);
  }, []);

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error, showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}
