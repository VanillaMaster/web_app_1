self.addEventListener('install', (event) => {
    console.log('Установлен');
});

self.addEventListener('activate', (event) => {
    console.log('Активирован');
});

const layoutOrigin = "/";
const layouts = new Set([
    "/",
    "/settings/"
])

self.addEventListener("fetch",async (e)=>{
    const url = new URL(e.request.url);
    //console.log("f",url);
    /*
    if (layouts.has(url.pathname)) {
        console.log("layout");
        e.respondWith(fetch(layoutOrigin));
    } else {
        e.respondWith(fetch(e.request));
    }
    */
    e.respondWith(fetch(e.request));
})
