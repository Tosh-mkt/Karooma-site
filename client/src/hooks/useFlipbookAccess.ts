import { useState, useEffect } from 'react';

interface FlipbookAccessResponse {
  hasAccess: boolean;
  requireAuth?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
  flipbookId?: string;
  message?: string;
}

interface FlipbookAccessState {
  hasAccess: boolean;
  isLoading: boolean;
  error: string | null;
  requireAuth: boolean;
  isAdmin: boolean;
  message: string;
}

export function useFlipbookAccess(flipbookId: string) {
  const [state, setState] = useState<FlipbookAccessState>({
    hasAccess: false,
    isLoading: true,
    error: null,
    requireAuth: false,
    isAdmin: false,
    message: ''
  });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // For development, check URL params for email or admin
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        const admin = urlParams.get('admin');
        
        let url = `/api/flipbook/${flipbookId}/access`;
        if (email) {
          url += `?email=${encodeURIComponent(email)}`;
        } else if (admin === 'true') {
          url += `?admin=true`;
        }

        const response = await fetch(url);
        const data: FlipbookAccessResponse = await response.json();

        setState({
          hasAccess: data.hasAccess,
          isLoading: false,
          error: null,
          requireAuth: data.requireAuth || false,
          isAdmin: data.isAdmin || false,
          message: data.message || ''
        });
      } catch (error) {
        console.error('Error checking flipbook access:', error);
        setState({
          hasAccess: false,
          isLoading: false,
          error: 'Erro ao verificar acesso',
          requireAuth: false,
          isAdmin: false,
          message: ''
        });
      }
    };

    checkAccess();
  }, [flipbookId]);

  return state;
}

// Hook to get email from URL (temporary for development)
export function useEmailFromUrl(): string | null {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const adminParam = urlParams.get('admin');
    
    if (adminParam === 'true') {
      setEmail('admin@karooma.com');
    } else if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  return email;
}