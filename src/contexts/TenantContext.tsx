import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Represents the structure of a University (Tenant)
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  primaryColor: string;
  logoUrl: string;
}

export const MOCK_TENANTS: Tenant[] = [
  { id: 'uuid-1234', name: 'EventSphere', domain: 'eventsphere.com', primaryColor: '#8b5cf6', logoUrl: '' },
  { id: 'uuid-5678', name: 'MIT', domain: 'mit.eventsphere.com', primaryColor: '#ef4444', logoUrl: '' },
  { id: 'uuid-9012', name: 'Harvard University', domain: 'harvard.eventsphere.com', primaryColor: '#b91c1c', logoUrl: '' },
];

interface TenantContextType {
  currentTenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenant = async () => {
      setIsLoading(true);
      try {
        // Simulated API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Default to the first mock tenant
        setCurrentTenant(MOCK_TENANTS[0]);
      } catch (error) {
        console.error("Failed to load tenant", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenant();
  }, []);

  // Dynamically apply the tenant's primary color to the CSS variables
  useEffect(() => {
    if (currentTenant?.primaryColor) {
      document.documentElement.style.setProperty('--tenant-primary', currentTenant.primaryColor);
    } else {
      document.documentElement.style.removeProperty('--tenant-primary');
    }
  }, [currentTenant]);

  return (
    <TenantContext.Provider value={{ currentTenant, isLoading, setTenant: setCurrentTenant }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
