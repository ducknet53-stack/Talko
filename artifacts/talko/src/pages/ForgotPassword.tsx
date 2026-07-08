import { useState } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Send } from "lucide-react";
import logo from "@/assets/logo.png";

export default function ForgotPassword() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background p-6 relative">
      <div className="absolute top-6 left-6">
        <Link href="/login" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri dön
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="Talko" className="w-16 h-16" />
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <Send className="w-10 h-10 ml-1" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Bağlantı Gönderildi</h2>
              <p className="text-muted-foreground">
                Şifre sıfırlama bağlantısını e-posta adresine gönderdik. Lütfen gelen kutunu kontrol et.
              </p>
            </div>
            <Link href="/login" className="inline-block mt-4">
              <Button variant="outline" className="w-full">
                Giriş sayfasına dön
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight">Şifremi Unuttum</h2>
              <p className="text-muted-foreground">
                Hesabına kayıtlı e-posta adresini gir, sana sıfırlama bağlantısı gönderelim.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
