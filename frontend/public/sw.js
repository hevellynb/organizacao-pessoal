// Service worker mínimo: deixa o app instalável.
// Não guarda nada em cache (o app depende da API), então nunca mostra uma versão velha.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (evento) => evento.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});