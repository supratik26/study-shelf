const SHELL_CACHE = "study-shelf-shell-v1";
const MATERIAL_CACHE = "study-shelf-materials-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/study-shelf-icon.svg"];

self.addEventListener("install", event => event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/")) return;
  if (url.hostname.endsWith(".supabase.co") && url.pathname.includes("/storage/v1/object/sign/")) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok || response.type === "opaque") caches.open(MATERIAL_CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request))));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/").then(response => response || new Response("Study Shelf is offline. Reconnect to refresh your library."))));
    return;
  }
  if (url.origin === self.location.origin && (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".svg") || url.pathname.endsWith(".webmanifest"))) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => { const copy = response.clone(); caches.open(SHELL_CACHE).then(cache => cache.put(request, copy)); return response; })));
  }
});
self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_STUDY_MATERIAL" || !event.data.url) return;
  event.waitUntil(fetch(event.data.url).then(response => { if (response.ok || response.type === "opaque") return caches.open(MATERIAL_CACHE).then(cache => cache.put(event.data.url, response)); }).catch(() => undefined));
});
