import React, { useState } from 'react';
import { Lock, Phone } from 'lucide-react';
import { API_URL } from '../utils/helpers.jsx';

const AuthPage = ({ portalType, onAdminLogin, onUserLogin, triggerToast, appLanguage, translations }) => {
  const [adminLoginForm, setAdminLoginForm] = useState({ username: '', password: '' });
  const [userLoginForm, setUserLoginForm] = useState({ phone: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('');

  const t = translations;

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminLoginForm)
      });
      const data = await res.json();
      if (data.success) {
        onAdminLogin(data.token);
        triggerToast('Admin login successful!');
      } else {
        triggerToast(data.message || 'Login failed.');
      }
    } catch (err) {
      triggerToast('Error logging in.');
    }
  };

  const handleUserRequestOtp = async (e) => {
    e.preventDefault();
    if (!userLoginForm.phone) return triggerToast('Please enter your phone number.');
    try {
      const res = await fetch(`${API_URL}/api/auth/user-login-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userLoginForm.phone })
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setOtpVal(data.otp);
        triggerToast(`OTP Sent! Use dummy code: ${data.otp}`);
      } else {
        triggerToast(data.message || 'Verification failed.');
      }
    } catch (err) {
      triggerToast('Error connecting to authentication service.');
    }
  };

  const handleUserVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/auth/user-login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userLoginForm.phone, otp: userLoginForm.otp })
      });
      const data = await res.json();
      if (data.success) {
        onUserLogin(data.token, data.user);
        triggerToast(`Welcome back, ${data.user.name}!`);
      } else {
        triggerToast(data.message || 'Invalid OTP.');
      }
    } catch (err) {
      triggerToast('Error verifying OTP.');
    }
  };

  if (portalType === 'admin') {
    return (
      <div className="container" style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
        <div className="card" style={{ width: '450px' }}>
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-navy)', marginBottom: '15px' }}>
              <Lock size={30} />
            </div>
            <h3 style={{ fontSize: '1.4rem' }}>Admin Dashboard Access</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginTop: '4px' }}>Sign in to upload files and manage dashboard data</p>
          </div>
          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" placeholder="Enter Admin ID" value={adminLoginForm.username} onChange={(e) => setAdminLoginForm({ ...adminLoginForm, username: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" placeholder="Enter Password" value={adminLoginForm.password} onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Access Control Panel</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div className="card" style={{ width: '450px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', color: 'var(--primary-navy)', marginBottom: '15px' }}>
            <Phone size={30} />
          </div>
          <h3 style={{ fontSize: '1.4rem' }}>{t.mobileLogin}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-text)', marginTop: '4px' }}>
            {appLanguage === 'en' ? 'Log in via Registered Mobile Number with a secure OTP code' : '\u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0913\u091f\u0940\u092a\u0940 \u0915\u094b\u0921 \u0915\u0947 \u0938\u093e\u0925 \u092a\u0902\u091c\u0940\u0915\u0943\u0924 \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0915\u0947 \u092e\u093e\u0927\u094d\u092f\u092e \u0938\u0947 \u0932\u0949\u0917 \u0907\u0928 \u0915\u0930\u0947\u0902'}
          </p>
        </div>
        {!otpSent ? (
          <form onSubmit={handleUserRequestOtp}>
            <div className="form-group">
              <label className="form-label">{t.enterPhone}</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', border: '1px solid var(--gray-border)', borderRadius: 'var(--border-radius-md)', backgroundColor: '#F1F5F9', fontWeight: '600', fontSize: '0.95rem' }}>+91</span>
                <input type="tel" className="form-control" placeholder={appLanguage === 'en' ? 'Enter 10 Digit Mobile' : '10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902'} pattern="[0-9]{10}" value={userLoginForm.phone} onChange={(e) => setUserLoginForm({ ...userLoginForm, phone: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>{t.reqOtp}</button>
          </form>
        ) : (
          <form onSubmit={handleUserVerifyOtp}>
            <div className="form-group">
              <label className="form-label">{t.enterOtp}</label>
              <input type="text" className="form-control" placeholder={appLanguage === 'en' ? 'Enter Code (e.g. 123456)' : '\u0915\u094b\u0921 \u0926\u0930\u094d\u091c \u0915\u0930\u0947\u0902 (\u091c\u0948\u0938\u0947 123456)'} pattern="[0-9]{6}" value={userLoginForm.otp} onChange={(e) => setUserLoginForm({ ...userLoginForm, otp: e.target.value })} required autoFocus />
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-saffron)', marginTop: '6px', fontWeight: '500' }}>* {appLanguage === 'en' ? 'For demonstration, use OTP:' : '\u092a\u094d\u0930\u0926\u0930\u094d\u0936\u0928 \u0915\u0947 \u0932\u093f\u090f, \u0913\u091f\u0940\u092a\u0940 \u0915\u093e \u0909\u092a\u092f\u094b\u0917 \u0915\u0930\u0947\u0902:'} {otpVal}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="button" onClick={() => setOtpSent(false)} className="btn btn-secondary" style={{ flex: 1 }}>{appLanguage === 'en' ? 'Back' : '\u092a\u0940\u091b\u0947'}</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{t.verifyLogin}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
