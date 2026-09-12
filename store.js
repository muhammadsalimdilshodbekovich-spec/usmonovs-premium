/* ============================================================
   USMONOVS PREMIUM — shared data store (static, no server)
   index.html va admin.html shu faylni ulashadi. Ma'lumot
   localStorage'da saqlanadi — adminda qo'shsangiz saytda ko'rinadi.
   ============================================================ */
(function () {
  const KEY = "usm_store_v8";
  const CART = "usm_cart_v8";
  const RATE = 12600; // USD → so'm (namoyish kursi)

  const BRANDS_SRC = [
    ["Balenciaga","Luxury","Fransiya"],["Alexander McQueen","Luxury","Buyuk Britaniya"],["Gucci","Luxury","Italiya"],["Louis Vuitton","Luxury","Fransiya"],["Dior","Luxury","Fransiya"],["Prada","Luxury","Italiya"],["Christian Louboutin","Luxury","Fransiya"],["Saint Laurent","Luxury","Fransiya"],["Off-White","Luxury","Italiya"],["Maison Margiela","Luxury","Fransiya"],["Golden Goose","Luxury","Italiya"],["Loro Piana","Luxury","Italiya"],["Brunello Cucinelli","Luxury","Italiya"],["Hermès","Luxury","Fransiya"],["Givenchy","Luxury","Fransiya"],["Fendi","Luxury","Italiya"],["Tom Ford","Luxury","AQSH"],["Versace","Luxury","Italiya"],["Rick Owens","Luxury","AQSH"],["Bottega Veneta","Luxury","Italiya"],["Lanvin","Luxury","Fransiya"],["On Running","Performance","Shveytsariya"],["Hoka One One","Performance","AQSH"],["Salomon","Performance","Fransiya"],["Stone Island","Premium","Italiya"],["Fear of God","Premium","AQSH"],["Arc'teryx","Performance","Kanada"],["Veja","Premium","Fransiya"],["Nike","Sport","AQSH"],["Adidas","Sport","Germaniya"],["New Balance","Sport","AQSH"],["Asics","Sport","Yaponiya"],["Puma","Sport","Germaniya"],["Reebok","Sport","AQSH"],["Mizuno","Sport","Yaponiya"],["Converse","Sport","AQSH"],["Vans","Sport","AQSH"],["Under Armour","Sport","AQSH"],["Li-Ning","Sport","Xitoy"],["Anta","Sport","Xitoy"],["Peak","Sport","Xitoy"],["361°","Sport","Xitoy"],["Xtep","Sport","Xitoy"],["Rigorer","Sport","Xitoy"],["Qiaodan","Sport","Xitoy"],
  ];
  const MODELS = ["Triple S","Speed Trainer","Oversized","Court Runner","Archlight","Cloud X","Bondi 8","Speedcross","B23","GG Sneaker","Chunky Runner","Retro High","Wave Rider","Superstar","Air Max Pulse","990v6","Gel-Kayano","Chuck 70","Old Skool","Cloudmonster","Genesis","Skel-Top","Rodeo"];
  const COLORWAYS = ["Triple White","Panda","Onyx","Bone","Ember Orange","Ivory","Jet Black","Sand","Storm Grey","Off-Noir"];
  const STATUSES = ["Active","Active","Active","Draft","Archived"];
  const SIZES = ["38","39","40","41","42","43","44","45"];
  const OST = ["Pending","Paid","Shipped","Delivered","Cancelled","Refunded"];
  const CITIES = ["Andijon","Farg'ona","Namangan","Samarqand","Buxoro","Istanbul","Anqara","Shanxay","Guanchjou","Dubay"];
  const FIRST = ["Aziz","Malika","Sofia","Liam","Yusuf","Emma","Kenji","Nodira","Marco","Zara","Ethan","Dilnoza"];
  const LAST = ["Karimov","Rossi","Dubois","Chen","Ismoilov","Muller","Tanaka","Usmonova","Bernard","Kim","Smith","Yusupova"];

  let _s = 20260909;
  const rnd = () => { _s|=0; _s=(_s+0x6D2B79F5)|0; let t=Math.imul(_s^(_s>>>15),1|_s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
  const pick = a => a[Math.floor(rnd()*a.length)];
  const rint = (a,b) => Math.floor(rnd()*(b-a+1))+a;
  const uid = () => Math.random().toString(36).slice(2,10);
  const daysAgo = n => new Date(Date.now()-n*86400000).toISOString();
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

  const MODELS2 = MODELS.concat(["Runner 2.0","Heritage Low","Trail GTX","Court Vintage","Mesh Flow","Suede Classic","Aero Knit","Street Mid","Pro Elite","Canvas Low","Aurora","Momentum","Vector","Eclipse"]);
  const COL2 = COLORWAYS.concat(["Cream","Sail","Volt","Crimson","Navy","Olive","Stone","Slate","Mocha","Pearl","Graphite","Bordo"]);
  const tierWord = t => t==="Luxury"?"kutyur":t==="Sport"?"sport":t==="Performance"?"trassa":"premium";
  const desc = (b,model,cw) => `${b.name} ${model} — ${cw.toLowerCase()} rangdagi ${tierWord(b.tier)} silueti. Yengil, chidamli va kundalik kiyish uchun qulay. ${b.country} uslubidagi did bilan tayyorlangan; nafas oluvchi material va bardoshli tag.`;
  const priceOf = t => t==="Luxury"?rint(750,2400):t==="Premium"?rint(280,700):t==="Performance"?rint(160,380):rint(70,260);
  const mkStock = (min,max) => { const sbs={}; let stock=0; SIZES.forEach(s=>{const q=rint(min,max); sbs[s]=q; stock+=q;}); return {sbs,stock}; };

  const DEFAULT_ABOUT = {
    title: "Usmonovs Premium — ishonch bilan tanlangan poyabzal uyi",
    text: "Biz dunyoning eng nufuzli krossovka brendlarini bir joyga jamladik. Har bir juftlik sifat nazoratidan o'tadi: original mahsulotlar sertifikat bilan yetkaziladi, lux-copy juftliklar esa eng yuqori sifat darajasida tanlanadi. Maqsadimiz — sizga did, qulaylik va halollik bilan xizmat ko'rsatish.",
    image: null,
  };
  const DEFAULT_SETTINGS = { adminEmail: "admin@usmonovs.com", adminPassword: "admin123" };

  // Toza boshlang'ich holat: brendlar bor, mahsulot/mijoz/buyurtma bo'sh.
  function seed() {
    _s = 20260909;
    const brands = BRANDS_SRC.map(([name,tier,country]) => ({ id: uid(), name, slug: slug(name), tier, country, createdAt: new Date().toISOString() }));
    return { brands, products: [], customers: [], orders: [], about: {...DEFAULT_ABOUT}, settings: {...DEFAULT_SETTINGS} };
  }

  function load() {
    let data;
    try { const raw = localStorage.getItem(KEY); if (raw) data = JSON.parse(raw); } catch(e){}
    if (!data || typeof data !== "object") data = seed();
    if (!Array.isArray(data.brands) || !data.brands.length) data.brands = seed().brands;
    if (!Array.isArray(data.products)) data.products = [];
    if (!Array.isArray(data.customers)) data.customers = [];
    if (!Array.isArray(data.orders)) data.orders = [];
    if (!data.about) data.about = {...DEFAULT_ABOUT};
    if (!data.settings) data.settings = {...DEFAULT_SETTINGS};
    save(data);
    return data;
  }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch(e){ console.warn("saqlashda xatolik (localStorage to'lgan bo'lishi mumkin)", e); } }

  let db = load();
  const persist = () => save(db);

  /* ---------- helpers ---------- */
  const money = n => Math.round((n||0)*RATE).toLocaleString("en-US").replace(/,/g," ") + " so'm";
  const num = n => (n||0).toLocaleString("en-US");
  const dateShort = iso => new Date(iso).toLocaleDateString("uz-UZ",{day:"numeric",month:"short",year:"numeric"});
  const dateRel = iso => { const d=Math.floor((Date.now()-new Date(iso).getTime())/86400000); if(d<=0)return"Bugun"; if(d===1)return"Kecha"; if(d<7)return d+" kun oldin"; if(d<30)return Math.floor(d/7)+" hafta oldin"; return dateShort(iso); };
  const initials = name => name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();
  const esc = s => String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  /* ---------- public API ---------- */
  const API = {
    SIZES, STATUSES, OST,
    money, num, dateShort, dateRel, initials, esc, uid, slug,

    resetData() { db = seed(); persist(); },

    // brands
    brands() { return db.brands.slice().sort((a,b)=>a.name.localeCompare(b.name)); },
    brandsWithCounts() { return API.brands().map(b=>({ ...b, productCount: db.products.filter(p=>p.brandId===b.id).length })); },
    shopBrands() { return API.brandsWithCounts().filter(b=>db.products.some(p=>p.brandId===b.id && p.status==="Active" && p.stock>0 || (p.brandId===b.id && p.status==="Active"))); },
    addBrand(d){ const b={id:uid(),name:d.name,slug:slug(d.name),tier:d.tier||"Sport",country:d.country||"—",createdAt:new Date().toISOString()}; db.brands.push(b); persist(); return b; },
    updateBrand(id,d){ const b=db.brands.find(x=>x.id===id); if(b){Object.assign(b,d); persist();} return b; },
    deleteBrand(id){ if(db.products.some(p=>p.brandId===id)) return {error:"Mahsulotli brendni o'chirib bo'lmaydi"}; db.brands=db.brands.filter(b=>b.id!==id); persist(); return {ok:true}; },

    // products
    allProducts(){ return db.products.slice(); },
    product(id){ return db.products.find(p=>p.id===id); },
    addProduct(d){
      const brand=db.brands.find(b=>b.id===d.brandId);
      const sbs=d.stockBySize||{}; const stock=Object.values(sbs).reduce((s,n)=>s+Number(n||0),0);
      const p={ id:uid(), name:d.name||((brand?brand.name:"")+" ").trim(), model:d.model||"", colorway:d.colorway||"", brandId:d.brandId, brandName:brand?brand.name:"—",
        sku:d.sku||((brand?brand.slug.slice(0,3).toUpperCase():"SKU")+"-"+rint(1000,9999)), price:Number(d.price)||0, compareAtPrice:d.compareAtPrice?Number(d.compareAtPrice):null,
        status:d.status||"Draft", images:(d.images||(d.image?[d.image]:[])), image:((d.images&&d.images[0])||d.image||null), original:!!d.original, description:d.description||"", stockBySize:sbs, stock, sold:0, featured:!!d.featured, createdAt:new Date().toISOString() };
      db.products.unshift(p); persist(); return p;
    },
    updateProduct(id,d){
      const p=db.products.find(x=>x.id===id); if(!p) return null;
      if(d.brandId&&d.brandId!==p.brandId){const b=db.brands.find(x=>x.id===d.brandId); p.brandId=d.brandId; p.brandName=b?b.name:p.brandName;}
      ["name","colorway","sku","status","image","description"].forEach(k=>{ if(d[k]!==undefined) p[k]=d[k]; });
      if(d.price!==undefined)p.price=Number(d.price);
      if(d.compareAtPrice!==undefined)p.compareAtPrice=d.compareAtPrice?Number(d.compareAtPrice):null;
      if(d.featured!==undefined)p.featured=!!d.featured;
      if(d.original!==undefined)p.original=!!d.original;
      if(d.images!==undefined){ p.images=d.images; p.image=d.images[0]||null; }
      if(d.stockBySize){p.stockBySize=d.stockBySize; p.stock=Object.values(d.stockBySize).reduce((s,n)=>s+Number(n||0),0);}
      persist(); return p;
    },
    deleteProduct(id){ db.products=db.products.filter(p=>p.id!==id); persist(); },

    // shop (public) queries
    shopProducts(f){
      f=f||{}; let list=db.products.filter(p=>p.status==="Active");
      if(f.q){const q=f.q.toLowerCase(); list=list.filter(p=>(p.name+p.colorway+p.brandName).toLowerCase().includes(q));}
      if(f.brandId) list=list.filter(p=>p.brandId===f.brandId);
      if(f.tier){const ids=db.brands.filter(b=>b.tier===f.tier).map(b=>b.id); list=list.filter(p=>ids.includes(p.brandId));}
      if(f.sort==="price_asc")list.sort((a,b)=>a.price-b.price);
      else if(f.sort==="price_desc")list.sort((a,b)=>b.price-a.price);
      else if(f.sort==="popular")list.sort((a,b)=>b.sold-a.sold);
      else list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      return list;
    },
    featured(){ return db.products.filter(p=>p.status==="Active"&&p.featured).slice(0,8); },
    sizesOf(p){ return Object.entries(p.stockBySize||{}).filter(([,q])=>q>0).map(([s])=>s); },
    related(p){ return db.products.filter(x=>x.brandId===p.brandId&&x.id!==p.id&&x.status==="Active").slice(0,4); },

    // orders / customers
    orders(){ return db.orders.slice(); },
    updateOrderStatus(id,s){ const o=db.orders.find(x=>x.id===id); if(o){o.status=s; persist();} return o; },
    customers(){ return db.customers.slice().sort((a,b)=>b.spent-a.spent); },
    createOrder(customer,items){
      const line=[]; let sub=0;
      items.forEach(it=>{ const p=db.products.find(x=>x.id===it.productId); if(!p)return; const qty=Math.max(1,it.qty||1); sub+=p.price*qty; line.push({productId:p.id,name:p.name,size:it.size||"—",qty,price:p.price}); p.sold+=qty; if(p.stockBySize&&p.stockBySize[it.size]!=null){p.stockBySize[it.size]=Math.max(0,p.stockBySize[it.size]-qty); p.stock=Object.values(p.stockBySize).reduce((s,n)=>s+Number(n||0),0);} });
      if(!line.length) return {error:"Mahsulot topilmadi"};
      let cust=db.customers.find(c=>c.phone===customer.phone);
      if(!cust){cust={id:uid(),name:customer.name,phone:customer.phone||"—",city:customer.city||"—",tier:"New",orders:0,spent:0,createdAt:new Date().toISOString()}; db.customers.push(cust);}
      const ship=sub>800?0:25, o={id:uid(),number:`#AT${10000+db.orders.length}`,customerName:cust.name,city:cust.city,items:line,subtotal:sub,shipping:ship,total:sub+ship,status:"Pending",createdAt:new Date().toISOString()};
      db.orders.unshift(o); cust.orders++; cust.spent+=o.total; persist();
      return {number:o.number,total:o.total};
    },

    // dashboard
    dashboard(){
      const paid=db.orders.filter(o=>!["Cancelled","Refunded","Pending"].includes(o.status));
      const revenue=paid.reduce((s,o)=>s+o.total,0), avg=paid.length?revenue/paid.length:0;
      const weeks=[]; for(let i=11;i>=0;i--){const end=Date.now()-i*7*86400000,start=end-7*86400000; weeks.push({label:"H"+(12-i),value:Math.round(paid.filter(o=>{const t=new Date(o.createdAt).getTime();return t>=start&&t<end;}).reduce((s,o)=>s+o.total,0))});}
      const br={}; paid.forEach(o=>o.items.forEach(it=>{const p=db.products.find(x=>x.id===it.productId); if(p)br[p.brandName]=(br[p.brandName]||0)+it.price*it.qty;}));
      const topBrands=Object.entries(br).map(([name,value])=>({name,value:Math.round(value)})).sort((a,b)=>b.value-a.value).slice(0,6);
      const sb=db.orders.reduce((a,o)=>{a[o.status]=(a[o.status]||0)+1;return a;},{});
      const low=db.products.filter(p=>p.stock>0&&p.stock<12&&p.status==="Active").sort((a,b)=>a.stock-b.stock).slice(0,6);
      return { kpis:{revenue:Math.round(revenue),orders:db.orders.length,customers:db.customers.length,products:db.products.length,brands:db.brands.length,avgOrder:Math.round(avg)}, weeks, topBrands, statusBreakdown:sb, low, recent:db.orders.slice(0,6) };
    },

    // auth (demo)
    // settings (admin credentials)
    settings(){ return db.settings || {...DEFAULT_SETTINGS}; },
    updateSettings(d){ db.settings = { ...API.settings(), ...d }; persist(); return db.settings; },
    login(email,pass){ const s=API.settings(); return (email||"").trim().toLowerCase()===String(s.adminEmail).toLowerCase() && pass===s.adminPassword; },

    // about (Biz haqimizda — admin orqali tahrirlanadi)
    about(){ return db.about || {...DEFAULT_ABOUT}; },
    updateAbout(d){ db.about = { ...API.about(), ...d }; persist(); return db.about; },

    /* ---------- cart ---------- */
    cart: {
      items(){ try{return JSON.parse(localStorage.getItem(CART)||"[]");}catch(e){return[];} },
      _save(x){ try{localStorage.setItem(CART,JSON.stringify(x));}catch(e){} },
      add(item){ const c=API.cart.items(); const i=c.findIndex(x=>x.productId===item.productId&&x.size===item.size); if(i>=0)c[i].qty+=item.qty; else c.push(item); API.cart._save(c); return c; },
      remove(pid,size){ API.cart._save(API.cart.items().filter(x=>!(x.productId===pid&&x.size===size))); },
      setQty(pid,size,qty){ const c=API.cart.items(); const it=c.find(x=>x.productId===pid&&x.size===size); if(it)it.qty=Math.max(1,qty); API.cart._save(c); },
      clear(){ API.cart._save([]); },
      count(){ return API.cart.items().reduce((s,x)=>s+x.qty,0); },
      subtotal(){ return API.cart.items().reduce((s,x)=>s+x.price*x.qty,0); },
    },
  };

  window.USM = API;
})();
