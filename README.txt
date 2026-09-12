USMONOVS PREMIUM — statik sayt + admin panel (serversiz)
=========================================================

FAYLLAR (server/build KERAK EMAS):
  • index.html   — sayt (bosh sahifa, do'kon, mahsulot, savat, checkout)
  • admin.html   — boshqaruv paneli
  • store.js     — umumiy ma'lumotlar bazasi (index va admin ulashadi)
  • logo.png     — brend logosi

KIRISH (admin panel):
  Login (email):  admin@usmonovs.com
  Parol:          admin123
  ⚠ Buni Sozlamalar bo'limidan albatta o'zgartiring (pastga qarang).

BOSHLANG'ICH HOLAT — TOZA:
  • 0 ta mahsulot, 0 ta mijoz, 0 ta buyurtma. Barcha statistikalar nol.
  • 45 ta brend oldindan kiritilgan (Nike, Adidas, Balenciaga, Dior, ...).
  • Mahsulotlarni admin panel orqali o'zingiz qo'shasiz.

ADMIN PANELDA NIMA QILASIZ:
  • Mahsulotlar — qo'shish/tahrirlash: nomi, brend, narx (so'm), o'lchamlar,
    tavsif, "Original" belgisi va 5 tagacha rasm yuklash (birinchi rasm asosiy).
    Ro'yxat sahifalangan (20 tadan) — katta katalogda ham tez.
  • Brendlar, Buyurtmalar, Mijozlar — kuzatish va boshqarish.
  • Sozlamalar:
      – "Biz haqimizda" matni va rasmini o'zgartirish (saytda darhol aks etadi).
      – Admin login (email) va parolini almashtirish (joriy parol talab qilinadi).

SAYTDAGI IMKONIYATLAR:
  • Mahsulotni ochganda rasmlar avtomatik karusel bo'lib aylanadi;
    rasm ustiga bosilsa yaqinlashtirib (zoom) ko'rish mumkin.
  • Aloqa bo'limi: 2 filial manzili + xaritada ochish, telefon (+998 90 524 55 55),
    Instagram (@usmonovs_premium) va ish vaqti (har kuni 09:00–00:00).
  • Barcha narxlar so'mda. Checkoutda faqat +998 telefon so'raladi.

--------------------------------------------------
LOKAL KO'RISH: index.html ni 2 marta bosing.
Admin: pastdagi "up" tugmasi yoki admin.html.

NETLIFY'GA JOYLASH:
  1. app.netlify.com → Add new site → Deploy manually
  2. usmonovs-static PAPKASINI (yoki ZIP'ni) sahifaga tashlang
  3. Tayyor. (Vercel / GitHub Pages / cPanel — shu 4 faylni yuklash kifoya.)

IZOH: Ma'lumot brauzer localStorage'ida saqlanadi (bitta egasi/qurilma
uchun ideal). Barcha mijozlar bir xil bazani ko'rishi va zaxira nusxa
kerak bo'lsa — haqiqiy backend/ma'lumotlar bazasi (masalan Supabase)
ulash lozim; buni keyin qo'shsa bo'ladi.
