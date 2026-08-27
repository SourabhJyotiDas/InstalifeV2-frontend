import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ToastProvider, useToast } from './components/Toast';
import { apiFetch } from './utils/api';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { FriendsTab } from './components/FriendsTab';
import { ProfileSettings } from './components/ProfileSettings';
import { EditProfile } from './components/EditProfile';
import { Feed } from './components/Feed';
import { UserProfile } from './components/UserProfile';
import { PostDetail } from './components/PostDetail';
import { CreatePostModal } from './components/CreatePostModal';
import { MobileHeader, MobileBottomNav } from './components/MobileNav';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#FAF7F2] text-[#FF5A5F] font-bold text-sm">
        Loading Instalife...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Public Only Guard
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (user && location.pathname !== '/signup') return <Navigate to="/chats" replace />;
  return children;
};

// Main Dashboard Layout handling routes, responsive views, unread counts, toasts, and mobile navigation
const DashboardLayout = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [mobileHideSidebar, setMobileHideSidebar] = useState(false);
  const [prevOnlineUsers, setPrevOnlineUsers] = useState([]);
  const [isInitializedOnline, setIsInitializedOnline] = useState(false);
  const [lastNotifiedTimes, setLastNotifiedTimes] = useState({});
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const fetchFriends = async () => {
    if (!user) return;
    try {
      const res = await apiFetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (err) {
      console.error('Fetch Friends Error:', err);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user]);

  // Handle real-time online status notifications
  useEffect(() => {
    if (!onlineUsers || onlineUsers.length === 0) return;

    if (!isInitializedOnline) {
      setPrevOnlineUsers(onlineUsers);
      setIsInitializedOnline(true);
      return;
    }

    const newlyOnlineIds = onlineUsers.filter((id) => !prevOnlineUsers.includes(id));
    if (newlyOnlineIds.length > 0 && friends.length > 0) {
      newlyOnlineIds.forEach((friendId) => {
        if (friendId === user?._id) return;
        const friend = friends.find((f) => f._id === friendId);
        if (friend) {
          const now = Date.now();
          const lastTime = lastNotifiedTimes[friendId] || 0;
          if (now - lastTime > 60000) {
            addToast({
              title: friend.name,
              message: 'is now online!',
              avatarSeed: friend.avatarSeed,
              profilePic: friend.profilePic,
              type: 'online',
              duration: 3000,
            });
            setLastNotifiedTimes((prev) => ({ ...prev, [friendId]: now }));
          }
        }
      });
    }

    setPrevOnlineUsers(onlineUsers);
  }, [onlineUsers, friends, isInitializedOnline, prevOnlineUsers, lastNotifiedTimes, user, addToast]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg) => {
      const isFromActiveFriend = activeFriend && (msg.sender === activeFriend._id || msg.sender?._id === activeFriend._id);

      if (!isFromActiveFriend) {
        addToast({
          title: msg.senderInfo?.name || 'New Message',
          message: msg.content,
          avatarSeed: msg.senderInfo?.avatarSeed,
          profilePic: msg.senderInfo?.profilePic,
          type: 'message',
          duration: 4000,
        });

        setFriends((prev) =>
          prev.map((f) =>
            f._id === msg.sender ? { ...f, unreadCount: (f.unreadCount || 0) + 1 } : f
          )
        );
      }
    };

    const handleFriendRequestReceived = () => {
      fetchFriends();
      addToast({
        title: 'Friend Request',
        message: 'You received a new friend request!',
        type: 'message',
        duration: 4000,
      });
    };

    const handleFriendRequestAccepted = ({ acceptedBy }) => {
      fetchFriends();
      addToast({
        title: 'Friend Request Accepted',
        message: 'Your friend request was accepted!',
        type: 'online',
        duration: 4000,
      });
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('friend_request_received', handleFriendRequestReceived);
    socket.on('friend_request_accepted', handleFriendRequestAccepted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('friend_request_received', handleFriendRequestReceived);
      socket.off('friend_request_accepted', handleFriendRequestAccepted);
    };
  }, [socket, activeFriend, addToast]);

  const handleSelectFriend = (friend) => {
    setFriends((prev) =>
      prev.map((f) => (f._id === friend._id ? { ...f, unreadCount: 0 } : f))
    );
    setActiveFriend(friend);
    setMobileHideSidebar(true);
    navigate(`/chats/${friend._id}`);
  };

  const isOtherTabActive = location.pathname.startsWith('/discover') || location.pathname.startsWith('/settings') || location.pathname.startsWith('/feed') || location.pathname.startsWith('/profile');

  return (
    <div className="h-screen w-screen flex flex-col bg-[#FAF7F2] overflow-hidden font-sans">
      {/* Mobile Top Header */}
      <MobileHeader pendingRequestsCount={pendingRequests.length} />

      {/* Global Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={() => {
          if (location.pathname !== '/feed') navigate('/feed');
        }}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          mobileHideSidebar={mobileHideSidebar || isOtherTabActive}
        />

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col h-full overflow-hidden ${
            !mobileHideSidebar && !isOtherTabActive ? 'hidden md:flex' : 'flex'
          }`}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/feed" replace />} />
            <Route
              path="/chats"
              element={
                <ChatWindow
                  activeFriend={activeFriend}
                  onBackToSidebar={() => setMobileHideSidebar(false)}
                />
              }
            />
            <Route
              path="/chats/:friendId"
              element={
                <ChatWindowWrapper
                  friends={friends}
                  activeFriend={activeFriend}
                  setActiveFriend={setActiveFriend}
                  onBackToSidebar={() => setMobileHideSidebar(false)}
                />
              }
            />
            <Route
              path="/discover"
              element={
                <FriendsTab
                  friends={friends}
                  pendingRequests={pendingRequests}
                  onRequestHandled={fetchFriends}
                  onFriendAccepted={(newFriend) => {
                    fetchFriends();
                    handleSelectFriend(newFriend);
                  }}
                  onSelectChat={handleSelectFriend}
                />
              }
            />
            <Route path="/feed" element={<Feed />} />
            <Route path="/post/:postId" element={<PostDetail />} />
            <Route path="/profile" element={<UserProfile onSelectChat={handleSelectFriend} />} />
            <Route path="/profile/:userId" element={<UserProfile onSelectChat={handleSelectFriend} />} />
            <Route path="/settings" element={<ProfileSettings />} />
            <Route path="/settings/edit-profile" element={<EditProfile />} />
            <Route path="*" element={<Navigate to="/feed" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        pendingRequestsCount={pendingRequests.length}
        onTabClick={() => setMobileHideSidebar(false)}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />
    </div>
  );
};

// Helper wrapper to resolve active friend from URL param /chats/:friendId
const ChatWindowWrapper = ({ friends, activeFriend, setActiveFriend, onBackToSidebar }) => {
  const { friendId } = useParams();

  useEffect(() => {
    if (friendId && friends.length > 0) {
      const found = friends.find((f) => f._id === friendId);
      if (found) {
        setActiveFriend(found);
      }
    }
  }, [friendId, friends]);

  return (
    <ChatWindow
      activeFriend={activeFriend}
      onBackToSidebar={onBackToSidebar}
    />
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <Login />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicOnlyRoute>
                    <Signup />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
