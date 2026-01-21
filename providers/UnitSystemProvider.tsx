import { createContext, ReactNode, use, useState } from "react";

type UnitSystemContextType = {
  isMetric: boolean;
  toggleUnitSystem: () => void;
};

const UnitSystemContext = createContext<UnitSystemContextType | undefined>(
  undefined,
);

export const useUnitSystem = () => {
  const context = use(UnitSystemContext);
  if (!context) {
    throw new Error("useUnitSystem must be used within a UnitSystemProvider");
  }
  return context;
};

type UnitSystemProviderProps = {
  children: ReactNode;
};

export const UnitSystemProvider = ({ children }: UnitSystemProviderProps) => {
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
