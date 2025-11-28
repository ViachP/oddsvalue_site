// src/utils/deviceUtils.ts

export interface DeviceData {
  screen_res: string;
  timezone: string;
  hardware: string;
  memory: string;
}

export const collectDeviceData = (): DeviceData => {
  // Используем any чтобы обойти проверку типов
  const nav = navigator as any;
  
  return {
    screen_res: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardware: navigator.hardwareConcurrency?.toString() || '',
    memory: nav.deviceMemory?.toString() || ''
  };
};

// Функция для добавления device data к любому объекту данных
export const withDeviceData = <T extends object>(data: T): T & DeviceData => {
  return {
    ...data,
    ...collectDeviceData()
  };
};
