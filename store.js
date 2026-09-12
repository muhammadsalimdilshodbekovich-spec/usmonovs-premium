/* ============================================================
   USMONOVS PREMIUM — shared data store (Supabase backed)
   index.html va admin.html shu faylni ulashadi. Ma'lumot endi
   Supabase bulut bazasida saqlanadi — bir qurilmada qo'shsangiz,
   BARCHA qurilmalarda / mijozlarda ko'rinadi.
   Ishlatishdan oldin: USM.ready() ni kuting (sahifa yuklaganda).
   ============================================================ */
(function () {
  /* ---------- Supabase ulanishi ---------- */
  const SB_URL = "https://wcfepirakyaqwwavibyk.supabase.co";
  const SB_KEY = "sb_publishable_-auWuuWFnG2jPY-oElXd5A_GJlvRJIp";
  const REST = SB_URL + "/rest/v1/";
  const HEADERS = { apikey: SB_KEY, Authorization: "Bearer " + SB_KEY, "Content-Type": "application/json" };

  const CART = "usm_cart_v8";
  const RATE = 1; // narxlar to'g'ridan-to'g'ri so'mda saqlanadi va ko'rsatiladi

  const BRANDS_SRC = [
    ["Balenciaga","Luxury","Fransiya"],["Alexander McQueen","Luxury","Buyuk Britaniya"],["Gucci","Luxury","Italiya"],["Louis Vuitton","Luxury","Fransiya"],["Dior","Luxury","Fransiya"],["Prada","Luxury","Italiya"],["Christian Louboutin","Luxury","Fransiya"],["Saint Laurent","Luxury","Fransiya"],["Off-White","Luxury","Italiya"],["Maison Margiela","Luxury","Fransiya"],["Golden Goose","Luxury","Italiya"],["Loro Piana","Luxury","Italiya"],["Brunello Cucinelli","Luxury","Italiya"],["Hermès","Luxury","Fransiya"],["Givenchy","Luxury","Fransiya"],["Fendi","Luxury","Italiya"],["Tom Ford","Luxury","AQSH"],["Versace","Luxury","Italiya"],["Rick Owens","Luxury","AQSH"],["Bottega Veneta","Luxury","Italiya"],["Lanvin","Luxury","Fransiya"],["On Running","Performance","Shveytsariya"],["Hoka One One","Performance","AQSH"],["Salomon","Performance","Fransiya"],["Stone Island","Premium","Italiya"],["Fear of God","Premium","AQSH"],["Arc'teryx","Performance","Kanada"],["Veja","Premium","Fransiya"],["Nike","Sport","AQSH"],["Adidas","Sport","Germaniya"],["New Balance","Sport","AQSH"],["Asics","Sport","Yaponiya"],["Puma","Sport","Germaniya"],["Reebok","Sport","AQSH"],["Mizuno","Sport","Yaponiya"],["Converse","Sport","AQSH"],["Vans","Sport","AQSH"],["Under Armour","Sport","AQSH"],["Li-Ning","Sport","Xitoy"],["Anta","Sport","Xitoy"],["Peak","Sport","Xitoy"],["361°","Sport","Xitoy"],["Xtep","Sport","Xitoy"],["Rigorer","Sport","Xitoy"],["Qiaodan","Sport","Xitoy"],
  ];
  const STATUSES = ["Active","Active","Active","Draft","Archived"];
  const SIZES = ["38","39","40","41","42","43","44","45"];
  const OST = ["Pending","Paid","Shipped","Delivered","Cancelled","Refunded"];

  let _s = 20260909;
  const rnd = () => { _s|=0; _s=(_s+0x6D2B79F5)|0; let t=Math.imul(_s^(_s>>>15),1|_s); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; };
  const rint = (a,b) => Math.floor(rnd()*(b-a+1))+a;
  const uid = () => Math.random().toString(36).slice(2,10);
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");

  const DEFAULT_ABOUT = {
    title: "Usmonovs Premium — ishonch bilan tanlangan poyabzal uyi",
    text: "Biz dunyoning eng nufuzli krossovka brendlarini bir joyga jamladik. Har bir juftlik sifat nazoratidan o'tadi: original mahsulotlar sertifikat bilan yetkaziladi, lux-copy juftliklar esa eng yuqori sifat darajasida tanlanadi. Maqsadimiz — sizga did, qulaylik va halollik bilan xizmat ko'rsatish.",
    image: null,
  };
  const DEFAULT_SETTINGS = { adminEmail: "admin@usmonovs.com", adminPassword: "admin123" };

  function seedBrands() {
    _s = 20260909;
    return BRANDS_SRC.map(([name,tier,country]) => ({ id: uid(), name, slug: slug(name), tier, country, createdAt: new Date().toISOString() }));
  }

  /* ---------- in-memory kesh (Supabase'dan yuklanadi) ---------- */
  let db = { brands: [], products: [], customers: [], orders: [], about: {...DEFAULT_ABOUT}, settings: {...DEFAULT_SETTINGS} };

  /* ---------- Supabase yozish yordamchilari (optimistik) ---------- */
  function put(table, id, doc) {
    return fetch(REST + table, {
      method: "POST",
      headers: { ...HEADERS, Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: id, doc: doc }),
    }).then(r => { if (!r.ok) return r.text().then(t=>{ throw new Error(table+" "+r.status+" "+t); }); })
      .catch(e => console.error("Saqlashda xatolik (" + table + "):", e));
  }
  function del(table, id) {
    return fetch(REST + table + "?id=eq." + encodeURIComponent(id), {
      method: "DELETE",
      headers: { ...HEADERS, Prefer: "return=minimal" },
    }).catch(e => console.error("O'chirishda xatolik (" + table + "):", e));
  }
  function delAll(table) {
    return fetch(REST + table + "?id=neq.__none__", {
      method: "DELETE",
      headers: { ...HEADERS, Prefer: "return=minimal" },
    }).catch(e => console.error("Tozalashda xatolik (" + table + "):", e));
  }

  /* ---------- boshlang'ich yuklash ---------- */
  async function boot() {
    try {
      const q = t => fetch(REST + t + "?select=id,doc", { headers: HEADERS }).then(r => {
        if (!r.ok) return r.text().then(x=>{ throw new Error(t + " " + r.status + " " + x); });
        return r.json();
      });
      const [brands, products, customers, orders, singles] = await Promise.all([
        q("brands"), q("products"), q("customers"), q("orders"), q("singletons"),
      ]);
      db.brands = brands.map(x => x.doc);
      db.products = products.map(x => x.doc).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      db.customers = customers.map(x => x.doc);
      db.orders = orders.map(x => x.doc).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
      const ab = singles.find(x => x.id === "about"); db.about = ab ? ab.doc : {...DEFAULT_ABOUT};
      const st = singles.find(x => x.id === "settings"); db.settings = st ? st.doc : {...DEFAULT_SETTINGS};
      // birinchi ishga tushganda brendlarni bazaga ekamiz
      if (!db.brands.length) { db.brands = seedBrands(); db.brands.forEach(b => put("brands", b.id, b)); }
      if (!ab) put("singletons", "about", db.about);
      if (!st) put("singletons", "settings", db.settings);
    } catch (e) {
      console.error("Supabase yuklashda xatolik — jadvallar yaratilganini tekshiring:", e);
    }
  }
  let readyP = null;

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

    // sahifa yuklanganda shu promise kutiladi
    ready() { return readyP || (readyP = boot()); },

    resetData() {
      db = { brands: seedBrands(), products: [], customers: [], orders: [], about: {...DEFAULT_ABOUT}, settings: {...DEFAULT_SETTINGS} };
      delAll("products"); delAll("customers"); delAll("orders");
      db.brands.forEach(b => put("brands", b.id, b));
      put("singletons", "about", db.about); put("singletons", "settings", db.settings);
    },

    // brands
    brands() { return db.brands.slice().sort((a,b)=>a.name.localeCompare(b.name)); },
    brandsWithCounts() { return API.brands().map(b=>({ ...b, productCount: db.products.filter(p=>p.brandId===b.id).length })); },
    shopBrands() { return API.brandsWithCounts().filter(b=>db.products.some(p=>p.brandId===b.id && p.status==="Active" && p.stock>0 || (p.brandId===b.id && p.status==="Active"))); },
    addBrand(d){ const b={id:uid(),name:d.name,slug:slug(d.name),tier:d.tier||"Sport",country:d.country||"—",createdAt:new Date().toISOString()}; db.brands.push(b); put("brands",b.id,b); return b; },
    updateBrand(id,d){ const b=db.brands.find(x=>x.id===id); if(b){Object.assign(b,d); put("brands",id,b);} return b; },
    deleteBrand(id){ if(db.products.some(p=>p.brandId===id)) return {error:"Mahsulotli brendni o'chirib bo'lmaydi"}; db.brands=db.brands.filter(b=>b.id!==id); del("brands",id); return {ok:true}; },

    // products
    allProducts(){ return db.products.slice(); },
    product(id){ return db.products.find(p=>p.id===id); },
    addProduct(d){
      const brand=db.brands.find(b=>b.id===d.brandId);
      const sbs=d.stockBySize||{}; const stock=Object.values(sbs).reduce((s,n)=>s+Number(n||0),0);
      const p={ id:uid(), name:d.name||((brand?brand.name:"")+" ").trim(), model:d.model||"", colorway:d.colorway||"", brandId:d.brandId, brandName:brand?brand.name:"—",
        sku:d.sku||((brand?brand.slug.slice(0,3).toUpperCase():"SKU")+"-"+rint(1000,9999)), price:Number(d.price)||0, compareAtPrice:d.compareAtPrice?Number(d.compareAtPrice):null,
        status:d.status||"Draft", images:(d.images||(d.image?[d.image]:[])), image:((d.images&&d.images[0])||d.image||null), original:!!d.original, description:d.description||"", stockBySize:sbs, stock, sold:0, featured:!!d.featured, createdAt:new Date().toISOString() };
      db.products.unshift(p); put("products",p.id,p); return p;
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
      put("products",id,p); return p;
    },
    deleteProduct(id){ db.products=db.products.filter(p=>p.id!==id); del("products",id); },

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
    updateOrderStatus(id,s){ const o=db.orders.find(x=>x.id===id); if(o){o.status=s; put("orders",id,o);} return o; },
    customers(){ return db.customers.slice().sort((a,b)=>b.spent-a.spent); },
    createOrder(customer,items){
      const line=[]; let sub=0; const touched=[];
      items.forEach(it=>{ const p=db.products.find(x=>x.id===it.productId); if(!p)return; const qty=Math.max(1,it.qty||1); sub+=p.price*qty; line.push({productId:p.id,name:p.name,size:it.size||"—",qty,price:p.price}); p.sold+=qty; if(p.stockBySize&&p.stockBySize[it.size]!=null){p.stockBySize[it.size]=Math.max(0,p.stockBySize[it.size]-qty); p.stock=Object.values(p.stockBySize).reduce((s,n)=>s+Number(n||0),0);} touched.push(p); });
      if(!line.length) return {error:"Mahsulot topilmadi"};
      let cust=db.customers.find(c=>c.phone===customer.phone);
      if(!cust){cust={id:uid(),name:customer.name,phone:customer.phone||"—",city:customer.city||"—",tier:"New",orders:0,spent:0,createdAt:new Date().toISOString()}; db.customers.push(cust);}
      const ship=0, o={id:uid(),number:`#AT${10000+db.orders.length}`,customerName:cust.name,city:cust.city,items:line,subtotal:sub,shipping:ship,total:sub+ship,status:"Pending",createdAt:new Date().toISOString()};
      db.orders.unshift(o); cust.orders++; cust.spent+=o.total;
      put("orders",o.id,o); put("customers",cust.id,cust); touched.forEach(p=>put("products",p.id,p));
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

    // settings (admin credentials)
    settings(){ return db.settings || {...DEFAULT_SETTINGS}; },
    updateSettings(d){ db.settings = { ...API.settings(), ...d }; put("singletons","settings",db.settings); return db.settings; },
    login(email,pass){ const s=API.settings(); return (email||"").trim().toLowerCase()===String(s.adminEmail).toLowerCase() && pass===s.adminPassword; },

    // about (Biz haqimizda — admin orqali tahrirlanadi)
    about(){ return db.about || {...DEFAULT_ABOUT}; },
    updateAbout(d){ db.about = { ...API.about(), ...d }; put("singletons","about",db.about); return db.about; },

    /* ---------- cart (har qurilmada alohida — localStorage) ---------- */
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
