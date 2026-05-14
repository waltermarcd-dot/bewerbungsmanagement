import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Hub from './pages/Hub';
import LebenslaufFlow from './pages/LebenslaufFlow';
import AnschreibenFlow from './pages/AnschreibenFlow';
import AdminVouchers from './pages/AdminVouchers';

const AuthenticatedApp = () => {
  const { isLoadingPublicSettings } = useAuth();

  if (isLoadingPublicSettings) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Wird geladen…</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Hub />} />
      <Route path="/lebenslauf" element={<LebenslaufFlow />} />
      <Route path="/anschreiben" element={<AnschreibenFlow />} />
      <Route path="/admin/vouchers" element={<AdminVouchers />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
