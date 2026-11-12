# Idrok 3.0 — namoyish yo‘riqnomasi

1. Node.js 24 o‘rnatilgan kompyuterda ZIPni ochib, `ISHGA-TUSHIRISH.cmd` ni ishga tushiring. Brauzerda `http://localhost:3000` manzilini oching.
2. Login: `mr.eshimbetov@gmail.com`. Parol: `demo123456`.
3. **Adaptiv tizim modeli → Talaba va rollar**: ism, qiziqish va ko‘rish afzalligini saqlang.
4. **Bilish maqsadi**: Shakllar va yuzalar mavzusini, 80% maqsadni belgilang. Tavsiya shu mavzuga o‘tishini ko‘ring.
5. **Identifikatsiya**: 8 savollik diagnostikani yakunlang. Natija va bilim xaritasini ko‘ring.
6. **Adaptiv qoidalar**: joriy mavzu, daraja va tanlash sababini ko‘ring. Mashq bajaring; to‘g‘ri va xato javobda darajalar moslashadi.
7. **Raqamli resurslar → PDF kutubxonasi** yoki chap menyudagi **PDF materiallar**: matnli PDF yuklang, sahifalarini oching. Fayl 20 MB gacha; jami 60 MB.
8. PDF kartasidagi **SIga savol**: material savol manbasiga tanlanganini tekshiring. Savolni tahrirlang. **SIga yuborish** uchun serverda haqiqiy `OPENAI_API_KEY` bo‘lishi kerak.
9. **Maqsadli loyihalar**: talaba sifatida yechim yozib topshiring. **Talaba va rollar**dan o‘qituvchi rejimiga o‘ting, loyihaga izoh yozing. Bu ikki rejim bitta brauzerdagi demo hisobda ishlaydi.
10. **Teskari aloqa**: mavzu va tushunish bahosini tanlab fikr yozing. 1–2 bahoda qayta dars, 3–5 da yangi mashq tavsiya etiladi.
11. Sahifani yangilang: profil, maqsad, loyiha, fikrlar va PDFlar saqlanib qoladi. Natijalar sahifasidan CSV oling.
12. **Funksiya tahlili**: `x^3-3*x` ni tekshiring; hosila, ekstremum va grafikni ko‘ring.

## Render’dagi nusxani yangilash

ZIP ichidagi `Idrok_adaptiv_demo` papkasining ichidagi fayl va papkalarni GitHub loyihasining ildiziga to‘liq yuklang. Ayniqsa yangi `src/app/model-workspace.tsx`, `src/app/adaptive-model.ts`, `src/app/model.css` va `public/adaptive-model.png` fayllarini qoldirmang. `package.json`, `render.yaml` va `src` bir darajada bo‘lsin. Mahalliy `.env` va `node_modules` yuklanmaydi. So‘ng Render xizmatida eng oxirgi commitni deploy qiling.

## SI ulash

Render xizmatining Environment qismiga `OPENAI_API_KEY` qo‘shib, xizmatni qayta ishga tushiring. Ixtiyoriy: `OPENAI_MODEL=gpt-4.1-mini` va `AI_REQUESTS_PER_HOUR=20`. Mahalliy ishlatishda shu qiymatlarni `.env`ga yozing. Kalitni GitHub yoki sayt formasiga kiritmang. “Kalit sozlangan” yozuvi kalit mavjudligini bildiradi; javobni birinchi so‘rov bilan tekshiring.

## Tekshiruvlar haqida

`npm ci --include=dev`, `npm run build`, `npm test` buyruqlari bilan tekshiruvlar qayta bajariladi. SI avtomatik sinovlari nazoratli test javoblari bilan ishlaydi; API kalitisiz jonli model javobi tekshirilmagan. Brauzerda model formasi, maqsad almashishi, loyiha topshirish va izoh, PDF yuklash/ochish hamda saqlanish sinab ko‘rilgan. Interfeys sinovi alohida mahalliy sinov kirish nuqtasida; arxivda oddiy himoyalangan login tiklangan.
