import { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext(null);

export const PWAProvider = ({ children }) => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      console.log('PWA: Install prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      console.log('PWA: System successfully installed');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const showInstallPrompt = async () => {
    if (!installPrompt) return false;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`PWA: User response to install prompt: ${outcome}`);
    
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      return true;
    }
    return false;
  };

  return (
    <PWAContext.Provider value={{ installPrompt, isInstalled, showInstallPrompt }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);
