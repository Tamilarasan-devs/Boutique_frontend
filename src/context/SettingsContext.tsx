import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';

interface CompanySettings {
  id?: number;
  name: string;
  tagline: string;
  email: string;
  phone: string;
  gst: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  website: string;
  currency: string;
  invoice_prefix: string;
}

interface SettingsContextType {
  companySettings: CompanySettings | null;
  refreshSettings: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  companySettings: null,
  refreshSettings: async () => {},
  isLoading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await settingsApi.getCompanyProfile();
      setCompanySettings(data);
    } catch (err) {
      console.error('Failed to fetch company settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ companySettings, refreshSettings: fetchSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
