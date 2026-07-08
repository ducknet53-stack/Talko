import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Edit2, LogOut, Check, X, Moon, Sun, Monitor } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUser } from "@/lib/mock-data";
import { useTheme } from "@/components/theme-provider";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || "");
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    // Mock save
    setIsEditing(false);
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background md:bg-secondary/30 justify-center">
      <div className="w-full md:max-w-md bg-background flex flex-col shadow-sm border-x border-border">
        
        {/* Header */}
        <header className="h-16 px-4 flex items-center justify-between border-b border-border z-10 sticky top-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Profil</h1>
          </div>
          
          {isEditing ? (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 -mr-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center py-10 px-6 bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
            <div className="relative group">
              <Avatar className="w-28 h-28 border-4 border-background shadow-md">
                <AvatarImage src={currentUser.avatarUrl} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                  <Edit2 className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
            
            {!isEditing && (
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold">{username}</h2>
                <p className="text-muted-foreground mt-1 px-4">{bio}</p>
              </div>
            )}
          </div>

          {/* Edit Form or Info details */}
          <div className="p-6 space-y-8">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input 
                    id="username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Hakkımda</Label>
                  <textarea 
                    id="bio"
                    className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Stats / Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                    <span className="text-2xl font-bold text-primary mb-1">
                      {new Intl.DateTimeFormat('tr-TR', { month: 'short', year: 'numeric' }).format(currentUser.createdAt)}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Katılım</span>
                  </div>
                  <div className="bg-secondary/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xl font-bold text-foreground">Aktif</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Durum</span>
                  </div>
                </div>

                {/* Settings Section */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">Uygulama Ayarları</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-card border border-border rounded-2xl p-1 shadow-sm">
                      <div className="flex items-center p-3 gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {theme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'light' ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Görünüm Teması</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 p-2 bg-secondary/30 rounded-xl m-1">
                        <button 
                          onClick={() => setTheme("light")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === 'light' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                        >
                          Açık
                        </button>
                        <button 
                          onClick={() => setTheme("dark")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === 'dark' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                        >
                          Koyu
                        </button>
                        <button 
                          onClick={() => setTheme("system")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === 'system' ? 'bg-background shadow-sm border border-border/50 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'}`}
                        >
                          Sistem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/login">
                    <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
