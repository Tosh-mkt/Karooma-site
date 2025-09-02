/**
 * Utilidades para lidar com cache do browser e forçar atualizações
 */

// Gerar timestamp único para cache-busting
export const getCacheBuster = (): string => {
  return `v=${Date.now()}`;
};

// Forçar reload completo do site (bypass cache)
export const forceReload = (): void => {
  // Usar timestamp para forçar bypass do cache
  const url = new URL(window.location.href);
  url.searchParams.set('cache_bust', Date.now().toString());
  
  // Reload hard (bypass cache)
  window.location.replace(url.toString());
};

// Limpar todo o localStorage e sessionStorage
export const clearAllStorage = (): void => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar cache do service worker se existir
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }
    
    console.log('Storage limpo com sucesso');
  } catch (error) {
    console.error('Erro ao limpar storage:', error);
  }
};

// Detectar se o site está sendo carregado de cache antigo
export const detectStaleCache = (): boolean => {
  const buildTime = document.querySelector('meta[name="build-time"]')?.getAttribute('content');
  const lastBuildTime = localStorage.getItem('last_build_time');
  
  if (buildTime && lastBuildTime && buildTime !== lastBuildTime) {
    localStorage.setItem('last_build_time', buildTime);
    return true; // Cache antigo detectado
  }
  
  if (buildTime && !lastBuildTime) {
    localStorage.setItem('last_build_time', buildTime);
  }
  
  return false;
};

// Auto-refresh em caso de cache antigo
export const handleStaleCache = (): void => {
  if (detectStaleCache()) {
    console.log('Cache antigo detectado. Atualizando...');
    clearAllStorage();
    setTimeout(() => forceReload(), 1000);
  }
};