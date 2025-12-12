import React, { useState } from 'react';
import { Shield, Lock, Mail, User, CheckCircle, AlertCircle, TrendingUp, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { UserProfile, UserSettings } from '../types';

interface AuthViewProps {
  onAuthentication: (profile: UserProfile, initialSettings?: Partial<UserSettings>, isNewUser?: boolean) => void;
}

type AuthMode = 'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD';

const AuthView: React.FC<AuthViewProps> = ({ onAuthentication }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enablePaperTrading, setEnablePaperTrading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot Password States
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (authMode === 'LOGIN') {
      // Mock Login Logic
      const storedUser = localStorage.getItem('quantai_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === email && user.password === password) { 
          onAuthentication(
            { email: user.email, pin: user.pin, isAdmin: true, mobile: user.mobile }, 
            undefined, 
            false
          );
        } else {
          setError('Invalid email or password');
        }
      } else {
        setError('No account found. Please sign up.');
      }
    } else if (authMode === 'SIGNUP') {
      // Sign Up Logic
      if (pin.length !== 4) {
        setError('PIN must be 4 digits');
        return;
      }
      if (pin !== confirmPin) {
        setError('PINs do not match');
        return;
      }
      if (!email || !password || !mobile) {
        setError('Please fill in all fields');
        return;
      }
      // Simple mobile regex validation (10-15 digits)
      if (!/^\d{10,15}$/.test(mobile.replace(/[\s-]/g, ''))) {
          setError('Please enter a valid mobile number');
          return;
      }

      // Create Mock User
      const newUser = { email, password, pin, mobile, isAdmin: true };
      localStorage.setItem('quantai_user', JSON.stringify(newUser));
      
      onAuthentication(
        { email, pin, isAdmin: true, mobile },
        { isPaperTrading: enablePaperTrading },
        true
      );
    } else if (authMode === 'FORGOT_PASSWORD') {
      const storedUserStr = localStorage.getItem('quantai_user');
      if (!storedUserStr) {
        setError('No user database found.');
        return;
      }
      const storedUser = JSON.parse(storedUserStr);
      
      // Verify Identity
      const isMatch = (storedUser.email === resetIdentifier) || (storedUser.mobile === resetIdentifier);
      
      if (!isMatch) {
        setError('Email or Mobile number does not match our records.');
        return;
      }

      if (newPassword.length < 4) {
        setError('Password too short.');
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match.');
        return;
      }

      // Update User
      storedUser.password = newPassword;
      localStorage.setItem('quantai_user', JSON.stringify(storedUser));
      
      setSuccessMsg('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        setAuthMode('LOGIN');
        setSuccessMsg('');
        setResetIdentifier('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPassword(''); 
      }, 2000);
    }
  };

  const renderForgotPassword = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
      <div className="flex items-center mb-4">
        <button 
          type="button" 
          onClick={() => { setAuthMode('LOGIN'); setError(''); setSuccessMsg(''); }}
          className="text-gray-400 hover:text-white mr-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Reset Password</h2>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Verify Identity</label>
        <div className="relative">
          <input
            type="text"
            value={resetIdentifier}
            onChange={(e) => setResetIdentifier(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="Enter Email or Mobile Number"
            required
          />
          <User className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">We'll verify this against your registered details.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Password</label>
        <div className="relative">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="New password"
            required
          />
          <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm New Password</label>
        <div className="relative">
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
            placeholder="Confirm new password"
            required
          />
          <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
        </div>
      </div>
      
      <button
        type="submit"
        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Reset Password
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-300">
        
        {authMode !== 'FORGOT_PASSWORD' && (
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-accent-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-primary-500/30">
              <span className="text-3xl font-bold text-white">Q</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">QuantAI Admin Portal</h1>
            <p className="text-gray-400 text-sm">
              {authMode === 'LOGIN' ? 'Enter credentials to access the trading console' : 'Create an administrator account'}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === 'FORGOT_PASSWORD' ? renderForgotPassword() : (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Admin Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="admin@quantai.com"
                    required
                  />
                  <Mail className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                </div>
              </div>

              {authMode === 'SIGNUP' && (
                 <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mobile Number</label>
                   <div className="relative">
                     <input
                       type="tel"
                       value={mobile}
                       onChange={(e) => setMobile(e.target.value)}
                       className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
                       placeholder="+1 555 000 0000"
                       required
                     />
                     <Phone className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                   </div>
                 </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                </div>
                {authMode === 'LOGIN' && (
                  <div className="flex justify-end mt-2">
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('FORGOT_PASSWORD'); setError(''); setSuccessMsg(''); }}
                      className="text-xs text-primary-400 hover:text-primary-300"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              {authMode === 'SIGNUP' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Set 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 text-center font-mono tracking-widest"
                        placeholder="0000"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500 text-center font-mono tracking-widest"
                        placeholder="0000"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center justify-between cursor-pointer" onClick={() => setEnablePaperTrading(!enablePaperTrading)}>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-primary-400" />
                        Paper Trading Mode
                      </div>
                      <div className="text-xs text-gray-400">Start with simulated funds</div>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${enablePaperTrading ? 'bg-primary-600' : 'bg-gray-600'}`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enablePaperTrading ? 'translate-x-4' : ''}`} />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/20 transition-all active:scale-95"
              >
                {authMode === 'LOGIN' ? 'Authenticate System' : 'Create Admin Account'}
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 px-4 py-3 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}
          
          {successMsg && (
             <div className="bg-green-900/30 border border-green-800 text-green-200 px-4 py-3 rounded-lg text-sm flex items-center animate-in fade-in slide-in-from-bottom-2">
               <CheckCircle className="w-4 h-4 mr-2" />
               {successMsg}
             </div>
          )}
        </form>

        {authMode !== 'FORGOT_PASSWORD' && (
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {authMode === 'LOGIN' ? "First time user? " : "Already have an account? "}
              <button
                onClick={() => { setAuthMode(authMode === 'LOGIN' ? 'SIGNUP' : 'LOGIN'); setError(''); setSuccessMsg(''); }}
                className="text-primary-400 hover:text-white font-bold transition-colors"
              >
                {authMode === 'LOGIN' ? 'Initialize System' : 'Login'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;