import { useEffect } from 'react';

export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/src/sw-minimal.js', { updateViaCache: 'none' });
          console.log('Service Worker registrado com sucesso:', registration);
          
          // Verificar por atualizações
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nova versão disponível');
                  // Aqui você pode notificar o usuário sobre a nova versão
                }
              });
            }
          });
        } catch (error) {
          console.error('Erro ao registrar Service Worker:', error);
        }
      };

      registerServiceWorker();
      
      // Ouvir mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Mensagem do Service Worker:', event.data);
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  return null;
};
