import { Link, Redirect, Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from "@/components/theme-provider";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ChatList from "@/pages/ChatList";
import ChatView from "@/pages/ChatView";
import Profile from "@/pages/Profile";
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <SplashFallback />;
  if (!firebaseUser) return <Redirect to="/login" />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <SplashFallback />;
  if (firebaseUser) return <Redirect to="/" />;
  return <>{children}</>;
}

function SplashFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function Router() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Switch>
      <Route path="/login">
        <RedirectIfAuthed>
          <Login />
        </RedirectIfAuthed>
      </Route>
      <Route path="/register">
        <RedirectIfAuthed>
          <Register />
        </RedirectIfAuthed>
      </Route>
      <Route path="/forgot-password">
        <RedirectIfAuthed>
          <ForgotPassword />
        </RedirectIfAuthed>
      </Route>

      <Route path="/">
        <RequireAuth>
          <ChatList />
        </RequireAuth>
      </Route>

      <Route path="/chats">
        <RequireAuth>
          <ChatList />
        </RequireAuth>
      </Route>

      <Route path="/chat/:id">
        <RequireAuth>
          <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
            <div className="hidden md:block w-[380px] lg:w-[420px] flex-shrink-0 z-0">
              <ChatList />
            </div>
            <div className="flex-1 w-full md:w-auto h-full z-10 bg-background shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)] relative">
              <ChatView />
            </div>
          </div>
        </RequireAuth>
      </Route>

      <Route path="/profile">
        <RequireAuth>
          <Profile />
        </RequireAuth>
      </Route>

      <Route>
        <div className="flex h-[100dvh] items-center justify-center flex-col gap-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Sayfa bulunamadı.</p>
          <Link href="/" className="text-primary hover:underline">Ana sayfaya dön</Link>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="talko-ui-theme">
      <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ""}>
        <Router />
      </WouterRouter>
    </ThemeProvider>
  );
}

export default App;
