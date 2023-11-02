import React, { createContext, useContext, useState } from 'react';

const UnitSystemContext = createContext();

export const useUnitSystem = () => {
  return useContext(UnitSystemContext);
};

export const UnitSystemProvider = ({ children }) => {
  const [isMetric, setIsMetric] = useState(true);

  const toggleUnitSystem = () => {
    setIsMetric((prev) => !prev);
  };

  return (
    <UnitSystemContext.Provider value={{ isMetric, toggleUnitSystem }}>
      {children}
    </UnitSystemContext.Provider>
  );
};
