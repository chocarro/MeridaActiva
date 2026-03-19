import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './componentes/Navbar';
import Footer from './componentes/Footer';
import AppRoutes from './Routes';
import CookieBanner from './componentes/CookieBanner';
import { Toaster } from 'react-hot-toast';
import OfflineBanner from './componentes/OfflineBanner';
import { Analytics } from '@vercel/analytics/react';

// Rutas donde NO se muestra el footer (páginas de autenticación)
const RUTAS_SIN_FOOTER = ['/login', '/registro', '/reset-password'];

function FooterCondicional() {
  const { pathname } = useLocation();
  if (RUTAS_SIN_FOOTER.includes(pathname)) return null;
  return <Footer />;
}

function NavbarCondicional() {
  const { pathname } = useLocation();
  if (RUTAS_SIN_FOOTER.includes(pathname)) return null;
  return <Navbar />;
}

function App() {
  useEffect(() => {
    const applyTheme = () => {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(); // Ejecutar 1 vez al montar

    // Escuchar cambios de preferencia del sistema en vivo
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  return (
    <AuthProvider>
      <div className="main-layout">
        <OfflineBanner />
        <NavbarCondicional />
        <main id="main-content" className="content-area">
          <AppRoutes />
        </main>
        <FooterCondicional />
        <CookieBanner />
        <Analytics />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#032B43',
              color: '#FAFAFA',
              fontWeight: 700,
              fontSize: '12px',
              letterSpacing: '0.05em',
              borderRadius: '1rem',
              padding: '12px 20px',
            },
            success: {
              iconTheme: { primary: '#FFBA08', secondary: '#032B43' },
            },
            error: {
              iconTheme: { primary: '#D00000', secondary: '#FAFAFA' },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;