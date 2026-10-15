import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const execFileAsync = promisify(execFile);
async function loadLocalEnv(){ try { const raw=await readFile(join(root,'.env.local'),'utf8'); for(const line of raw.split(/\r?\n/)){ const match=line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/i); if(match&&!process.env[match[1]])process.env[match[1]]=match[2].replace(/^['"]|['"]$/g,''); } } catch {} }
const watchlist = new Set();

const products = [
  {id:1, category:'GPU', type:'GRAPHICS CARD', brand:'ZOTAC', name:'GeForce RTX 5070 Twin Edge OC 12GB', price:89500, retailer:'Star Tech', offers:7, rating:'4.8', stock:true, warranty:true, specs:['12GB GDDR7','PCIe 5.0','250W'], updated:'Today, 09:42'},
  {id:2, category:'GPU', type:'GRAPHICS CARD', brand:'MSI', name:'GeForce RTX 5070 Gaming X Trio 12G', price:92000, retailer:'Ryans', offers:5, rating:'4.7', stock:true, warranty:true, specs:['12GB GDDR7','Boost 2610MHz','240W'], updated:'Today, 08:17'},
  {id:3, category:'GPU', type:'GRAPHICS CARD', brand:'ASUS', name:'Prime GeForce RTX 5070 12GB OC', price:93500, retailer:'TechLand BD', offers:4, rating:'4.9', stock:true, warranty:true, specs:['12GB GDDR7','3-slot design','250W'], updated:'Today, 07:55'},
  {id:4, category:'GPU', type:'GRAPHICS CARD', brand:'GIGABYTE', name:'GeForce RTX 5070 WINDFORCE OC SFF', price:89900, retailer:'UCC', offers:3, rating:'4.6', stock:false, warranty:true, specs:['12GB GDDR7','SFF ready','250W'], updated:'Yesterday'},
  {id:5, category:'CPU', type:'PROCESSOR', brand:'AMD', name:'Ryzen 7 7800X3D 8-Core Desktop Processor', price:42500, retailer:'Star Tech', offers:8, rating:'4.9', stock:true, warranty:true, specs:['8 cores / 16 threads','AM5','96MB cache'], updated:'Today, 09:05'},
  {id:6, category:'RAM', type:'MEMORY', brand:'CORSAIR', name:'Vengeance 32GB (2x16GB) DDR5 6000MHz', price:12500, retailer:'Ryans', offers:6, rating:'4.7', stock:true, warranty:true, specs:['DDR5-6000','CL36','AMD EXPO'], updated:'Today, 08:45'},
  {id:7, category:'SSD', type:'STORAGE', brand:'WD', name:'Black SN850X 2TB NVMe Gen4 SSD', price:18500, retailer:'TechLand BD', offers:4, rating:'4.8', stock:true, warranty:true, specs:['7,300 MB/s','2TB','PCIe 4.0'], updated:'Today, 06:31'},
  {id:8, category:'Motherboard', type:'MOTHERBOARD', brand:'ASUS', name:'ROG Strix B650E-F Gaming WiFi', price:32500, retailer:'Star Tech', offers:5, rating:'4.8', stock:true, warranty:true, specs:['AM5','WiFi 6E','3x M.2'], updated:'Today, 08:03'},
  {id:9, category:'PSU', type:'POWER SUPPLY', brand:'CORSAIR', name:'RM850e 850W 80+ Gold Fully Modular', price:16900, retailer:'Ryans', offers:5, rating:'4.7', stock:true, warranty:true, specs:['850W','80+ Gold','ATX 3.0'], updated:'Yesterday'},
  {id:10, category:'RAM', type:'MEMORY', brand:'NETAC', name:'Basic 4GB DDR4 2666MHz Desktop RAM', price:3900, retailer:'Star Tech', offers:1, rating:'—', stock:true, warranty:false, specs:['4GB DDR4','2666MHz','288-Pin UDIMM'], updated:'Indexed catalog', source:'catalog', sourceUrl:'https://www.startech.com.bd/component/ram'},
  {id:11, category:'RAM', type:'MEMORY', brand:'KIMTIGO', name:'WOLFRINE 8GB 3200MHz DDR4 UDIMM Desktop RAM', price:6000, retailer:'Star Tech', offers:1, rating:'—', stock:true, warranty:false, specs:['8GB DDR4','3200MHz','CL22'], updated:'Indexed catalog', source:'catalog', sourceUrl:'https://www.startech.com.bd/component/ram'},
  {id:12, category:'RAM', type:'MEMORY', brand:'TRANSCEND', name:'JetRAM 4GB DDR4L 3200MHz Laptop RAM', price:3200, retailer:'Ryans', offers:1, rating:'—', stock:true, warranty:false, specs:['4GB DDR4L','3200MHz','260-Pin SO-DIMM'], updated:'Indexed catalog', source:'catalog', sourceUrl:'https://www.ryans.com/category/laptop-ram-ddr4'}
];

const json = (res, status, body) => { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}); res.end(JSON.stringify(body)); };
const parseBody = req => new Promise((resolve, reject) => { let data=''; req.on('data', chunk => data += chunk); req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error('Invalid JSON')); } }); req.on('error', reject); });
const clean = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const timeoutFetch = async (url, options={}) => { const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 8500); try { const headers={'user-agent':'PartlyBD/1.0 (product search)','accept-language':'en-US,en;q=0.8',...(options.headers||{})}; if(process.env.PARTLY_PROXY){ const args=['--proxy',process.env.PARTLY_PROXY,'--max-time','8','--location','--silent','--show-error','--user-agent',headers['user-agent']]; if(process.env.PARTLY_PROXY_USER)args.push('--proxy-user',`${process.env.PARTLY_PROXY_USER}:${process.env.PARTLY_PROXY_PASSWORD||''}`); args.push(url); const result=await execFileAsync(process.env.ComSpec||'cmd.exe',process.env.ComSpec?['/d','/s','/c',`curl.exe ${args.map(a=>`"${String(a).replaceAll('"','\\"')}"`).join(' ')}`]:args,{maxBuffer:4*1024*1024}); return {ok:true,status:200,text:async()=>result.stdout}; } return await fetch(url,{...options,signal:controller.signal,headers}); } finally { clearTimeout(timer); } };
function absoluteUrl(href, base){ try { return new URL(href, base).href; } catch { return null; } }
function imageFrom(html, base){ const match = html.match(/<meta[^>]+(?:property|name)=["'](?:og:image|twitter:image)["'][^>]+content=["']([^"']+)/i); return match ? absoluteUrl(match[1], base) : null; }
function jsonLdProduct(html){ const blocks=[...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]; for(const block of blocks){ try { const parsed=JSON.parse(block[1].trim()); const items=Array.isArray(parsed)?parsed:[parsed,...(parsed?.['@graph']||[])]; const p=items.find(x=>x?.['@type']==='Product'||(Array.isArray(x?.['@type'])&&x['@type'].includes('Product'))); if(p)return p; } catch {} } return null; }
async function retailerSearch(site, query, retailer){
  const ddg=`https://html.duckduckgo.com/html/?q=${encodeURIComponent(`site:${site} ${query}`)}`; const response=await timeoutFetch(ddg); if(!response.ok)return [];
  const html=await response.text(); const links=[];
  for(const match of html.matchAll(/<a[^>]+class=["'][^"']*result__a[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)){ let href=match[1]; try{const parsed=new URL(href,ddg);href=parsed.searchParams.get('uddg')?decodeURIComponent(parsed.searchParams.get('uddg')):href}catch{} if(href.includes(site)&&!links.some(x=>x.url===href))links.push({url:href,title:clean(match[2])}); }
  const results=[]; for(const item of links.slice(0,4)){ try{const page=await timeoutFetch(item.url);if(!page.ok)continue;const body=await page.text();const p=jsonLdProduct(body);const title=clean(p?.name||item.title);const price=Number(String(p?.offers?.price||'').replace(/[^0-9.]/g,''));const specs=[];for(const pattern of [/DDR[345L]?/ig,/\b\d{3,5}\s?MHz\b/ig,/\b\d+(?:GB|TB)\b/ig]){const found=body.match(pattern);if(found)specs.push(...found.slice(0,2).map(clean))}results.push({id:`${retailer}-${results.length}-${Date.now()}`,category:'Other',type:'LIVE RETAILER RESULT',brand:retailer,name:title,price:price||null,retailer,offers:1,rating:'—',stock:true,warranty:false,specs:[...new Set(specs)].slice(0,3),image:imageFrom(body,item.url),sourceUrl:item.url,source:'live'});}catch{} }
  return results;
}
async function liveSearch(query){ const sources=[['startech.com.bd','Star Tech'],['ryans.com','Ryans']];const settled=await Promise.allSettled(sources.map(([site,retailer])=>retailerSearch(site,query,retailer)));return settled.flatMap(x=>x.status==='fulfilled'?x.value:[]); }
function matchesQuery(product, query){ const hay=`${product.name} ${product.brand} ${product.category} ${product.specs.join(' ')}`.toLowerCase(); return query.toLowerCase().split(/\s+/).filter(Boolean).every(token=>hay.includes(token)); }

async function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) return json(res, 403, {error:'Forbidden'});
  try {
    const info = await stat(file);
    if (!info.isFile()) return json(res, 404, {error:'Not found'});
    const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.xml':'application/opensearchdescription+xml; charset=utf-8'};
    res.writeHead(200, {'Content-Type': types[extname(file)] || 'application/octet-stream'});
    res.end(await readFile(file));
  } catch { json(res, 404, {error:'Not found'}); }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/api/health') return json(res, 200, {ok:true, service:'partly', timestamp:new Date().toISOString()});
    if (url.pathname === '/api/stats' && req.method === 'GET') return json(res, 200, {products:4280, retailers:18, updated:'today', watchlist:watchlist.size});
    if (url.pathname === '/api/products' && req.method === 'GET') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const category = url.searchParams.get('category') || 'All';
      const maxPrice = Number(url.searchParams.get('maxPrice') || 200000);
      const stock = url.searchParams.get('stock') === 'true';
      const warranty = url.searchParams.get('warranty') === 'true';
      const sort = url.searchParams.get('sort') || 'relevance';
      let results = products.filter(p => (category === 'All' || p.category === category) && p.price <= maxPrice && (!stock || p.stock) && (!warranty || p.warranty) && (!q || `${p.name} ${p.brand} ${p.category} ${p.specs.join(' ')}`.toLowerCase().includes(q)));
      if (sort === 'price-low') results.sort((a,b) => a.price-b.price);
      if (sort === 'price-high') results.sort((a,b) => b.price-a.price);
      if (sort === 'rating') results.sort((a,b) => Number(b.rating)-Number(a.rating));
      return json(res, 200, {results, total:results.length, query:q, lastChecked:new Date().toISOString()});
    }
    if (url.pathname === '/api/search' && req.method === 'GET') {
      const query=url.searchParams.get('q')||''; if(query.length<2)return json(res,400,{error:'Search query must be at least 2 characters'});
      const live=await liveSearch(query); const local=products.filter(p=>matchesQuery(p,query)).map(p=>({...p,source:p.source||'catalog',sourceUrl:p.sourceUrl||null,image:p.image||null}));
      return json(res,200,{results:[...live,...local],total:live.length+local.length,query,liveSources:['Star Tech','Ryans'],lastChecked:new Date().toISOString(),notice:live.length?'Live retailer results fetched from public pages.':'Retailer pages were unavailable; showing indexed catalog matches.'});
    }
    if (url.pathname === '/api/watchlist' && req.method === 'POST') {
      const body = await parseBody(req); const id = Number(body.productId);
      if (!products.some(p => p.id === id)) return json(res, 404, {error:'Product not found'});
      watchlist.add(id); return json(res, 201, {ok:true, productId:id, message:'Added to watchlist'});
    }
    if (url.pathname === '/api/watchlist' && req.method === 'DELETE') {
      const id = Number(url.searchParams.get('productId')); watchlist.delete(id); return json(res, 200, {ok:true, productId:id});
    }
    // OpenSearch-compatible browser integration. Browsers substitute the user's
    // query into the descriptor's {searchTerms} placeholder.
    if (url.pathname === '/search' && req.method === 'GET') {
      const query = url.searchParams.get('q') || '';
      res.writeHead(302, {Location: `/?q=${encodeURIComponent(query)}`});
      return res.end();
    }
    return serveStatic(req, res);
  } catch (error) { return json(res, 400, {error:error.message}); }
});

await loadLocalEnv();
server.listen(port, () => console.log(`Partly running at http://localhost:${port}${process.env.PARTLY_PROXY ? ` (outbound search proxy: ${process.env.PARTLY_PROXY})` : ''}`));
