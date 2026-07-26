import { BrowserRouter, HashRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  const baseUrl = (import.meta as unknown as { env: { BASE_URL: string } }).env.BASE_URL;
  const Router = baseUrl === '/' ? BrowserRouter : HashRouter;

  return (
    <LanguageProvider>
      <Router>
        <AppRoutes />
      </Router>
    </LanguageProvider>
  );
}
