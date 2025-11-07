// frontend/src/lib/utils/dashboard.ts

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

export const getHealthStatus = (value: number, thresholds: { warning: number; critical: number }): "normal" | "advertencia" | "critico" => {
  if (value >= thresholds.critical) return "critico";
  if (value >= thresholds.warning) return "advertencia";
  return "normal";
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const generateTrendData = (length: number = 7): number[] => {
  return Array.from({ length }, () => Math.floor(Math.random() * 100));
};
