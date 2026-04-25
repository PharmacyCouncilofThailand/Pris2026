'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface User {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    status?: string;
    country?: string;
    delegateType?: string;
    isThai?: boolean;
    idCard?: string;
    phone?: string;
    institution?: string;
    university?: string;
    pharmacyLicenseId?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, authToken?: string, rememberMe?: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


function clearStoredAuth() {
    localStorage.removeItem('pris_user');
    localStorage.removeItem('pris_token');
    sessionStorage.removeItem('pris_user');
    sessionStorage.removeItem('pris_token');
}

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const localUser = localStorage.getItem('pris_user');
        const localToken = localStorage.getItem('pris_token');
        const sessionUser = sessionStorage.getItem('pris_user');
        const sessionToken = sessionStorage.getItem('pris_token');

        const storedUser: string | null = localUser || sessionUser;
        const storedToken: string | null = localToken || sessionToken;

        if (storedToken && isTokenExpired(storedToken)) {
            clearStoredAuth();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoading(false);
            return;
        }

        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                logger.error('Failed to parse stored user', error);
                clearStoredAuth();
            }
        }
        
        if (storedToken) {
            setTokenState(storedToken);
        }
        
        setIsLoading(false);
    }, []);

    const login = (userData: User, authToken?: string, rememberMe: boolean = true) => {
        setUser(userData);
        setTokenState(authToken || null);

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('pris_user', JSON.stringify(userData));
        if (authToken) storage.setItem('pris_token', authToken);
    };

    const logout = () => {
        setUser(null);
        setTokenState(null);
        clearStoredAuth();
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token && !isTokenExpired(token)
    };

    if (isLoading) return null;

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
