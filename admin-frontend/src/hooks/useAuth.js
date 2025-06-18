import { useState } from 'react';

// Dans une vraie application, ceci viendrait d'un contexte d'authentification (Context API, Redux, etc.)
export const useAuth = () => {
  const [user] = useState({
    name: 'Admin User',
    // Changez le rôle ici pour tester : 'Admin' ou 'Agent'
    role: 'Admin', 
  });

  return { user, isAdmin: user.role === 'Admin' };
};