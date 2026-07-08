import { Link, Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from "@/components/theme-provider";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ChatList from "@/pages/ChatList";
import ChatView from "@/pages/ChatView";
import Profile from "@/pages/Profile";
import { useState } from 'react';

// Layout for the main chat interface
function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* On mobile, this will render either the list OR the view depending on route */}
      {/* On desktop, we handle the split view manually in the route components if needed, or by conditionally rendering here.
          For simplicity in this visual pass, we'll let the components handle their own layout constraints. */}
      {children}
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      
      <Route path="/">
        <ChatList />
      </Route>
      
      <Route path="/chats">
        <ChatList />
      </Route>

      <Route path="/chat/:id">
        {/* On desktop, we want to show both list and view. On mobile, just view. */}
        <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
          <div className="hidden md:block w-[380px] lg:w-[420px] flex-shrink-0 z-0">
            <ChatList />
          </div>
          <div className="flex-1 w-full md:w-auto h-full z-10 bg-background shadow-[-10px_0_20px_-15px_rgba(0,0,0,0.1)] relative">
            <ChatView />
          </div>
        </div>
      </Route>

      <Route path="/profile" component={Profile} />
      
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
