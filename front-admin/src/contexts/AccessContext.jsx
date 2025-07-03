import React, { createContext, useContext, useState, useEffect } from "react";
export const AccessContext = createContext();

export const AccessProvider = ({ children }) => {
  const [failedAccess, setFailedAccess] = useState(false);
  const [failMsg, setFailMsg] = useState("");
  const [failDetailMsg, setFailDetailMsg] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.setFailDetailMsg = setFailDetailMsg;
      window.setFailedAccess = setFailedAccess;
      window.setFailMsg = setFailMsg;
    }
  }, []);

  return (
    <AccessContext.Provider value={{ failedAccess, setFailedAccess, failMsg, setFailMsg, failDetailMsg, setFailDetailMsg }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => useContext(AccessContext);
