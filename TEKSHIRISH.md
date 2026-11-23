# Idrok 3.2 — tekshirish tartibi

## Ishga tushirish va hisob

Node.js 24 bilan `npm run setup`, `npm start`. http://localhost:3000 ni oching.

1. Ro‘yxatdan o‘tishda Gmail bo‘lmagan manzilni sinang: rad etilishi kerak.
2. O‘z Gmail manzilingiz, ism va kamida 10 belgili Idrok paroli bilan hisob yarating. Gmail parolini ishlatmang.
3. Tiklash kodini saqlang. Eski umumiy demo hisobidan foydalanilmaydi. Pochta egaligi tasdiqlanmaydi, faqat @gmail.com filtri bor.
4. Hisobdan chiqing, qayta kiring. Boshqa brauzerdan shu hisobga kirib saqlangan ma’lumotni tekshiring.
5. Parolni tiklashda Gmail, saqlangan kod va yangi parolni kiriting; yangi tiklash kodini saqlang. Oldingi kod va sessiyalar bekor bo‘ladi.

## Saqlangan ish

1. **Mening ishlarim → Yangi**. Nom, dastur va o‘zingizning Share/Embed havolangizni kiriting.
2. **Ishni saqlash**dan keyin kartani tanlang: ichki ko‘rinish yoki asl dasturga havola chiqadi.
3. Google Forms uchun `/viewform`, GeoGebra uchun `/m/ID`, Desmos uchun `/calculator/ID`; Kahoot ochiq/unlisted bo‘lsin. To‘liq iframe kodi ham qabul qilinadi.
4. PhET oddiy simulyatsiya holatni saqlamaydi. Natijangiz rasmini/PDFini biriktiring. Kahoot/Forms hisobotini CSV/PDF qilib biriktiring.
5. Nomi va izohini tahrirlang, qayta saqlang. Sahifani yangilang va yozuv qolishini tekshiring.
6. Yangi alohida hisobga kiring: avvalgi hisobning ish va fayllari ko‘rinmasligi kerak.

## Maple va Wolfram

1. `namunalar/Maple_namuna.mpl`ni **Asl faylni yuklash** orqali yuklang, dasturdan Maple’ni tanlab ishni saqlang.
2. **Fayllar → Ko‘rish**da kod matni ochiladi. **Asl faylni yuklab olish** bilan nusxa oling.
3. **Kodini ochish**da tahrir qilib **Yangi fayl sifatida saqlash** yoki **Faylni eksport qilish**ni sinang. Asl fayl saqlanib qoladi.
4. **Paket kodi → Wolfram → Namunaviy kodni qo‘yish**ni tanlang, `.wl` eksport qiling. Shu yo‘l bilan MATLAB/Octave, SageMath va Python ham mavjud.
5. `.mw`, `.maple`, `.nb`, `.wxf` kabi native fayllar asl holida saqlanadi. To‘liq ko‘rinish uchun asl dasturdan eksport qilingan PDF/PNGni natija sifatida biriktiring. Hisoblash yadrosi saytda ishlamaydi.

## LaTeX chizmalar

1. **LaTeX chizmalar**da Uchburchak, Aylana, Parabola namunalarini tanlang.
2. Koordinata, rang yoki `$...$` formulasini o‘zgartiring; jonli chizmani kuzating.
3. **Ishlarimga saqlash**ni bosing. **Mening ishlarim**da TeX manba va SVG biriktirilgan yozuvni oching.
4. **SVG eksport**, **LaTeX eksport**, **LaTeX faylni import qilish**ni sinang.
5. Noma’lum `\input` yoki `\foreach` buyruqlari cheklangan parserda rad etiladi. To‘liq TeX kompilyatori deb talqin qilmang.

## Oldingi imkoniyatlar

- **Mavzu va savollar**da yangi mavzu, LaTeXli savol, A–D javob va izoh qo‘shing. Saqlangan testni sinang. `NAMUNA_SAVOLLAR.json` importi va bazani eksport qilishni tekshiring.
- **Grafik laboratoriyasi**da `a*sin(b*x+t)+c`, `ln(x)`, `if(x<0,-x,x^2)`; parametr, animatsiya, urinma, SVG.
- **PDF materiallar**da matnli PDF yuklang, qidiring va ko‘ring; fayl serverdagi hisobga saqlanadi.
- **SI yordamchi**: kalitsiz aniq ulanmagan holati. Haqiqiy xizmat uchun serverda API kaliti kerak.
- **Adaptiv tizim modeli**, diagnostika, maqsad, loyiha, fikr va natijalar avvalgidek ishlaydi; o‘z hisobingizga saqlanadi.

## Zaxira va deploy

Saqlash holati “Hisobga saqlandi” bo‘lishini kuting. Bir hisobni ikki oynada tahrirlash eski nusxani ustidan yozmasligi kerak: konflikt xabari chiqadi. Xatoda zaxira oling va qayta yuklang. To‘liq server zaxirasi uchun serverni to‘xtatib butun `IDROK_DATA_DIR` papkasini nusxalang.

Render Free diski vaqtinchalik. Haqiqiy hisob/fayllar uchun doimiy disk kerak. `README.md`dagi joylash bo‘limini o‘qing. ZIPning o‘zi saytni internetga joylashtirmaydi.

## Dasturiy tekshiruvlar

`npm ci --include=dev`, `npm run build`, `npm test`.

2026-11-23: production build va 9 test fayli. Yangi testlar Gmail domeni/aliaslar, ro‘yxatdan o‘tish, sessiya, parol tiklash, CSRF, shaxsiy fayl ajratilishi, holat versiyalari, server restartidan keyin saqlanish, fayl baytlarining o‘zgarmasligi, biriktirmalar, iframe host tekshiruvi va TikZ buyruqlarini qamrab oladi. Avvalgi savollar, adaptiv algoritm, LaTeX, grafik va SI testlari saqlangan.

SI so‘rovlari test javoblari bilan sinaladi; haqiqiy API kaliti ishlatilmagan. Tashqi shaxsiy hisoblar ulanmagan, Maple/Wolfram yadrolari ishlatilmagan. Ularning havola/fayl saqlash yo‘llari sinalgan.

Brauzer tekshiruvi: yangi ro‘yxatdan o‘tish shakli ko‘rildi. Alohida, xotiradagi sun’iy ma’lumotli UI nusxasida TikZ uchburchak/parabola, chizmani TeX+SVG bilan ishga saqlash, SVGni ochish, Maple kod fayli yaratish, Wolfram namunasini tanlash va GeoGebra materialini iframe ichida jonli ko‘rish tekshirildi. Gorizontal ortiqcha aylantirish tuzatildi. Hisob yaratish/kirish/tiklash va haqiqiy SQLite saqlash API testlarida tekshirildi. Yakuniy paketdan sun’iy UI nusxasi olib tashlangan, odatiy kirish sahifasi qayta yig‘ilgan.
