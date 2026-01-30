const CACHE_NAME = "dapfinance-v1";
const STATIC_ASSETS = ["/", "/login", "/review", "/transactions", "/accounts", "/subscriptions", "/goals", "/settings"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("/api/")) {
    // Network first for API
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    // Cache first for static
    event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
  }
});
