import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Settings, Edit3, ShieldAlert, BadgeCheck, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toJsDate, formatRelativeDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  type Conversation,
  type UserProfile,
  ensureConversation,
  listenToConversations,
  listenToUser,
  searchUsers,
} from "@/lib/chat";
import { TALKO_OFFICIAL_UID } from "@/lib/firebase";
import logo from "@/assets/logo.png";

function otherParticipant(conv: Conversation, myUid: string) {
  return conv.participants.find((p) => p !== myUid) ?? conv.participants[0];
}

function ConversationRow({
  conv,
  myUid,
  index,
}: {
  conv: Conversation;
  myUid: string;
  index: number;
}) {
  const otherUid = otherParticipant(conv, myUid);
  const [other, setOther] = useState<UserProfile | null>(null);

  useEffect(() => listenToUser(otherUid, setOther), [otherUid]);

  const isOfficial = otherUid === TALKO_OFFICIAL_UID;
  const unread = conv.unreadCount?.[myUid] ?? 0;

  return (
    <Link href={`/chat/${conv.id}`}>
      <div
        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/80 cursor-pointer transition-colors group animate-in slide-in-from-bottom-2"
        style={{ animationDelay: `${index * 50}ms` }}
        data-testid={`row-conversation-${conv.id}`}
      >
        <div className="relative">
          <Avatar className="w-14 h-14 border border-border/50 shadow-sm">
            {isOfficial ? (
              <AvatarImage src={logo} />
            ) : (
              <AvatarImage src={other?.avatarUrl} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary">
              {(other?.username ?? "?").substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {other?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold truncate text-base">
                {other?.username ?? "..."}
              </span>
              {(other?.isVerified || isOfficial) && (
                <BadgeCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
            {conv.lastMessageAt && (
              <span
                className={`text-xs whitespace-nowrap ml-2 ${unread > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {formatRelativeDate(toJsDate(conv.lastMessageAt))}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p
              className={`text-sm truncate ${unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
            >
              {conv.lastMessageText}
            </p>
            {unread > 0 && (
              <Badge className="h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center tabular-nums">
                {unread}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function NewChatDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { firebaseUser } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<UserProfile[]>([]);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!firebaseUser) return;
    const handle = setTimeout(async () => {
      if (!q.trim()) return setResults([]);
      const users = await searchUsers(q, firebaseUser.uid);
      setResults(users);
    }, 250);
    return () => clearTimeout(handle);
  }, [q, firebaseUser]);

  const startChat = async (userId: string) => {
    if (!firebaseUser) return;
    const id = await ensureConversation(firebaseUser.uid, userId);
    onOpenChange(false);
    setQ("");
    setLocation(`/chat/${id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="dialog-new-chat">
        <DialogHeader>
          <DialogTitle>Yeni Sohbet</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            autoFocus
            placeholder="Kullanıcı adı ara..."
            className="pl-10"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="input-search-users"
          />
        </div>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {results.map((u) => (
            <button
              key={u.id}
              onClick={() => startChat(u.id)}
              className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary text-left transition-colors"
              data-testid={`option-user-${u.id}`}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={u.avatarUrl} />
                <AvatarFallback>{u.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{u.username}</span>
            </button>
          ))}
          {q.trim() && results.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Kullanıcı bulunamadı.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ChatList() {
  const { firebaseUser, profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    return listenToConversations(firebaseUser.uid, setConversations);
  }, [firebaseUser]);

  const filtered = useMemo(() => conversations, [conversations]);

  if (!firebaseUser) return null;

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      {/* Sidebar / Conversation List */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex-shrink-0 border-r border-border bg-card flex flex-col z-10 relative">
        {/* Header */}
        <header className="h-20 px-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <Link href="/profile">
              <Avatar className="w-10 h-10 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all" data-testid="link-profile">
                <AvatarImage src={profile?.avatarUrl} />
                <AvatarFallback>{(profile?.username ?? "?").substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <h1 className="text-xl font-bold tracking-tight">Sohbetler</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile">
              <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" data-testid="button-settings">
                <Settings className="w-5 h-5" />
              </button>
            </Link>
            <button
              onClick={() => setNewChatOpen(true)}
              className="p-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              data-testid="button-new-chat"
            >
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1">
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-10">Henüz bir sohbetin yok.</p>
          )}
          {filtered.map((conv, i) => (
            <ConversationRow key={conv.id} conv={conv} myUid={firebaseUser.uid} index={i} />
          ))}
        </div>
      </div>

      {/* Empty Desktop State */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-secondary/20 p-8 text-center relative">
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

      <NewChatDialog open={newChatOpen} onOpenChange={setNewChatOpen} />
    </div>
  );
}
