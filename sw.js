// ============================================================
//  SERVICE WORKER do PWA — guarda o jogo inteiro no celular, para abrir sem internet.
//  A linha VERSAO abaixo é reescrita por ferramentas/montar-pwa.js com o hash do index.html:
//  mudou o jogo → muda o sw.js → o navegador instala a versão nova e apaga o cache antigo.
// ============================================================
const VERSAO = '742ad0b31f54';
const CACHE = 'furia-capixaba-' + VERSAO;
const ARQUIVOS = ['./', './index.html', './three.min.js', './manifest.webmanifest',
  './icones/icone-192.png', './icones/icone-512.png', './icones/icone-maskable-512.png'];

// instalar: baixa tudo de uma vez; se um arquivo falhar, a versão nova não entra (a antiga continua valendo)
self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

// ativar: apaga os caches de versões anteriores e assume as abas abertas
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

// pedidos: primeiro o cache (ignorando ?toque, ?teste etc.), depois a rede; o que vier da rede fica guardado
self.addEventListener('fetch', ev => {
  const pedido = ev.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== location.origin) return;
  ev.respondWith(caches.match(pedido, { ignoreSearch: true }).then(guardado => guardado || fetch(pedido).then(resposta => {
    if (resposta.ok) { const copia = resposta.clone(); caches.open(CACHE).then(c => c.put(pedido, copia)); }
    return resposta;
  })));
});
