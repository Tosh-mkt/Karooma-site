import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextType {
  hasConsent: boolean;
  preferences: ConsentPreferences | null;
  canUseAnalytics: boolean;
  canUseMarketing: boolean;
}

const ConsentContext = createContext<ConsentContextType>({
  hasConsent: false,
  preferences: null,
  canUseAnalytics: false,
  canUseMarketing: false,
});

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<ConsentPreferences | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem("karooma-cookie-consent");
    if (consent) {
      try {
        const parsed = JSON.parse(consent);
        setPreferences({
          necessary: parsed.necessary ?? true,
          analytics: parsed.analytics ?? false,
          marketing: parsed.marketing ?? false,
        });
      } catch (error) {
        console.error("Erro ao ler consent:", error);
      }
    }

    // Listener para mudanças no localStorage
    const handleStorageChange = () => {
      const newConsent = localStorage.getItem("karooma-cookie-consent");
      if (newConsent) {
        try {
          const parsed = JSON.parse(newConsent);
          setPreferences({
            necessary: parsed.necessary ?? true,
            analytics: parsed.analytics ?? false,
            marketing: parsed.marketing ?? false,
          });
        } catch (error) {
          console.error("Erro ao ler consent:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: ConsentContextType = {
    hasConsent: preferences !== null,
    preferences,
    canUseAnalytics: preferences?.analytics ?? false,
    canUseMarketing: preferences?.marketing ?? false,
  };

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
}

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};

// HOC para componentes que precisam de consent
export function withConsent<T extends object>(
  Component: React.ComponentType<T>, 
  requireAnalytics = false, 
  requireMarketing = false
) {
  return function ConsentGuardedComponent(props: T) {
    const { canUseAnalytics, canUseMarketing } = useConsent();
    
    if (requireAnalytics && !canUseAnalytics) {
      return null;
    }
    
    if (requireMarketing && !canUseMarketing) {
      return null;
    }
    
    return <Component {...props} />;
  };
}