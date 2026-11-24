# Render / GitHub: Idrok 3.5 ni yangilash

Tekshirilgan manzil: https://idrok-adaptiv-demo.onrender.com/ . 2026-11-23 kuni sayt 3.4 versiyada ochildi; admin hisobida TeX worker ulanmagani va PDF yaratish tugmasi o‘chiqligi ko‘rildi. Saytning GitHub repozitoriyasi va Render boshqaruvi ushbu paketni tayyorlash vaqtida ulanmagan.

1. Renderda ishlatilayotgan **IDROK_DATA_DIR**ni zaxiralang. Hisoblar va barcha fayllar shu SQLite bazasida. Yangi bo‘sh `data` papkasi bilan almashtirmang. Doimiy disk bo‘lmasa redeploy ma’lumotlarni yo‘qotishi mumkin.
2. ZIP ichidagi loyiha kodini aynan Renderga ulangan GitHub repozitoriyasiga yangilang. `.env`, `data`, `node_modules` va shaxsiy fayllarni yubormang. Adminning serverga tegishli `private/admin-seed.json` faylini ochiq ommaviy repozitoriyga qo‘ymang; serverdagi mavjud nusxani saqlang. `private` fayl build/start vaqtida mavjud bo‘lishi kerak.
3. Node.js 24; build: `npm ci --include=dev && npm run build`; start: `npm start`. Avvalgi Environment qiymatlari va doimiy disk manzilini saqlang.
4. Deploydan keyin 3.5 yozuvi chiqsin. Admin **Talabalar ishlari**ga kirsin; talabada bitta mashq va fayl saqlang, admin panelida yangilang. Eski bazaga faoliyat jadvali avtomatik qo‘shiladi; oldingi hisoblar saqlanadi.
5. **Overleafda ochish** alohida TeX worker tokenisiz ishlaydigan import yo‘li. PDF Overleafda yaratiladi va Idrokka qayta yuklanadi.
6. Aynan Idrok ichida PDF yaratish uchun Docker ishlaydigan alohida TeX worker kerak. `TEX_ISHGA_TUSHIRISH.md`dagi worker sozlanadi, keyin Render Environment: `IDROK_TEX_MODE=remote`, `TEX_WORKER_URL=https://WORKER_DOMENI`, `TEX_WORKER_TOKEN=WORKER_BILAN_BIR_XIL_MAXFIY_TOKEN`. Tokenni chat yoki repozitoriyga yozmang.
7. Redeploydan keyin **Kompilyatorni amalda sinash**ni XeLaTeX, pdfLaTeX va LuaLaTeXda alohida bosing. Haqiqiy PDF muvaffaqiyati chiqmaguncha worker tayyor deb hisoblamang.

Ushbu paket tayyorlashda hosting sozlamasi yoki pulli xizmat yaratilmagan. Renderdagi boshqaruvga kirish va mavjud worker manzilisiz onlayn worker yoqilgani deb da’vo qilinmaydi. Parollar o‘zgartirilmagan.
