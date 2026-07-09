import { useState, useRef, useEffect } from "react";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Info,
  Smile,
  Paperclip,
  SendHorizontal,
  Check,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toJsDate, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  type ChatMessage,
  type UserProfile,
  listenToMessages,
  listenToTyping,
  listenToUser,
  markConversationRead,
  sendMessage,
  setTyping,
} from "@/lib/chat";
import { TALKO_OFFICIAL_UID } from "@/lib/firebase";
import { uploadImage } from "@/lib/upload";
import logo from "@/assets/logo.png";

const EMOJIS = ["😀", "😂", "😍", "👍", "🙏", "🎉", "🔥", "❤️", "😢", "😮", "🤔", "✌️"];

export default function ChatView() {
  const { id } = useParams<{ id: string }>();
  const { firebaseUser } = useAuth();
  const conversationId = id || "";
  const otherUid = conversationId.split("__").find((p) => p !== firebaseUser?.uid) ?? "";
  const isOfficial = otherUid === TALKO_OFFICIAL_UID;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!otherUid) return;
    return listenToUser(otherUid, setUser);
  }, [otherUid]);

  useEffect(() => {
    if (!conversationId) return;
    return listenToMessages(conversationId, setMessages);
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !otherUid) return;
    return listenToTyping(conversationId, otherUid, setIsTyping);
  }, [conversationId, otherUid]);

  useEffect(() => {
    if (!conversationId || !firebaseUser) return;
    markConversationRead(conversationId, firebaseUser.uid).catch(() => {});
  }, [conversationId, firebaseUser, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!firebaseUser || !user || !conversationId) {
    return (
      <div className="flex h-[100dvh] items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Sohbet yükleniyor...
      </div>
    );
  }

  const handleTypingChange = (value: string) => {
    setInputText(value);
    setTyping(conversationId, firebaseUser.uid, true).catch(() => {});
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      setTyping(conversationId, firebaseUser.uid, false).catch(() => {});
    }, 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isOfficial) return;
    const text = inputText.trim();
    setInputText("");
    setShowEmoji(false);
    setTyping(conversationId, firebaseUser.uid, false).catch(() => {});
    await sendMessage(conversationId, firebaseUser.uid, otherUid, { text });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || isOfficial) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      await sendMessage(conversationId, firebaseUser.uid, otherUid, { imageUrl: url });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-background relative md:border-l md:border-border">
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] pointer-events-none z-0"
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }}
      ></div>

      {/* Header */}
      <header className="h-16 px-4 flex items-center justify-between border-b border-border bg-card/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="md:hidden p-2 -ml-2 rounded-full hover:bg-secondary text-muted-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>

          <Avatar className="w-10 h-10">
            <AvatarImage src={isOfficial ? logo : user.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base leading-none" data-testid="text-chat-username">{user.username}</span>
              {(user.isVerified || isOfficial) && <BadgeCheck className="w-4 h-4 text-amber-500" />}
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {isTyping ? (
                <span className="text-primary font-medium">yazıyor...</span>
              ) : user.isOnline ? (
                <span className="text-primary font-medium">Çevrimiçi</span>
              ) : (
                `Son görülme: ${formatDate(toJsDate(user.lastSeenAt))}`
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isOfficial && (
            <>
              <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors hidden sm:block">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </>
          )}
          <button className="p-2.5 rounded-full hover:bg-secondary text-muted-foreground transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 z-10 scroll-smooth">
        {messages.length === 0 && (
          <div className="flex justify-center my-4">
            <span className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full shadow-sm">
              Henüz mesaj yok
            </span>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.senderId === firebaseUser.uid;
          const showAvatar = !isMine && (index === 0 || messages[index - 1]!.senderId !== msg.senderId);

          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} chat-bubble-enter`} data-testid={`message-${msg.id}`}>
              <div className={`flex gap-2 max-w-[85%] md:max-w-[75%] ${isMine ? "flex-row-reverse" : "flex-row"}`}>
                {!isMine && (
                  <div className="w-8 flex-shrink-0 flex items-end">
                    {showAvatar && (
                      <Avatar className="w-8 h-8 shadow-sm">
                        <AvatarImage src={isOfficial ? logo : user.avatarUrl} />
                        <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}

                <div className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}>
                  <div
                    className={`
                      relative px-4 py-2.5 shadow-sm
                      ${msg.imageUrl ? "p-1 rounded-2xl bg-transparent shadow-none" : ""}
                      ${!msg.imageUrl && isMine ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm" : ""}
                      ${!msg.imageUrl && !isMine ? "bg-card border border-border text-card-foreground rounded-2xl rounded-tl-sm" : ""}
                    `}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="Gönderilen görsel"
                        className="rounded-2xl rounded-tl-sm max-w-full h-auto object-cover border border-border shadow-sm max-h-64"
                      />
                    )}

                    {msg.text && (
                      <p className={`text-[15px] leading-relaxed break-words ${msg.imageUrl ? "mt-2 px-2 pb-1" : ""}`}>
                        {msg.text}
                      </p>
                    )}

                    <div
                      className={`
                      flex items-center gap-1 text-[11px] mt-1 select-none
                      ${msg.imageUrl ? "px-2 pb-1 text-muted-foreground justify-end" : ""}
                      ${!msg.imageUrl && isMine ? "text-primary-foreground/70 justify-end" : ""}
                      ${!msg.imageUrl && !isMine ? "text-muted-foreground justify-end" : ""}
                    `}
                    >
                      {formatDate(toJsDate(msg.createdAt))}
                      {isMine && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start chat-bubble-enter">
            <div className="flex gap-2 max-w-[85%]">
              <div className="w-8 flex-shrink-0 flex items-end">
                <Avatar className="w-8 h-8 shadow-sm">
                  <AvatarImage src={isOfficial ? logo : user.avatarUrl} />
                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-[42px]">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot"></div>
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full typing-dot"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border z-10">
        {isOfficial ? (
          <div className="bg-secondary/50 border border-border rounded-xl p-4 flex items-center justify-center gap-3 text-muted-foreground text-sm font-medium" data-testid="banner-official-account">
            <Info className="w-5 h-5" />
            <div className="flex flex-col sm:flex-row sm:gap-1 items-center">
              <span>Bu resmî Talko hesabıdır.</span>
              <span>Bu hesaba yanıt gönderilemez.</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="flex items-end gap-2 relative">
            {showEmoji && (
              <div className="absolute bottom-[60px] left-0 bg-card border border-border rounded-2xl shadow-lg p-3 grid grid-cols-6 gap-1 z-20">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addEmoji(emoji)}
                    className="text-xl p-1.5 hover:bg-secondary rounded-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 bg-secondary rounded-2xl flex items-end p-1 border border-transparent focus-within:border-primary/50 focus-within:bg-background transition-colors shadow-sm">
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="p-2.5 text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
                data-testid="button-emoji"
              >
                <Smile className="w-6 h-6" />
              </button>

              <textarea
                value={inputText}
                onChange={(e) => handleTypingChange(e.target.value)}
                placeholder="Bir mesaj yaz..."
                className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 max-h-32 min-h-[44px] text-[15px] leading-relaxed"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                data-testid="input-message"
              />

              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="p-2.5 text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors disabled:opacity-50"
                data-testid="button-attach"
              >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="h-[52px] w-[52px] bg-primary text-primary-foreground rounded-full flex items-center justify-center flex-shrink-0 shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
              data-testid="button-send"
            >
              <SendHorizontal className="w-6 h-6 ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
