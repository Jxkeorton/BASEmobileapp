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
