// نبض الهاتف: الشبكة أولاً لملفات التطبيق (أي تعديل يظهر فوراً)، والنسخة المحفوظة تعمل بدون إنترنت
const CACHE = 'xmeta-v5';
const CORE = ['./', './index.html', './app.css', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png',
    './fa/css/all.min.css', './fa/webfonts/fa-solid-900.woff2', './fa/webfonts/fa-regular-400.woff2', './fa/webfonts/fa-brands-400.woff2'];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
    self.skipWaiting();
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
    self.clients.claim();
});
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    // خط تجوّل: يُحفظ أول مرة ثم يُقرأ من الذاكرة دائماً
    if (FONT_HOSTS.includes(url.hostname)) {
        e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
            const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res;
        })));
        return;
    }
    if (url.origin !== self.location.origin) return;
    e.respondWith(
        fetch(e.request).then(res => {
            if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
            return res;
        }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
    );
});
