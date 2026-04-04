/**
 * SHEETFLARE ULTIMATE WORKER v13.6 (Fixed Admin Login & Homepage Cache)
 * Menyatukan: Clean URL, CMS Sheet Engine, & API Bridge.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ====================================================================
    // 🚀 1. JALUR API BRIDGE (MENANGANI LOGIN ADMIN & MOOTA)
    // ====================================================================
    // PERBAIKAN: Semua metode POST sekarang diteruskan ke Google Apps Script
    if (request.method === 'POST') {
      try {
        let configRes = await env.ASSETS.fetch(new Request(new URL('/config.js', request.url)));
        if (!configRes.ok) return new Response(JSON.stringify({status: "error", message: "Gagal membaca config.js"}), { status: 500 });
        
        let configText = await configRes.text();
        let match = configText.match(/(?:const|let|var|window\.)?SCRIPT_URL\s*=\s*['"]([^'"]+)['"]/i);
        let scriptUrl = match ? match[1] : null;

        if (!scriptUrl || scriptUrl.includes("MASUKKAN_URL")) {
           return new Response(JSON.stringify({status: "error", message: "SCRIPT_URL belum diisi di config.js"}), { status: 500 });
        }

        const targetUrl = new URL(scriptUrl);
        url.searchParams.forEach((v, k) => targetUrl.searchParams.append(k, v));

        const bodyText = await request.text();
        const response = await fetch(targetUrl.toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' }, // GAS menerima text/plain
          body: bodyText
        });

        // Kembalikan response JSON dari GAS ke Admin Panel
        return new Response(await response.text(), { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
        });

      } catch (err) {
        return new Response(JSON.stringify({status: "error", message: "Bridge Error: " + err.message}), { status: 500 });
      }
    }

    // ====================================================================
    // 🌐 2. ASSETS & PROTEKSI CLEAN URL RESOLVER (GET REQUESTS)
    // ====================================================================
    let isHomepage = (url.pathname === '/' || url.pathname === '');
    let response = await env.ASSETS.fetch(request);
    
    if (!isHomepage && response.status !== 404) return response;

    if (!isHomepage && !url.pathname.includes('.')) {
       let htmlUrl = new URL(url.pathname + '.html', url.origin);
       let htmlResponse = await env.ASSETS.fetch(new Request(htmlUrl, request));
       if (htmlResponse.status !== 404) return htmlResponse;
    }

    // ====================================================================
    // 📄 3. CMS PAGE ENGINE (PENCARIAN KE GOOGLE SHEETS)
    // ====================================================================
    let slug = url.searchParams.get('s') || url.pathname.replace(/^\/|\/$/g, '');
    
    const cache = caches.default;
    let cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
    
    let sheetId = '';
    try {
        let configRes = await env.ASSETS.fetch(new Request(new URL('/config.js', request.url)));
        if (configRes.ok) {
            let configText = await configRes.text();
            let match = configText.match(/(?:const|let|var)\s+SHEET_ID\s*=\s*['"]([^'"]+)['"]/i);
            if (match && match[1]) sheetId = match[1];
        }
    } catch(e) {}

    if (!sheetId) return response || new Response("Sheet ID tidak ditemukan", {status: 500});

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=Pages&headers=0`;
    try {
        const sheetRes = await fetch(csvUrl);
        if (!sheetRes.ok) return response; 
        
        const csvText = await sheetRes.text();
        const rows = parseCSV(csvText);
        let pageData = null;
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row) continue;
            
            const rowSlug = (row[1] || '').trim().toLowerCase();
            const rowTitle = row[2] || 'Tanpa Judul';
            const rowContent = row[3] || '';
            const rowStatus = (row[4] || '').trim().toLowerCase();
            const isHomeFlag = (row[6] || '').trim().toLowerCase();

            if (rowStatus === 'draft') continue;

            if (isHomepage) {
                if (isHomeFlag === 'true') {
                    pageData = { title: rowTitle, content: rowContent };
                    break;
                }
            } else {
                if (rowSlug === slug.toLowerCase()) {
                    pageData = { title: rowTitle, content: rowContent };
                    break;
                }
            }
        }
        
        if (!pageData) return response; 
        
        const htmlString = generateHTML(pageData.title, pageData.content);
        
        const finalResponse = new Response(htmlString, { 
            headers: { 
                'Content-Type': 'text/html;charset=UTF-8', 
                'Cache-Control': 's-maxage=60' 
            } 
        });
        ctx.waitUntil(cache.put(request, finalResponse.clone()));
        return finalResponse;
    } catch (err) {
        return response;
    }
  }
};

// --- HELPER FUNCTIONS ---
function parseCSV(s){const a=[];let q=!1;for(let r=0,l=0,c=0;c<s.length;c++){let x=s[c],y=s[c+1];a[r]=a[r]||[],a[r][l]=a[r][l]||"";if(x=='"'&&q&&y=='"'){a[r][l]+=x;++c;continue}if(x=='"'){q=!q;continue}if(x==','&&!q){++l;continue}if(x=='\r'&&y=='\n'&&!q){++r;l=0;++c;continue}if(x=='\n'&&!q){++r;l=0;continue}if(x=='\r'&&!q){++r;l=0;continue}a[r][l]+=x}return a}

function generateHTML(t,c){return`<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${t}</title><link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"><script src="https://cdn.tailwindcss.com?plugins=typography" defer></script><script src="https://unpkg.com/lucide@latest" defer></script><script>(function(){const cachedStr=localStorage.getItem('melimpah_global_settings');if(cachedStr){try{const data=JSON.parse(cachedStr).data;if(data.site_favicon){let link=document.querySelector("link[rel~='icon']");if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}link.href=data.site_favicon;}if(data.site_name){document.title=data.site_name+' - '+document.title;}}catch(e){}}})();<\/script><style>body{font-family:'Plus Jakarta Sans',sans-serif;margin:0;padding:0;overflow-x:hidden}</style></head><body class="bg-white text-slate-800 min-h-screen flex flex-col m-0 p-0 relative"><div id="page-content" class="w-full min-h-screen">${c}</div><script>document.addEventListener("DOMContentLoaded",function(){if(typeof lucide!=='undefined'&&lucide.createIcons)lucide.createIcons();});<\/script></body></html>`}
