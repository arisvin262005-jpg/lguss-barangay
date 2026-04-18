import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Top loading bar that plays on every route change
export default function PageLoader() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    setProgress(10);

    const t1 = setTimeout(() => setProgress(40), 80);
    const t2 = setTimeout(() => setProgress(70), 200);
    const t3 = setTimeout(() => setProgress(90), 350);
    const t4 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => { setVisible(false); setProgress(0); }, 300);
    }, 500);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: `${progress}%`,
      height: 3,
      background: 'linear-gradient(90deg, #2563eb, #60a5fa, #e8a020)',
      zIndex: 9999,
      transition: 'width 0.25s ease',
      borderRadius: '0 3px 3px 0',
      boxShadow: '0 0 10px rgba(37,99,235,0.5)',
    }} />
  );
}
