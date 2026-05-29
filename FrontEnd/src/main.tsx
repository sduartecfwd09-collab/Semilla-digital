import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './components/context/AuthContext';
import { CartProvider } from './components/context/CartContext';
import { ThemeProvider } from './components/context/ThemeContext';
import { PreferencesProvider } from './components/context/PreferencesContext';


const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ThemeProvider>
        <PreferencesProvider>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </PreferencesProvider>
      </ThemeProvider>
    </StrictMode>

  );
}


