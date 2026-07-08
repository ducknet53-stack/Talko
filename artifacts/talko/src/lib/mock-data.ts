export type User = {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  isOnline: boolean;
  lastSeenAt: Date;
  isVerified?: boolean;
};

export type Message = {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  createdAt: Date;
  isRead: boolean;
};

export type Conversation = {
  id: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
};

const CURRENT_USER_ID = "u_me";

export const currentUser: User = {
  id: CURRENT_USER_ID,
  username: "deniz_yilmaz",
  bio: "Tasarım ve kodlama. Kahve bağımlısı.",
  createdAt: new Date("2023-01-15"),
  isOnline: true,
  lastSeenAt: new Date(),
};

export const talkoOfficialUser: User = {
  id: "u_talko",
  username: "Talko",
  isVerified: true,
  bio: "Resmî Talko hesabı. Güncellemeler ve duyurular.",
  createdAt: new Date("2023-01-01"),
  isOnline: true,
  lastSeenAt: new Date(),
  avatarUrl: "/src/assets/logo.png"
};

export const mockUsers: Record<string, User> = {
  "u_1": {
    id: "u_1",
    username: "ahmet_k",
    bio: "Sadece acil durumlar.",
    createdAt: new Date("2023-02-10"),
    isOnline: true,
    lastSeenAt: new Date(),
    avatarUrl: "https://i.pravatar.cc/150?u=ahmet_k"
  },
  "u_2": {
    id: "u_2",
    username: "zeynep.c",
    bio: "Hayat kısa, kuşlar uçuyor.",
    createdAt: new Date("2023-03-05"),
    isOnline: false,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    avatarUrl: "https://i.pravatar.cc/150?u=zeynep"
  },
  "u_3": {
    id: "u_3",
    username: "caner_dev",
    createdAt: new Date("2023-04-12"),
    isOnline: false,
    lastSeenAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
  "u_talko": talkoOfficialUser,
};

export const mockMessages: Record<string, Message[]> = {
  "c_talko": [
    {
      id: "m_t_1",
      senderId: "u_talko",
      text: "Talko'ya hoş geldin! 🎉 İletişimin en hızlı ve güvenli yolu. Uygulamayı keşfetmeye hemen başlayabilirsin.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      isRead: true,
    },
    {
      id: "m_t_2",
      senderId: "u_talko",
      text: "Yeni özellik: Artık karanlık mod çok daha şık! Profil ayarlarından temayı değiştirebilirsin.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      isRead: false,
    }
  ],
  "c_1": [
    {
      id: "m_1_1",
      senderId: CURRENT_USER_ID,
      text: "Selam Ahmet, yarınki toplantı saat kaçtaydı?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      isRead: true,
    },
    {
      id: "m_1_2",
      senderId: "u_1",
      text: "Selam, 14:00'te başlayacağız. Sunumu hazırladın mı?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      isRead: true,
    },
    {
      id: "m_1_3",
      senderId: CURRENT_USER_ID,
      text: "Evet, bitmek üzere. Birkaç grafik daha ekleyeceğim.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      isRead: true,
    },
    {
      id: "m_1_4",
      senderId: "u_1",
      text: "Süper, görüşürüz o zaman ✌️",
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      isRead: true,
    }
  ],
  "c_2": [
    {
      id: "m_2_1",
      senderId: "u_2",
      text: "Hafta sonu planınız var mı?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      isRead: true,
    },
    {
      id: "m_2_2",
      senderId: CURRENT_USER_ID,
      text: "Henüz yok, belki biraz dinlenirim.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 5),
      isRead: true,
    },
    {
      id: "m_2_3",
      senderId: "u_2",
      imageUrl: "https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=500&h=300&fit=crop",
      text: "Biz buraya gitmeyi düşünüyoruz, katılmaz mısın?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      isRead: false,
    }
  ],
  "c_3": [
    {
      id: "m_3_1",
      senderId: "u_3",
      text: "Abi yeni API dökümantasyonuna baktın mı?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      isRead: true,
    }
  ]
};

export const mockConversations: Conversation[] = [
  {
    id: "c_talko",
    participant: mockUsers["u_talko"],
    lastMessage: mockMessages["c_talko"][mockMessages["c_talko"].length - 1],
    unreadCount: 1,
    isPinned: true,
  },
  {
    id: "c_2",
    participant: mockUsers["u_2"],
    lastMessage: mockMessages["c_2"][mockMessages["c_2"].length - 1],
    unreadCount: 1,
  },
  {
    id: "c_1",
    participant: mockUsers["u_1"],
    lastMessage: mockMessages["c_1"][mockMessages["c_1"].length - 1],
    unreadCount: 0,
  },
  {
    id: "c_3",
    participant: mockUsers["u_3"],
    lastMessage: mockMessages["c_3"][mockMessages["c_3"].length - 1],
    unreadCount: 0,
  }
];
