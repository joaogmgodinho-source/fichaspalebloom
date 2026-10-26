// Registra o Service Worker (permite instalar o site como app e usar offline)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((reg) => console.log('Service Worker registrado:', reg.scope))
      .catch((err) => console.error('Erro ao registrar o Service Worker:', err));
  });
}
