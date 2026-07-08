import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Register() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLocation("/");
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Right side - Form (swapped for variety) */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative order-2 md:order-1">
        <div className="absolute top-6 left-6 md:hidden">
          <img src={logo} alt="Talko" className="w-10 h-10" />
        </div>
        
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Kayıt Ol</h2>
            <p className="text-muted-foreground">Saniyeler içinde hesabını oluştur.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="username" 
                    type="text" 
                    placeholder="kullanici_adin" 
                    className="pl-10"
                    required
                  />
                </div>
              </div>

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
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="En az 8 karakter" 
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Hesap oluşturuluyor..." : "Kayıt Ol"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Giriş yap
            </Link>
          </div>
        </div>
      </div>

      {/* Left side - Visual/Brand */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-secondary p-12 relative overflow-hidden order-1 md:order-2">
        <div className="relative z-10 w-full max-w-sm">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
                👋
              </div>
              <div>
                <div className="font-bold text-lg">Talko Ekibi</div>
                <div className="text-muted-foreground text-sm">Az önce</div>
              </div>
            </div>
            <div className="bg-accent text-accent-foreground p-4 rounded-2xl rounded-tl-sm font-medium">
              Aramıza katılmana çok sevindik! Sohbet etmeye hazır mısın? 🚀
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
