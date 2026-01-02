export const getHeightInPreferredUnit = (
  heightInFeet: number | undefined | null,
  isMetric: boolean,
): string => {
  if (!heightInFeet) {
    return "?";
  }

  if (isMetric) {
    const heightInMeters = heightInFeet * 0.3048;
    return `${Math.round(heightInMeters)} meters`;
  } else {
    return `${heightInFeet} ft`;
  }
};

/**
 * Convert height from user's input unit to feet for API submission
 */
export const convertToFeet = (value: number, isMetric: boolean): number => {
  return isMetric ? Math.round(value * 3.28084) : Math.round(value);
};
