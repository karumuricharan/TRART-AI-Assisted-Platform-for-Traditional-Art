import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import GenerateArt from "./pages/GenerateArt";
import AIPreview from "./pages/AIPreview";
import SelectArtist from "./pages/SelectArtist";
import Orders from "./pages/Orders";
import ArtistDashboard from "./pages/ArtistDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && profile?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, profile } = useAuth();
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to={profile?.role === 'artist' ? '/artist-dashboard' : '/dashboard'} replace /> : <Landing />
      } />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
      <Route path="/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/generate-art" element={<ProtectedRoute role="customer"><GenerateArt /></ProtectedRoute>} />
      <Route path="/ai-preview" element={<ProtectedRoute role="customer"><AIPreview /></ProtectedRoute>} />
      <Route path="/select-artist" element={<ProtectedRoute role="customer"><SelectArtist /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute role="customer"><Orders /></ProtectedRoute>} />
      <Route path="/artist-dashboard" element={<ProtectedRoute role="artist"><ArtistDashboard /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
