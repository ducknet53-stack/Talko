import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Splash({ onFinish }: { onFinish: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 300); // Wait for fade out
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-700">
        <div className="relative">
          <img src={logo} alt="Talko Logo" className="w-24 h-24 object-contain drop-shadow-xl" />
        </div>
        
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium tracking-wide">Yükleniyor...</p>
        </div>
      </div>
    </div>
  );
}
