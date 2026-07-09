import { useState } from "react";
import { Link, useLocation } from "wouter";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";
import { auth } from "@/lib/firebase";

function mapAuthError(code: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/invalid-email":
      return "Geçerli bir e-posta adresi gir.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar dene.";
    default:
      return "Giriş yapılamadı. Lütfen tekrar dene.";
  }
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLocation("/");
    } catch (err: any) {
      setError(mapAuthError(err?.code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Left side - Visual/Brand */}
      <div className="hidden md:flex flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>

        <div className="relative z-10">
          <img src={logo} alt="Talko" className="w-16 h-16 mb-4 filter brightness-0 invert" />
          <h1 className="text-4xl font-bold mb-2">Hızlı. Güvenli. Net.</h1>
          <p className="text-primary-foreground/80 text-lg max-w-md">
            Gereksiz detaylardan arınmış, sadece iletişime odaklanan yeni nesil mesajlaşma deneyimi.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-sm font-medium">
          <ShieldCheck className="w-5 h-5" />
          Uçtan uca şifreli iletişim
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 left-6 md:hidden">
          <img src={logo} alt="Talko" className="w-10 h-10" />
        </div>

        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Hoş geldin</h2>
            <p className="text-muted-foreground">Hesabına giriş yap ve sohbete başla.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="form-login">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@posta.com"
                    className="pl-10"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Şifre</Label>
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Şifremi unuttum
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="input-password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive" data-testid="text-error">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading} data-testid="button-submit">
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Hesabın yok mu?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Yeni hesap oluştur
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
