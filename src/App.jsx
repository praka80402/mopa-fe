import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import Lightbox from './components/Lightbox.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ChatBot from './pages/ChatBot.jsx';

function App() {
  const [currentPortal, setCurrentPortal] = useState('user'); // 'user' or 'admin'
  const [adminToken, setAdminToken] = useState(localStorage.getItem('admin_token') || '');
  const [userToken, setUserToken] = useState(localStorage.getItem('user_token') || '');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('user_data')) || null);

  // App Language
  const [appLanguage, setAppLanguage] = useState('en');

  // Toast notification
  const [toastMsg, setToastMsg] = useState('');

  // Global Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxType, setLightboxType] = useState('photo'); // 'photo' or 'video'
  const [lightboxItems, setLightboxItems] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 6000);
  };

  const handleOpenLightbox = (type, items, index) => {
    setLightboxType(type);
    setLightboxItems(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleTogglePortal = () => {
    setCurrentPortal((prev) => (prev === 'user' ? 'admin' : 'user'));
  };

  const handleLogout = () => {
    if (currentPortal === 'admin') {
      setAdminToken('');
      localStorage.removeItem('admin_token');
      triggerToast('Admin logged out successfully.');
    } else {
      setUserToken('');
      setCurrentUser(null);
      localStorage.removeItem('user_token');
      localStorage.removeItem('user_data');
      triggerToast('User logged out successfully.');
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = appLanguage === 'en' ? 'hi' : 'en';
    setAppLanguage(nextLang);
    triggerToast(nextLang === 'hi' ? 'भाषा बदलकर हिंदी कर दी गई है।' : 'Language switched to English.');
  };

  const translations = {
    en: {
      welcome: "Welcome back",
      authPhone: "Logged in from authorized phone number",
      verified: "Fully Verified Connection",
      docs: "Documents & Resources",
      photos: "Institutional Photos",
      videos: "Video Gallery",
      searchPlaceholder: "Search document title or description...",
      filterDept: "Filter Department:",
      logout: "Log Out",
      adminPortal: "Admin Portal",
      userPortal: "User Portal",
      mobileLogin: "User Dashboard Access",
      enterPhone: "Authorized Mobile Number",
      reqOtp: "Request Verification Code",
      enterOtp: "Enter 6-Digit OTP",
      verifyLogin: "Verify & Login"
    },
    hi: {
      welcome: "आपका स्वागत है",
      authPhone: "अधिकृत मोबाइल नंबर से लॉग इन किया गया",
      verified: "पूर्णतः सत्यापित कनेक्शन",
      docs: "दस्तावेज़ और संसाधन",
      photos: "संस्थागत तस्वीरें",
      videos: "वीडियो गैलरी",
      searchPlaceholder: "दस्तावेज़ का शीर्षक या विवरण खोजें...",
      filterDept: "विभाग फ़िल्टर करें:",
      logout: "लॉग आउट",
      adminPortal: "व्यवस्थापक पोर्टल",
      userPortal: "उपयोगकर्ता पोर्टल",
      mobileLogin: "उपयोगकर्ता डैशबोर्ड प्रवेश",
      enterPhone: "अधिकृत मोबाइल नंबर",
      reqOtp: "सत्यापन कोड का अनुरोध करें",
      enterOtp: "6-अंकीय ओटीपी दर्ज करें",
      verifyLogin: "सत्यापित करें और लॉग इन करें"
    }
  };

  const t = translations[appLanguage];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header 
        currentPortal={currentPortal} 
        onTogglePortal={handleTogglePortal} 
        user={currentPortal === 'admin' ? (adminToken ? { name: 'Admin Dashboard' } : null) : currentUser}
        onLogout={handleLogout}
        appLanguage={appLanguage}
        onToggleLanguage={handleToggleLanguage}
      />

      <Toast message={toastMsg} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentPortal === 'admin' ? (
          !adminToken ? (
            <AuthPage 
              portalType="admin" 
              onAdminLogin={(token) => {
                setAdminToken(token);
                localStorage.setItem('admin_token', token);
              }}
              triggerToast={triggerToast}
              appLanguage={appLanguage}
              translations={t}
            />
          ) : (
            <AdminDashboard 
              triggerToast={triggerToast} 
              onOpenLightbox={handleOpenLightbox} 
            />
          )
        ) : (
          !userToken ? (
            <AuthPage 
              portalType="user" 
              onUserLogin={(token, user) => {
                setUserToken(token);
                setCurrentUser(user);
                localStorage.setItem('user_token', token);
                localStorage.setItem('user_data', JSON.stringify(user));
              }}
              triggerToast={triggerToast}
              appLanguage={appLanguage}
              translations={t}
            />
          ) : (
            <UserDashboard 
              currentUser={currentUser} 
              triggerToast={triggerToast} 
              onOpenLightbox={handleOpenLightbox} 
              appLanguage={appLanguage}
              translations={t}
            />
          )
        )}
      </div>

      {/* Render ChatBot only for user dashboard (logged in user, in user portal) */}
      {currentPortal === 'user' && userToken && (
        <ChatBot onOpenLightbox={handleOpenLightbox} currentUser={currentUser} />
      )}

      <Lightbox 
        open={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        type={lightboxType} 
        items={lightboxItems} 
        index={lightboxIndex} 
        onIndexChange={setLightboxIndex} 
      />

      <Footer />
    </div>
  );
}

export default App;
