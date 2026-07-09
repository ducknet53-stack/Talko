import { useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Edit2, LogOut, Check, X, Moon, Sun, Monitor, Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { db } from "@/lib/firebase";
import { toJsDate } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";
import { useTheme } from "@/components/theme-provider";

export default function Profile() {
  const { profile, firebaseUser, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  if (!profile || !firebaseUser) return null;

  const startEditing = () => {
    setUsername(profile.username);
    setBio(profile.bio ?? "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        username: username.trim(),
        usernameLower: username.trim().toLowerCase(),
        bio: bio.trim(),
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadImage(file);
      await updateDoc(doc(db, "users", firebaseUser.uid), { avatarUrl: url });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background md:bg-secondary/30 justify-center">
      <div className="w-full md:max-w-md bg-background flex flex-col shadow-sm border-x border-border">
        {/* Header */}
        <header className="h-16 px-4 flex items-center justify-between border-b border-border z-10 sticky top-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors" data-testid="button-back">
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
                data-testid="button-cancel-edit"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors disabled:opacity-50"
                data-testid="button-save"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="p-2 -mr-2 rounded-full hover:bg-secondary text-muted-foreground transition-colors"
              data-testid="button-edit"
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
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {profile.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]"
                data-testid="button-change-avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Edit2 className="w-6 h-6 text-white" />
                )}
              </button>
            </div>

            {!isEditing && (
              <div className="mt-4 text-center">
                <h2 className="text-2xl font-bold" data-testid="text-username">{profile.username}</h2>
                <p className="text-muted-foreground mt-1 px-4">{profile.bio}</p>
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
                    data-testid="input-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Hakkımda</Label>
                  <textarea
                    id="bio"
                    className="flex w-full rounded-xl border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    data-testid="input-bio"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {/* Stats / Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/50 rounded-2xl p-4 flex flex-col items-center justify-center border border-border/50 shadow-sm">
                    <span className="text-2xl font-bold text-primary mb-1">
                      {new Intl.DateTimeFormat("tr-TR", { month: "short", year: "numeric" }).format(toJsDate(profile.createdAt))}
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
                          {theme === "dark" ? <Moon className="w-5 h-5" /> : theme === "light" ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Görünüm Teması</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1 p-2 bg-secondary/30 rounded-xl m-1">
                        <button
                          onClick={() => setTheme("light")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === "light" ? "bg-background shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                          data-testid="button-theme-light"
                        >
                          Açık
                        </button>
                        <button
                          onClick={() => setTheme("dark")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === "dark" ? "bg-background shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                          data-testid="button-theme-dark"
                        >
                          Koyu
                        </button>
                        <button
                          onClick={() => setTheme("system")}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${theme === "system" ? "bg-background shadow-sm border border-border/50 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-background/50"}`}
                          data-testid="button-theme-system"
                        >
                          Sistem
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
