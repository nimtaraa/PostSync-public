// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  locale?: string;
}

interface AuthContextType {
  user: User | null;
  jwtToken: string | null;
  linkedinToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithLinkedIn: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LINKEDIN_CLIENT_ID = import.meta.env.VITE_LINKEDIN_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'https://post-sync-public-7uqj.vercel.app/auth/callback';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [linkedinToken, setLinkedinToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedJwt = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user');
    const storedLinkedinToken = localStorage.getItem('linkedin_token');

    if (storedJwt && storedUser) {
      setJwtToken(storedJwt);
      setUser(JSON.parse(storedUser));
      setLinkedinToken(storedLinkedinToken);
    }

    setIsLoading(false);

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code && !storedJwt) {
      handleOAuthCallback(code);
    }
  }, []);

  const signInWithLinkedIn = async () => {
    const scope = 'openid profile email w_member_social';
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `state=${state}&` +
      `scope=${encodeURIComponent(scope)}`;

    // Store state for verification
    sessionStorage.setItem('oauth_state', state);
    
    // Redirect to LinkedIn
    window.location.href = authUrl;
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);

      // Step 1: Exchange code for LinkedIn access token
      const tokenResponse = await axios.post(`${API_BASE_URL}/auth/linkedin/token`, {
        code,
        redirect_uri: REDIRECT_URI
      });

      const { access_token } = tokenResponse.data;

      // Step 2: Get user info and JWT token
      const userResponse = await axios.get(`${API_BASE_URL}/auth/linkedin/me`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });

      const { jwt_token, linkedin_access_token, ...userData } = userResponse.data;

      // Store tokens and user data
      localStorage.setItem('jwt_token', jwt_token);
      localStorage.setItem('linkedin_token', linkedin_access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      setJwtToken(jwt_token);
      setLinkedinToken(linkedin_access_token);
      setUser(userData);

      // Clean up URL
window.location.href = '/dashboard';      
    } catch (error) {
      console.error('OAuth callback error:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('linkedin_token');
    localStorage.removeItem('user');
    setJwtToken(null);
    setLinkedinToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        jwtToken,
        linkedinToken,
        isAuthenticated: !!jwtToken && !!user,
        isLoading,
        signInWithLinkedIn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

