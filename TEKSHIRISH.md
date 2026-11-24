## 3.5 brauzer interfeysi sinovi — 2026-11-23

Sun’iy hisob va ma’lumotlar ishlatilgan alohida lokal UI sinovida:
- “Talabalar ishlari” ro‘yxati va “Barcha ishlar” ochildi.
- Talabaning tanlagan javobi va to‘g‘ri javob LaTeX bilan ko‘rindi.
- Maple manba fayli, loyiha yechimi, LaTeX qoralamasi va SI savol-javobi ochildi.
- Worker yo‘q holatidagi amaliy sinov xatoni ko‘rsatdi; PDF tugmasi o‘chirilganicha qoldi.
- “Overleafda ochish” rasmiy Overleaf login sahifasiga olib bordi. Overleafga kirish amalga oshirilmadi; loyiha importi yakuni va u yerdagi PDF kompilyatsiyasi tasdiqlanmagan.
- Vaqtinchalik UI fixture yakuniy kod va distributivdan olib tashlandi.

# 3.5 tekshiruv natijalari

- Haqiqiy onlayn sayt `https://idrok-adaptiv-demo.onrender.com/` admin hisobida ochildi. LaTeX bo‘limida “Ulanishni tekshirish” bajarildi: TeX Live worker ulanmagan; PDF yaratish nofaol (2026-11-23).
- `npm test`: eski regressiyalar va yangi monitor/Overleaf sinovlari. Administrator huquqi serverda tekshirilishi, boshqa talabaga yopiq fayllar, qidirish, test javoblari, loyihalar, SI hodisalari, jonli javob/ball, restart, avtomatik TeX arxivi va ZIPning haqiqiy Python zipfile bilan o‘qilishi tekshirildi.
- Kompilyator API sinovlari nazoratdagi sun’iy PDF javobidan foydalanadi; haqiqiy onlayn TeX sinovi deb hisoblanmaydi. Ushbu ish muhitida Docker yo‘q. Mahalliy pdflatex/xelatex/lualatex sinovlari format fayllari yo‘qligi sabab PDF yaratmadi; Tectonic tashqi yuklash yo‘li qayta ishlatilmadi.
- Overleafning rasmiy `snip_uri` ZIP/base64, `engine`, `main_document` parametrlari qo‘llanadi; ZIP ichidagi Unicode va ikkilik fayl baytlari sinovdan o‘tdi. Tashqi Overleaf hisobida kompilyatsiya yakunlangani tasdiqlanmagan.
- Yangi versiya internetga avtomatik deploy qilinmagan. Keyingi tekshiruv: doimiy serverdagi `Kompilyatorni amalda sinash` tugmasida haqiqiy PDF natijasi.

---

# 3.4 administrator va umumiy kutubxona sinovlari

- `npm run build`: TypeScript va tayyor ishlab chiqarish buildi.
- `npm test`: oldingi funksiyalar regressiyasi va yangi `tests/admin34.test.mjs`.
- Haqiqiy HTTP/SQLite orqali: eski sxema migratsiyasi, adminning bir martalik yaratilishi, soxta admin roli bilan ro‘yxatdan o‘tishni cheklash, Gmail loginlari ro‘yxati, umumiy dars/savol/fayl/ishlar, shaxsiy ma’lumot izolyatsiyasi, arxiv, umumiy savoldan jonli viktorina, parol almashtirish, sessiya bekor qilinishi va restartda yangi parolning saqlanishi tekshirildi.
- Foydalanuvchi bergan admin paroli alohida vaqtinchalik baza bilan haqiqiy login orqali tekshirildi. Parol test manbasiga yozilmadi.
- Brauzerda vaqtinchalik sun’iy ma’lumotlar bilan admin paneli, darsni tahrirlash → talaba kutubxonasida ko‘rish, dars ochish, test javobini tekshirish va Maple manba faylini ochish tekshirildi. Bu UI fixture yakuniy paketga kiritilmagan. Server huquqlari alohida haqiqiy HTTP sinovlarida tekshirildi.
- Internetdagi saytga deploy qilinmadi. Tashqi xizmatlar va TeX kompilyatori bo‘yicha quyidagi 3.3 chegaralari o‘z kuchida.

---

# Idrok 3.3 — tekshirish tartibi

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

1. **LaTeX chizmalar → Tez chizma · SVG**da Uchburchak, Aylana, Parabola namunalarini tanlang.
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

## Yangi TeX importi

1. **Mavzu va savollar → TeX test importi → Namunani ko‘rish**: 2 savol va mos kalitlar chiqsin.
2. **Tekshirilgan savollarni bazaga qo‘shish**: 1 yangi mavzu, 2 yangi savol paydo bo‘lsin.
3. `examples/Idrok_test_exam.tex` va `Idrok_test_custom.tex`ni alohida import qiling.
4. `CorrectChoice`ni `choice`ga almashtirib kalitsiz savol sinang: javobni belgilamaguncha import tugmasi faol bo‘lmasin.
5. Beshinchi variant yoki ikkinchi to‘g‘ri javob qo‘shing: import xato bersin, savol jim tashlab yuborilmasin.
6. Qavslarni va formulalarni tekshiring; maxsus makroslar avtomatik yoyilmaydi.

## Jonli viktorina

1. Boshlovchi va kamida 2 talaba hisobini turli brauzer/profillarda oching. Bitta brauzerning oddiy tablari bir sessiyani bo‘lishadi; mustaqil ishtirokchi uchun alohida profil kerak.
2. Boshlovchi **Jonli viktorina → Viktorina yaratish**da import qilingan mavzuni filtrlab, savollarni tanlasin.
3. Talabalar PIN va turli o‘yin ismlari bilan qo‘shilsin. Boshlovchi boshlasin.
4. Bir talaba to‘g‘ri, biri xato javob yuborsin; ikkinchi marta javob yuborish taqiqlansin.
5. Savol davomida to‘g‘ri javob/natija yashirin, vaqt tugaganda ochiq bo‘lsin. Vaqtdan keyin javob qabul qilinmasin.
6. Keyingi savol, yakuniy reyting, CSV hisobot va **Xonalarim**dan qayta ochishni tekshiring.
7. Serverni qayta ochganda xona/natija saqlansin. Ishtirokchi boshlovchi boshqaruvi yoki hisobot APIga kira olmasin.

## To‘liq LaTeX — operator uchun qabul sinovi

`TEX_ISHGA_TUSHIRISH.md` bo‘yicha worker o‘rnating. Image qurish va haqiqiy kompilyatsiya ushbu yetkazilgan versiya uchun hostingda tekshirilishi zarur.

1. Worker o‘chiq: holat xabari va nofaol PDF yaratish tugmasi ko‘rinsin; tez SVG ishlasin.
2. Worker yoqilgan: XeLaTeXda TikZ/foreach, pdfLaTeXda PGFPlots 3D, LuaLaTeXda TikZ namunasini kompilyatsiya qiling.
3. `\input` uchun kichik `.tex` yordamchi fayl, `\includegraphics` uchun PNG qo‘shing; ikkalasi PDFga chiqsin.
4. Ataylab noto‘g‘ri buyruq kiriting: aniq xato va jurnal ko‘rinsin, oldingi PDF yangi natija sifatida saqlanmasin.
5. JSON loyiha eksport/importida manba va yordamchi fayllar tiklansin. PDF + loyiha “Mening ishlarim”ga saqlansin.
6. Kontroller operatori Docker konfiguratsiyasidagi tarmoq, resurs va mount cheklovlarini tekshirsin. Tajriba uchun cheklovlarni ommaviy serverda o‘chirmang.

## Dasturiy tekshiruvlar va amaldagi chegaralar

`npm ci --include=dev`, `npm run build`, `npm test`.

2026-11-23: TypeScript/production build va 10 ta test fayli muvaffaqiyatli bajarildi. Yangi testlar TeX parseri, to‘g‘ri javoblar/limitlar, CSVdagi formula himoyasi, Docker argumentlari va xatoda cleanup, kompilyator API autentifikatsiyasi/parallel limit, HTTP routing, viktorina boshlovchi/ishtirokchi ruxsatlari, kalitlarni yashirish, server vaqti va ball, takroriy/kechikkan javob, hisobot, SQLite restart saqlanishi va xona o‘chirilishini qamraydi.

Brauzerda alohida xotiradagi sun’iy ma’lumotli UI nusxasida: 2 TeX savolni ko‘rish/import qilish, yangi mavzuni jonli o‘yinga tanlash, xona/boshlash/natija/keyingi savol/yakuniy reyting, to‘liq TeX muharriridagi namuna va ulanmagan holat, tez SVG uchburchak ko‘rinishi tekshirildi. Gorizontal ortiqcha aylantirish kuzatilmadi. Haqiqiy auth va SQLite oqimi API testlarida sinalgan. Sun’iy UI yakuniy paketdan olib tashlandi.

**Haqiqiy Docker image build va PDF kompilyatsiya sinovi bajarilmadi:** muhitda Docker yo‘q. Mavjud TeX dvigatellarining format fayllari yo‘q edi; yordamchi kompilyator urinishini tekshirilmagan HTTPS manziliga ulanish sababli avtomatik xavfsizlik tekshiruvi rad etdi. Bu urinish qaytarilmadi. TeX worker testi runner o‘rniga sun’iy natija bilan bajarilgan; haqiqiy PDF yaratilgani da’vo qilinmaydi. Operator yuqoridagi qabul sinovini o‘z Docker serverida bajarishi kerak.

Haqiqiy OpenAI API kaliti, tashqi shaxsiy hisoblar va Maple/Wolfram yadrolari ishlatilmagan. Ularning avvalgi mock/havola/fayl yo‘llari regressiya testlarida saqlangan. Internetga deploy bajarilmagan.
