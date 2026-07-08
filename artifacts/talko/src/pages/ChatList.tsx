import { Link } from "wouter";
import { Search, Settings, Edit3, ShieldAlert, BadgeCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";
import { mockConversations, currentUser } from "@/lib/mock-data";
import logo from "@/assets/logo.png";

export default function ChatList() {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Sidebar / Conversation List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-border bg-card flex flex-col z-10 relative">
        
        {/* Header */}
        <header className="h-20 px-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                <AvatarImage src={currentUser.avatarUrl} />
                <AvatarFallback>{currentUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Sohbetler</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
            <button className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              <Edit3 className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="p-4 pb-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input 
              type="search" 
              placeholder="Ara..." 
              className="pl-10 bg-secondary/50 border-transparent focus-visible:bg-background h-10 rounded-full"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {mockConversations.map((conv, i) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <div 
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/80 cursor-pointer transition-colors group animate-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative">
                  <Avatar className="w-14 h-14 border border-border/50 shadow-sm">
                    <AvatarImage src={conv.participant.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conv.participant.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {conv.participant.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold truncate text-base">
                        {conv.participant.username}
                      </span>
                      {conv.participant.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    {conv.lastMessage && (
                      <span className={`text-xs whitespace-nowrap ml-2 ${conv.unreadCount > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                        {formatRelativeDate(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {conv.lastMessage?.text || (conv.lastMessage?.imageUrl ? "🖼️ Fotoğraf" : "")}
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge className="h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center tabular-nums">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Empty Desktop State */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-secondary/20 p-8 text-center relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-700">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-card shadow-sm border border-border flex items-center justify-center transform rotate-3">
            <img src={logo} alt="Talko" className="w-12 h-12 opacity-80 filter grayscale dark:invert" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Talko Masaüstü</h2>
          <p className="text-muted-foreground max-w-sm">
            Mesajlaşmaya başlamak için yandaki listeden bir sohbet seçin veya yeni bir sohbet başlatın.
          </p>
          <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-card px-4 py-2 rounded-full border border-border shadow-sm">
            <ShieldAlert className="w-4 h-4" />
            Mesajlarınız uçtan uca şifrelenmektedir.
          </div>
        </div>
      </div>
    </div>
  );
}
