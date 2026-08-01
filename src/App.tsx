import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LocaleProvider } from "@/i18n";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import FloatingAudioPlayer from "@/components/FloatingAudioPlayer";
import PageTransitionLoader from "@/components/PageTransitionLoader";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { initVersionCheck } from "@/lib/versionCheck";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import AuthCheckEmail from "./pages/AuthCheckEmail.tsx";
import AuthReset from "./pages/AuthReset.tsx";
import Feed from "./pages/Feed.tsx";
import Admin from "./pages/Admin.tsx";
import About from "./pages/About.tsx";
import Donate from "./pages/Donate.tsx";
import Community from "./pages/Community.tsx";
import Account from "./pages/Account.tsx";
import Profile from "./pages/Profile.tsx";
import TeachingDetail from "./pages/TeachingDetail.tsx";
import Collections from "./pages/Collections.tsx";
import Notifications from "./pages/Notifications.tsx";
import Search from "./pages/Search.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => {
  // Initialize version checking on app load
  useEffect(() => {
    initVersionCheck();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageTransitionLoader />
            <AuthProvider>
              <LocaleProvider>
                <AudioPlayerProvider>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/check-email" element={<AuthCheckEmail />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/reset" element={<AuthReset />} />
                    <Route path="/oauth/consent" element={<AuthCallback />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/teachings/:id" element={<TeachingDetail />} />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/donate" element={<Donate />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/search" element={<Search />} />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/collections"
                      element={
                        <ProtectedRoute>
                          <Collections />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly>
                          <Admin />
                        </ProtectedRoute>
                      }
                    />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <FloatingAudioPlayer />
                </AudioPlayerProvider>
              </LocaleProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
