# Idrok 3.1 — Idrok 3.0 ning kengaytirilgan adaptiv ta’lim muhiti

Mustaqil Node.js serverida ishlaydigan nusxa. Saytga kirishda ChatGPT hisobi yoki ChatGPT plaginlari talab qilinmaydi. Bu paketning o‘zi domen yaratmaydi: internet manzili hostingga joylangandan keyin beriladi.

## 3.1 da qo‘shilgan imkoniyatlar

- **Mavzu va savollar**: yangi mavzu/dars yaratish; 4 variantli savol kiritish; to‘g‘ri javob, izoh va 1–3 qiyinlik darajasi; tahrirlash, qidirish, arxivlash/tiklash.
- **LaTeX**: dars, misol, savol, javob variantlari, yechim va SI javoblarida matematik formulalar. Muharrirda kasr/ildiz/integral/limit tugmalari va jonli ko‘rinish. Formulalar KaTeX bilan mahalliy render qilinadi; CDN talab qilinmaydi.
- **Adaptiv testlar**: o‘zingiz kiritgan faol mavzu va savollar ham darslar, bilim xaritasi, maqsadlar, mashqlar, diagnostika va tavsiyalarga kiradi. Savol bir mashg‘ulotda takrorlanmaydi. Arxivlangan yozuvlar yangi testlarga kirmaydi.
- **Grafik laboratoriyasi**: real qiymatli y=f(x) ifodalari; bir oynada 4 ta grafik; a, b, c parametrlari; t bo‘yicha animatsiya; ko‘rinish chegaralari, masshtab, sonli urinma va SVG eksporti.
- **Ta’lim vositalari**: GeoGebra, Kahoot, Desmos, PhET va Google Forms uchun alohida menyu. Tashqi xizmat yangi oynada ochiladi; hisoblar va natijalar avtomatik sinxronlanmaydi.
- **Bazani eksport/import qilish**: mavzu va savollarni JSON faylga olish, boshqa brauzerga ko‘chirish va bazalarni birlashtirish. Bir xil ID — mavjud yozuvni yangilaydi; qolgan yozuvlar saqlanadi. Birlashtirishdan oldin ko‘rib chiqish oynasi bor.
- **O‘qituvchi paneli**: haqiqiy joriy bazadagi mavzu va savollar soni, uch darajadagi savollar qamrovi va joriy profil natijalari.

Boshlang‘ich bazada 4 mavzu va 72 savol bor. O‘zingiz qo‘shib, 50 mavzu va 2000 savolgacha kengaytirishingiz mumkin; amaldagi hajm brauzer xotirasiga ham bog‘liq. `NAMUNA_SAVOLLAR.json` — matematik analizdan “Hosila va uning tatbiqlari” mavzusi, LaTeXli dars va 6 savol (har darajada 2 tadan) uchun tayyor import namunasi.

### Mavzu va savol qo‘shish

1. **Mavzu va savollar → Yangi mavzu**: nomi, fan, davomiylik, dars mazmuni va yechilgan misolni kiriting. **Mavzuni saqlash**ni bosing.
2. **Shu mavzuga savol**: savol matni, A–D javoblar, to‘g‘ri javob va yechimni kiriting. Qiyinlikni belgilang, **Savolni saqlash**ni bosing.
3. **Talaba ko‘radigan namuna** panelida formulalarni tekshiring. **Saqlangan testni sinash** orqali testni boshlang; saqlanmagan o‘zgartirishlar testga kirmaydi.
4. **Bazani yuklab olish** orqali zaxira oling. Import uchun 5 MB gacha Idrok JSON fayli tanlanadi. U faqat mavzu va savollarni ko‘chiradi; PDFlar, natijalar va profil bu eksportga kirmaydi.
5. Keraksiz mavzu yoki savolni arxivlang. Tiklash uchun **Arxivdagilarni ko‘rsatish**ni yoqing. Oxirgi faol mavzuni arxivlab bo‘lmaydi.

LaTeX namunasi:

```text
$f(x)=x^3$ funksiyaning hosilasini toping.
Javob: $f'(x)=3x^2$.
Alohida formula: $$\int_0^1 x^2\,dx=\frac{1}{3}$$
```

`$...$`, `$$...$$`, `\(...\)` va `\[...\]` delimitrlari qabul qilinadi. Bu to‘liq `.tex` hujjat kompilyatori emas: matematik formulalar va oddiy matn uchun. KaTeX tanimaydigan formula xato bilan ko‘rsatiladi; muharrir uni saqlashdan oldin tuzatishni so‘raydi.

### Grafik va simulyatsiya

**Grafik laboratoriyasi**da ifodani yozib, **Grafikni yangilash**ni bosing. Masalan:

```text
a*sin(b*x+t)+c
exp(-a*x^2)
ln(x-a)+c
1/(x-a)
if(x<0,-x,x^2)
\frac{\sin(x)}{x}
```

- Parametrlar: a/b/c — −5…5; t — 0…10. Animatsiya faqat t ni o‘zgartiradi; ifodaga t kiriting.
- Arifmetika: `+ - * / ^`, qavslar; `2x`, `2(x+1)` kabi ko‘paytirish; `pi`, `e`. Burchaklar radianlarda.
- Funksiyalar: `sin, cos, tan, asin, acos, atan, sinh, cosh, tanh, asinh, acosh, atanh, exp, ln, log, log2, log10, sqrt, cbrt, abs, floor, ceil, round, sign, min, max, pow, root, atan2, sec, csc, cot`. `ln` va `log` — natural logarifm. `root(-8,3)=-2`.
- Bo‘lakli funksiya: `if(shart,ha,yo‘q)`, shartda `< > <= >= == !=`. Masalan, `if(x<0,sqrt(-x),sqrt(x))`.
- Asosiy LaTeX: `\frac{...}{...}`, `\sqrt{...}`, `\sin(x)`, `x^{2}`. Murakkab matematik LaTeXning barcha buyruqlari grafik parserida qo‘llanilmaydi.
- Ifoda 600 belgigacha; ko‘rinish koordinatalari −1 000 000…1 000 000. Grafik/urinma sonli-taqribiy; tez tebranishlar, uzilishlar, burchaklar va singular nuqtalar to‘liq aniqlanmasligi mumkin.
- Bu real y=f(x) simulyatori. Ixtiyoriy yashirin tenglama, parametrik/3D egri chiziq yoki differensial tenglamaning umumiy yechuvchisi emas. Bunday ishlar uchun menyudagi GeoGebra/Desmosdan foydalaning.
- **Funksiya tahlili** avvalgi ko‘phad/ratsional hisoblagichni saqlaydi; umumiy simulyator bilan bir xil vosita emas.

### Saqlash va demo doirasi

Login serverda tekshiriladi; sessiya 8 soatlik imzolangan HttpOnly cookie orqali yuritiladi. Mavzu/savollar, grafik sozlamalari, profil va natijalar shu manzildagi brauzer xotirasida saqlanadi, PDFlar IndexedDBda. Brauzer ma’lumotlarini tozalash yoki boshqa sayt manziliga o‘tish ularning ko‘rinishiga ta’sir qiladi. Muntazam JSON zaxira oling.

Bu bitta demo hisobli nusxa. Muharrir shu hisobda ochiq; alohida talaba/o‘qituvchi huquqlari, serverdagi umumiy savollar bazasi va qurilmalararo avtomatik almashish ulanmagan. Sinf miqyosidagi ish uchun umumiy ma’lumotlar bazasi va rolli ruxsatlar kerak. Haqiqiy imtihon nazorati yoki o‘zgartirib bo‘lmaydigan baholar tizimi sifatida mo‘ljallanmagan.

## 3.0 — berilgan sxema asosidagi model

Bosh sahifa — **Adaptiv tizim modeli**. Sxemaning ko‘k, yashil, sariq, binafsha va pushti bloklari ishlaydigan bo‘limlar sifatida qayta qurildi. Asl sxema bosh sahifadagi ochiladigan panelda ham bor.

| Sxemadagi blok | Demoda bajariladigan amal |
| --- | --- |
| Talaba, individual profil | Ism, qiziqish, ehtiyoj va materialni taqdim etish afzalligini saqlash |
| Bilishning maqsadi | Mavzu, 50–100% maqsad, kompetensiya va kutilayotgan natija |
| Identifikatsiyalash | Faol savolli mavzulardan diagnostika; kuchli/zaif mavzular xaritasi |
| Tizim qoidalari va algoritmlari | Maqsadga ko‘ra tavsiya, 3 darajali savollar, qaror sababini ko‘rsatish |
| Rol | Talaba, o‘qituvchi va tizim namoyish rejimlari |
| Maqsadli loyihalar | Topshiriq yaratish, matnli yechim topshirish va o‘qituvchi izohi |
| Raqamli ta’lim resurslari | PDF kutubxonasi; video, audio, veb va simulyator havolalari |
| SI vositalari | Server orqali OpenAI; PDFga savol; bilim darajasi va maqsadga mos tutor |
| Ta’limiy faoliyat | Darsni o‘qish, adaptiv mashq, funksiya tahlili, loyiha va SI bilan muhokama |
| Interaktiv baholash | Ichki testlar va javob izohi; natija va CSV eksporti |
| Ta’lim ma’lumotlari | Mashg‘ulot tarixi, bilim xaritasi, loyiha topshiriqlari va fikrlar |
| Aqlli qarorlar, qayta yordam | Natijadan tavsiya; tushunish bahosi past bo‘lsa qayta dars; SI izohi |
| Yechim va rivojlanish | Har yakunlangan mashqdan keyin yangilanadigan profil va o‘quv yo‘li |

**Adaptiv tanlash:** tanlangan maqsad mavzusi hali kerakli foizga yetmagan bo‘lsa, avval u beriladi. Aks holda eng past ko‘rsatkichli mavzu tanlanadi. Boshlang‘ich mashq darajasi: <45% — 1, 45–74% — 2, >=75% — 3. Har javob darajani 1 pog‘ona oshiradi/pasaytiradi (1–3). Diagnostikada mavzularning darajalari alohida yuritiladi. Har mavzudan ko‘pi bilan 6 savollik mashq yakunida to‘g‘ri javob +5, xato −3 foiz punkt; yakuniy ko‘rsatkich 5–100%. Bu demo algoritmi, psixometrik kalibrlangan baholash emas.

**Diagnostika bahosi:** har faol savolli mavzu uchun 2 tagacha javob olinadi. Bazada bitta savol bo‘lsa bitta olinadi; savolsiz mavzu testga kirmaydi. Boshlang‘ich bazada 8 savol; yangi mavzular qo‘shilganda soni avtomatik o‘zgaradi. Yetishmaydigan qiyinlik darajasi o‘rniga mavjud eng yaqin darajadagi ishlatilmagan savol olinadi. Har to‘g‘ri javobning vazni `25 + 10 × daraja`, xato vazni 0. Yakuniy foiz `min(95, round(15 + 1.5 × o‘rtacha vazn))`. Bu natija shu mavzuning oldingi namuna ko‘rsatkichini almashtiradi.

**SI konteksti:** savol yuborish formasida “Bilim darajam va maqsadimni hisobga olish” katagi mavjud. U yoqilsa maqsad, bilim foizlari, diagnostika holati va taqdimot afzalligi yuboriladi; ism, login, qiziqish/ehtiyojning erkin matni va loyiha tarixi avtomatik yuborilmaydi. Loyiha yoki fikrdagi “SI ko‘magi” tugmasi tegishli matnni savol oynasiga tayyorlaydi; xizmatga yuborish uchun foydalanuvchi alohida **SIga yuborish** tugmasini bosadi.

**Demo doirasi:** rollar bitta demo hisobdagi interfeys rejimlari; serverdagi alohida o‘qituvchi/talaba huquqlari emas. Profil, havolalar, loyihalar, fikrlar va natijalar shu brauzerda; PDFlar IndexedDBda. Bir qurilmada kiritilgan ish boshqa qurilmaga jo‘natilmaydi. Kahoot, Google Forms, MATLAB yoki Cisco hisoblariga avtomatik integratsiya yo‘q — havolalar resurs sifatida qo‘shiladi. Bashoratli tahlil/ML modeli o‘qitilmagan; ko‘rsatiladigan qarorlar ochiq adaptiv qoidalar va mavjud natijalarga asoslangan.

**Sinash tartibi:** `TEKSHIRISH.md` faylini oching. `dist` — tayyor ishlaydigan nusxa, `src` — tahrirlanadigan kod. Login va parol o‘zgartirilmagan.

## Saqlangan 2.0 imkoniyatlari

- **Talaba paneli:** interfeysdagi o‘quvchi/sinf nomlari talaba/guruhga almashtirildi.
- **PDF materiallar:** PDF yuklash, sahifalarni o‘qish, qidirish, yuklab olish va o‘chirish. Bitta fayl 20 MB, kutubxona 60 MB gacha. Fayl brauzer IndexedDB xotirasida saqlanadi. Boshqa talabalar yoki boshqa qurilmalarga avtomatik tarqalmaydi; sayt manzili o‘zgarsa eski manzildagi fayllar yangi manzilda ko‘rinmaydi.
- **PDF bo‘yicha SI:** dastlabki 150 sahifadan, jami 180 000 belgigacha matn olinadi. Savolga mos sahifalardan taxminan 22 000 belgigacha parcha tanlanib yuboriladi. Rasmli/skanerlangan PDF uchun OCR ulanmagan; interfeys buni ko‘rsatadi. Asl PDFning barcha sahifalarini o‘qish mumkin.
- **SI yordamchi:** haqiqiy OpenAI Responses API bilan server orqali ishlaydi. Kalit qo‘yilmaganda “SI ulanmagan” holati chiqadi; tayyor sun’iy javob haqiqiy SI deb ko‘rsatilmaydi.
- **Funksiyani to‘la tekshirish:** ko‘phad va ratsional funksiyalar (surat/maxraj darajasi 6 gacha), aniqlanish va qiymatlar sohasi, simmetriya, nollar va ishora, birinchi/ikkinchi hosila, monotonlik, ekstremumlar, egilish/burilish, limit va asimptotalar, masshtabi o‘zgaradigan grafik, TXT hisobot. Ildiz va koordinatalar sonli-taqribiy. `sin`, `ln`, `sqrt` va boshqa kengroq ifodalar yangi **Grafik laboratoriyasi**da chiziladi; bu bo‘limdagi to‘la analitik tekshirish ko‘phad/ratsional funksiyalar bilan cheklangan.

## SI ulash — sayt egasi uchun

Render’dagi ushbu xizmatning **Environment** sozlamasiga quyidagilarni qo‘shing va **Save, rebuild, and deploy** yoki mos saqlash/ishga tushirish amalini bajaring:

| Muhit o‘zgaruvchisi | Qiymat |
| --- | --- |
| `OPENAI_API_KEY` | O‘zingizning OpenAI API kalitingiz |
| `OPENAI_MODEL` | `gpt-4.1-mini` (ixtiyoriy; standart model) |
| `AI_REQUESTS_PER_HOUR` | `20` (ixtiyoriy; barcha demo foydalanuvchilariga umumiy limit) |

API kalitini https://platform.openai.com/api-keys sahifasida boshqaring. Kalitni GitHub fayliga yoki brauzer kodiga yozmang. API foydalanishi provayder tariflari va hisobingizdagi ruxsat/kvotaga bog‘liq. Model nomini hisobingizda mavjud boshqa mos modelga almashtirish mumkin.

Mahalliy ishlatishda shu qiymatlarni `.env` fayliga yozib, serverni qayta ishga tushiring. `OPENAI_API_KEY` Blueprint’da ataylab majburiy qilinmagan: sayt va funksiya hisoblagichi SI kalitisiz ham ishlaydi.

SIga faqat foydalanuvchi “SIga yuborish” tugmasini bosganda savol, tanlangan PDF matn parchalari va belgilangan bo‘lsa adaptiv kontekst jo‘natiladi. Server yangi SI API’ga kirishni imzolangan demo sessiyasi va Origin bilan tekshiradi, bitta javobni 2200 chiqish tokeni bilan cheklaydi. Soatlik limit server xotirasida: qayta ishga tushganda yangilanadi. Xarajatlarni qat’iy cheklash uchun API hisobingizda ham limit belgilang. “Kalit sozlangan” holati kalit mavjudligini bildiradi; kalit/kvota yaroqliligi birinchi so‘rovda tekshiriladi.

## GitHub/Render’dagi mavjud nusxani yangilash

1. Yangilangan ZIPni alohida papkaga oching.
2. `silver-funicular` repository’sining **Code → Add file → Upload files** bo‘limiga o‘ting.
3. `Idrok_adaptiv_demo` ichidagi fayl va **papkalarni** birga yuklang. `src`, `lib`, `config`, `public`, `scripts`, `tests` papkalari va `package.json`, `package-lock.json`, `render.yaml` repository ildizida bo‘lsin. Mahalliy `.env` va `node_modules` yuklanmaydi.
4. `src` ichida `main.tsx` va `app` ko‘rinsin. Papkani to‘liq sudrab tashlash uning tuzilishini saqlaydi. `Failed to resolve /src/main.tsx` xatosi fayl noto‘g‘ri joyga yuklanganida chiqadi.
5. O‘zgarishlarni saqlang (Commit changes). Render’da **Manual Deploy → Deploy latest commit** ni ishga tushiring. Mavjud xizmatni o‘chirish kerak emas.
6. SI uchun Environment’ga yuqoridagi kalitni qo‘shing. Saytdagi “SI yordamchi” orqali sinang.

## Kompyuterda darhol tekshirish

1. Node.js 24 LTS o‘rnating: https://nodejs.org/
2. ZIP arxivni to‘liq oching.
3. Windows’da `ISHGA-TUSHIRISH.cmd` faylini ishga tushiring. Demo hisob oldindan sozlangan: login — `mr.eshimbetov@gmail.com`, parol — suhbatda belgilagan demo parolingiz.
4. Server ishlagach brauzerda http://localhost:3000 ni oching.

Paketdagi `dist` papkasi tayyor yig‘ilgan. Mahalliy tekshirishda avval paketlarni o‘rnatish shart emas. Terminal orqali:

```sh
npm run setup
npm start
```

Sozlash yordamchisi `.env` yaratadi va sessiya uchun yangi tasodifiy kalit beradi. Parol brauzerga yuboriladigan dasturga kiritilmagan; server konfiguratsiyasida uning tuzlangan PBKDF2 xeshi bor. Hisobni keyin o‘zgartirish uchun hostingda `IDROK_DEMO_EMAIL` va `IDROK_DEMO_PASSWORD` muhit o‘zgaruvchilarini kiriting. `.env` faylini GitHub’ga yuklamang.

## Plaginsiz bepul onrender.com manziliga joylash

Bu qadamlar odatiy brauzer orqali bajariladi. GitHub va Render hisoblari kerak; ChatGPT bilan ulash talab qilinmaydi.

1. https://github.com/new orqali yangi repository yarating. Arxiv ichidagi loyiha fayllarini repository ildiziga yuklang. `.env` va `node_modules` ni yuklamang. `render.yaml` hamda `package-lock.json` ildizda bo‘lsin.
2. https://dashboard.render.com/ ga kiring.
3. **New → Blueprint** tanlab, repository’ni ulang.
4. Demo hisob oldindan sozlangan. Sessiya kaliti avtomatik yaratiladi:

| Sozlama | Qiymat |
| --- | --- |
| Demo login | `mr.eshimbetov@gmail.com` |
| Demo parol | Suhbatda siz belgilagan demo parol; serverda PBKDF2 xeshi saqlangan |
| `IDROK_DEMO_SESSION_SECRET` | Blueprint avtomatik yaratadi |

5. Hisoblash tarifi **Free** ekanini tekshiring. Paketda `plan: free` belgilangan; ma’lumotlar bazasi talab qilinmaydi.
6. Deploy tugagach Render ko‘rsatgan `https://…onrender.com` manzilini oching va demo hisob bilan kiring.

`idrok-adaptiv-demo` — xizmat uchun taklif qilingan nom. Yakuniy manzilning bo‘shligi bu paket bilan tekshirilmagan va u hali band qilinmagan.

Blueprint o‘rniga **New → Web Service** orqali ham joylash mumkin:

| Maydon | Qiymat |
| --- | --- |
| Language | Node |
| Build Command | `npm ci --include=dev && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Instance Type | Free |
| `NODE_VERSION` | `24.22.1` |

Bu usulda `IDROK_DEMO_SESSION_SECRET` o‘zgaruvchisini **Environment** bo‘limida qo‘lda qo‘shing. Demo hisobning login-paroli oldindan sozlangan. Sessiya kalitini quyidagicha yarating va chiqqan qiymatni `IDROK_DEMO_SESSION_SECRET` ga qo‘ying:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Render avtomatik taqdim etadigan `RENDER_EXTERNAL_URL` HTTPS sessiyalar uchun ishlatiladi. Keyin o‘z domeningizni ulasangiz, `APP_ORIGIN` ni o‘sha domenning to‘liq `https://...` manziliga o‘zgartiring.

Bepul Render web-xizmati 15 daqiqa foydalanilmaganda uyquga ketadi; keyingi ochilish taxminan bir daqiqa olishi mumkin. Bepul tarifning joriy limitlari: https://render.com/docs/free

## Kodni o‘zgartirish va tekshirish

```sh
npm ci --include=dev
npm run build
npm test
```

`src/app/` — interfeys, PDF kutubxonasi va funksiya hisoblagichi; `lib/demo-session.ts` — demo kirish; `server.mjs` — Node serveri; `render.yaml` — joylash sozlamalari.

Tekshiruvlar: TypeScript va production build; to‘g‘ri/noto‘g‘ri kirish; sessiya imzosi va muddati; boshqa manbadan so‘rovni rad qilish; HTTPS cookie; chiqish; statik fayllar; maxfiy fayllarni berkitish; ratsional funksiyalarning kutilgan natijalari; SI kirish nazorati, so‘rov cheklovlari, kvota va xatolar. SI API testi sun’iy test javoblari bilan bajariladi; haqiqiy provayder javobi uchun foydalanuvchining API kaliti zarur.

Rasmiy yo‘riqnomalar (2026-11-10 da tekshirilgan):

- https://render.com/docs/blueprint-spec
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/environment-variables
- https://render.com/docs/free

## 3.1 tekshiruvlari va manbalar

`tests/catalogue.test.mjs` — mavzu/savol kiritish, arxiv, import, bir savolli test va dinamik diagnostika; `tests/math-text.test.mjs` — LaTeX va xavfsiz render; `tests/graph-engine.test.mjs` — operatorlar, real funksiyalar, LaTeX, bo‘lakli ifodalar va uzilishlar. Avvalgi login, SI va funksiya tahlili testlari ham saqlangan. `TEKSHIRISH.md`da qo‘lda sinash qadamlari bor.

- KaTeX: https://katex.org/docs/options
- GeoGebra: https://www.geogebra.org/calculator
- Kahoot: https://create.kahoot.it/ va https://kahoot.it/
- Desmos: https://www.desmos.com/calculator
- PhET: https://phet.colorado.edu/en/simulations/filter?subjects=math&type=html
- Google Forms: https://docs.google.com/forms/

KaTeX MIT litsenziyasi `licenses/katex-LICENSE.txt`da. Kutubxona shriftlari tayyor `dist` ichida joylashgan.
