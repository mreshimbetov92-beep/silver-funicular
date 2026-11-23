# Idrok 3.2 — adaptiv ta’lim va shaxsiy ishlar

Idrok 3.1 yangilandi. ZIP ichida tahrirlanadigan kod (`src`, `lib`), tayyor sayt (`dist`), testlar va namunalar bor. Bu mustaqil Node.js ilovasi: ChatGPT hisobi yoki plagini talab qilinmaydi. ZIPni olish internetga deploy qilish degani emas.

## Tez ishga tushirish

1. Node.js **24 LTS** o‘rnating: https://nodejs.org/
2. ZIPni to‘liq oching. `Idrok_adaptiv_demo` ichida Windows uchun `ISHGA-TUSHIRISH.cmd`ni bosing.
3. http://localhost:3000 ni oching. **Ro‘yxatdan o‘tish** orqali o‘z hisobingizni yarating.
4. Tiklash kodini faylga yuklab olib, alohida saqlang. Parol unutilsa shu kod kerak bo‘ladi.

Terminaldan:

```sh
npm run setup
npm start
```

Tayyor `dist` uchun `npm ci` talab qilinmaydi. Serverni yopish — terminalda Ctrl+C. Boshqa kompyuterdan foydalanish uchun ilovani HTTPS va doimiy diskli hostingga joylashtirish kerak.

## Gmail orqali ro‘yxatdan o‘tish

Har kim **@gmail.com manzili**, ism va 10–128 belgili Idrok paroli bilan hisob yaratishi mumkin. Gmail parolini kiritmang. Gmail’dagi nuqta va `+belgi` variantlari bir manzil hisoblanadi; ular bilan takroriy hisob yaratilmaydi.

Bu Gmail domeni filtri; pochta qutisi mavjudligi yoki uning egasi ekaningiz **Google OAuth yoki xat bilan tasdiqlanmaydi**. Google bilan kirish/pochta tasdiqlash uchun loyiha egasining alohida OAuth yoki email infratuzilmasi kerak. Hozir parolni tiklash email yubormaydi: bir martalik tiklash kodi ishlatiladi, keyin yangi kod beriladi. Kod yo‘qolsa avtomatik tiklash yo‘li yo‘q.

Parollar scrypt xeshi bilan saqlanadi. Sessiya 8 soatlik HttpOnly, SameSite cookie orqali yuritiladi; HTTPSda Secure ishlatiladi. Tiklash eski sessiyalarni bekor qiladi. Eski umumiy demo login yangi versiyada ishlamaydi.

## Mening ishlarim: havola, asl fayl va natija

1. Tashqi dasturda ishni saqlang va **Share / Embed** havolasini oling.
2. Idrokda **Mening ishlarim → Yangi**ni bosing. Nom va dasturni tanlang.
3. Ulashish havolasi yoki bitta `iframe` kodini kiriting. Asl loyiha fayli, ko‘rinish/natija va xulosani ham qo‘shish mumkin.
4. **Ishni saqlash**ni bosing. Ro‘yxatdagi ishni tanlaganda ichki ko‘rinish ochiladi.
5. Tashqi xizmat ichida keyingi o‘zgartirishni o‘sha xizmatda saqlang. Snapshot bo‘lsa, yangi havolani Idrokda yangilang. Natija fayli alohida yangilanadi.

| Dastur | Sayt ichida ko‘rish / saqlash |
| --- | --- |
| GeoGebra | Saqlangan `/m/ID` yoki rasmiy Embed havolasi; `.ggb` asl fayli va PDF/rasm natija |
| Kahoot | Ochiq yoki unlisted viktorinaning Share/Embed havolasi; sessiya hisoboti uchun CSV/PDF |
| Desmos | `/calculator/ID` grafik havolasi. Save and Share — xizmatdagi saqlangan holat; Snapshot — o‘sha paytdagi nusxa |
| PhET | Rasmiy HTML5 simulyatsiyasining `/sims/html/.../latest/...html` manzili. Oddiy havola tajriba holatini saqlamaydi; natija rasm/PDF va izoh bilan saqlanadi. Studio preset havolasi ham yozuvga qo‘shiladi |
| Google Forms | `.../viewform` yoki Embed HTML. `forms.gle` qisqa havolasi alohida ochiladi. Javoblar/hisobot CSV yoki PDF ko‘rinishida biriktiriladi |
| Wolfram Cloud | Ochiq `/obj/...` yoki `/env/...` obyekt havolasi; uning xizmatdagi ruxsatlari amal qiladi |

Iframe ko‘rinishi tashqi xizmatning ruxsatlari, hisob/tarif talabi va brauzer siyosatiga bog‘liq. Xizmat ichki ko‘rinishni bermasa **Asl dasturda ochish** tugmasi va biriktirilgan natija mavjud. Idrok tashqi shaxsiy hisobga avtomatik kirmaydi, baholarni yoki iframe ichidagi tahrirni o‘z bazasiga avtomatik ko‘chirmaydi. Google Formsning `/edit` havolasini kiritmang.

**Ta’lim vositalari** menyusida GeoGebra, Kahoot, Desmos, PhET, Google Forms, Maple va Wolfram manzillari bor.

## Maple, Wolfram va boshqa paketlar

**Mening ishlarim → Fayllar** orqali yuklangan asl faylni ko‘ring yoki yuklab oling. **Paket kodi** bo‘limida Maple, Wolfram, MATLAB, GNU Octave, SageMath va Python uchun tayyor kod namunalari bor.

Qo‘llanadigan fayllar:

- Maple: `.mw`, `.mws`, `.maple`, `.mpl`.
- Wolfram/Mathematica: `.nb`, `.ma`, `.nbp`, `.wl`, `.wls`, `.wxf`, `.cdf`, `.m`.
- Boshqa: `.ggb`, `.m`, `.mat`, `.sage`, `.py`, `.ipynb`, `.r`, `.tex`, `.tikz`, `.csv`, `.json`, `.txt`, `.html`.
- Ko‘rinish: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`.

Asl yuklangan fayl **baytlari o‘zgartirilmasdan** qaytariladi. 1 MB gacha matnli kodni ochish, tahrirlash va yangi fayl sifatida eksport qilish mumkin. Native hujjatning kod matni uning to‘liq vizual ko‘rinishi emas: chizma/hisob natijasi uchun asl dasturdan PDF yoki rasm eksportini ham biriktiring. HTML kod sifatida ko‘rsatiladi, bajarilmaydi.

Maple/Mathematica hisoblash yadrolari, MATLAB litsenziyasi yoki Python server muhiti paketga kiritilmagan. Kod serverda bajarilmaydi. `.mw` ↔ `.nb` kabi formatlararo to‘liq avtomatik konvertatsiya yo‘q. `namunalar/` papkasidagi kodlarni tegishli dasturda ishga tushiring.

## LaTeX bilan chizma yaratish

**LaTeX chizmalar** bo‘limida TikZ kodi kiriting yoki Uchburchak/Aylana/Parabola namunasini tanlang. Jonli chizma, koordinata chegaralari, `.tex/.tikz` importi, `.tex` va `.svg` eksporti hamda **Ishlarimga saqlash** mavjud. Saqlangan ishga TeX manba va SVG natija biriktiriladi.

```tex
\begin{tikzpicture}
\draw[gray,step=1] (-1,-1) grid (5,4);
\draw[blue,thick] (0,0) -- (4,0) -- (1,3) -- cycle;
\node at (2,-0.6) {$S=\frac12 ah$};
\end{tikzpicture}
```

Brauzer ko‘rinishi TikZning cheklangan buyruqlar to‘plamini qo‘llaydi: `draw`, `fill`, `filldraw`, `node`; to‘g‘ri kesmalar, `cycle`, `rectangle`, `circle`, `ellipse`, `grid`, `plot`. Koordinatalar sonli. Plotda `\x` va ko‘phad kabi ifodalar. Limit: 20 000 belgi, 150 buyruq, 3000 shakl. Noma’lum buyruq xato beradi.

Bu to‘liq TeX kompilyatori emas: makroslar, `foreach`, tashqi fayllar/paketlar va trigonometrik TikZ plot qo‘llanmaydi. Trigonometrik grafiklar uchun **Grafik laboratoriyasi**ni ishlating (radianlarda). To‘liq TikZ uchun eksport qilingan TeXni o‘z LaTeX muhitingizda kompilyatsiya qiling. SVG formula yorliqlari MathML ishlatadi; zamonaviy brauzerda oching. TikZda ko‘rsatilmagan uslublar eksport va brauzer o‘rtasida farq qilishi mumkin.

## Mavzu, savol, adaptiv ta’lim

3.1 dagi imkoniyatlar saqlangan: 4 boshlang‘ich mavzu, 72 savol; yangi mavzu/dars va 4 variantli savol yaratish; 1–3 qiyinlik darajasi; izoh, tahrir, arxiv/tiklash; JSON import/eksport; formulalarning jonli ko‘rinishi. `NAMUNA_SAVOLLAR.json` — hosiladan 1 mavzu va 6 savol.

**Mavzu va savollar → Yangi mavzu → Shu mavzuga savol** orqali qo‘shing. Formula uchun `$...$`, `$$...$$`, `\(...\)`, `\[...\]` ishlatiladi. **Saqlangan testni sinash** orqali natijani ko‘ring. Faol mavzular darslar, maqsad, diagnostika va tavsiyalarga ham kiradi. 50 mavzu va 2000 savolgacha; import fayli 5 MB gacha, hisobning bitta holat yozuvi 3 MB gacha.

Maqsad mavzusi bajarilmagan bo‘lsa avval u, aks holda past o‘zlashtirishli mavzu tavsiya qilinadi. Mashq darajasi <45% da 1, 45–74% da 2, >=75% da 3. Javob darajani 1 pog‘ona oshiradi/pasaytiradi. Har mashg‘ulotda savol takrorlanmaydi, yetishmaydigan daraja o‘rniga mavjud eng yaqin daraja olinadi. Bu qoidalarga asoslangan adaptiv algoritm; psixometrik kalibrlangan imtihon yoki o‘qitilgan bashorat modeli emas.

O‘qituvchi/talaba rejimlari hozir **o‘z hisobingizdagi ish rejimlari**. Boshqa hisoblar natijalariga kirish, sinfni markaziy boshqarish va o‘zgartirib bo‘lmaydigan rasmiy baholar bazasi ulanmagan.

## Grafik, PDF va SI

- **Grafik laboratoriyasi:** 4 ta real `y=f(x)`, `a,b,c` parametrlari, `t` animatsiyasi, masshtab, sonli urinma, SVG. Misollar: `a*sin(b*x+t)+c`, `ln(x)`, `1/(x-1)`, `if(x<0,-x,x^2)`, `\frac{\sin(x)}{x}`. Umumiy yashirin/3D tenglamalar yechuvchisi emas.
- **Funksiya tahlili:** ko‘phad/ratsional ifoda, surat/maxraj darajasi 6 gacha; hosilalar, monotonlik, ekstremum, asimptota, grafik va TXT. Sonli-taqribiy chegaralar bor.
- **PDF materiallar:** yuklash, ko‘rish, qidirish, o‘chirish va SIga savol tayyorlash. Bitta fayl 20 MB; PDF bo‘limi 60 MB, barcha fayllar uchun hisob bo‘yicha jami 100 MB. Dastlabki 150 sahifadan 180 000 belgigacha matn olinadi; skanlar uchun OCR yo‘q.
- **SI yordamchi:** OpenAI Responses API server orqali. `.env` yoki hosting Environment’da `OPENAI_API_KEY`ni belgilang. Ixtiyoriy: `OPENAI_MODEL=gpt-4.1-mini`, `AI_REQUESTS_PER_HOUR=20`. Bu limit barcha hisoblarga umumiy va server qayta ishga tushganda yangilanadi. Kalitni brauzer, savol, Git yoki ZIPga kiritmang. Kalit bo‘lmasa SI ulanmagan holati chiqadi.

SIga faqat **SIga yuborish** bosilganda savol, tanlangan PDF parchalari va foydalanuvchi belgilasa o‘quv konteksti jo‘natiladi. Maple/Wolfram fayllari avtomatik SIga yuborilmaydi. Haqiqiy SI javobi uchun yaroqli kalit va provayder kvotasi kerak; testlar sun’iy javob bilan tekshirilgan.

## Ma’lumotlarni saqlash va zaxira

Hisoblar, profil, mavzu/savollar, model, grafik/LaTeX sozlamalari, fayllar va ish yozuvlari **serverdagi SQLite** bazasiga saqlanadi: `IDROK_DATA_DIR/idrok.sqlite` (standart `data/`). Bir xil hostingdagi hisobga boshqa brauzerdan kirilganda ma’lumotlar olinadi. Har bir hisob ma’lumoti ajratilgan.

Yuqoridagi saqlash holatini kuzating. Bir hisob ikki oynada o‘zgartirilsa eski nusxa yangisini ustidan yozmaydi: zaxira olish va sahifani yangilash taklif qilinadi. Tarmoq xatosida qayta saqlash yoki **Zaxira olib chiqish** bor. Holat JSON zaxirasi fayllarni o‘z ichiga olmaydi va avtomatik to‘liq tiklash vositasi emas; mavzu/savollar uchun o‘z JSON importi mavjud. Fayllarni alohida yuklab oling.

Sayt egasi to‘liq zaxira uchun serverni to‘xtatib, **butun `IDROK_DATA_DIR` papkasini** nusxalashi kerak; qayta tiklashda serverni to‘xtatib shu papkani qaytaring. Ishlab turgan SQLite faylini WALsiz nusxalashdan saqlaning. Bu papkada foydalanuvchi fayllari va parol xeshlari bor — ochiq Git/ZIPga yuklamang. Paketda foydalanuvchi bazasi yo‘q.

Limitlar: hisobga 200 ish, 250 fayl, 100 MB; faylga 20 MB. Server fayllari jami standart 2048 MB (`IDROK_MAX_STORAGE_MB` bilan sozlanadi). SQLite, indeks va matnlar uchun diskda qo‘shimcha bo‘sh joy qoldiring. Bitta server nusxasi uchun mo‘ljallangan.

**3.1 dan ko‘chish:** yangilashdan oldin eski brauzerdagi mavzu/savollarni JSON eksport qiling, PDFlarni yuklab oling. Keyin yangi hisobga import qiling. Eski umumiy demo profilining localStorage/IndexedDB ma’lumotlari yangi Gmail hisobiga avtomatik biriktirilmaydi.

## Internetga joylash

Loyiha ildizida `package.json`, `package-lock.json`, `src`, `lib`, `scripts`, `tests`, `public`, `licenses` va `dist` bo‘lsin. `.env`, `data`, `node_modules`ni Gitga yubormang. Build: `npm ci --include=dev && npm run build`; start: `npm start`; health: `/health`; Node 24.

**Doimiy hisoblar uchun doimiy disk zarur.** VPS yoki boshqa persistent volume’da `IDROK_DATA_DIR`ni belgilang. HTTPS proksi ortida `APP_ORIGIN=https://sizning-domeningiz`ni aniq kiriting. Ishonchli proksi haqiqiy IPni o‘zi o‘rnatsa `IDROK_TRUST_PROXY=1`; aks holda yoqmang. Proksi ortida bu sozlama yo‘q bo‘lsa kirish urinishlari limiti hamma foydalanuvchiga umumiy bo‘lishi mumkin.

`render.yaml` — **bepul vaqtinchalik sinov** uchun. Render Free lokal fayl tizimi qayta ishga tushish/deploy/uyquda yo‘qoladi; unda bu SQLite bazasi va ishlar doimiy saqlanmaydi. Uni haqiqiy foydalanuvchi fayllari uchun ishlatmang. `render-persistent.example.yaml` — foydalanuvchi pulli doimiy diskni tanlagandagina qo‘llaydigan alohida namuna; hech qanday xizmat avtomatik sotib olinmagan yoki deploy qilinmagan. Render’da `RENDER_EXTERNAL_URL` standart origin bo‘ladi, maxsus domen uchun `APP_ORIGIN` kerak.

## Dasturchi uchun

```sh
npm ci --include=dev
npm run build
npm test
```

`lib/accounts.mjs` — hisob/sessiya; `lib/workspace-api.mjs` — shaxsiy ma’lumot/fayl/ish API; `src/shared/work-types.ts` — format va iframe havola tekshiruvi; `src/app/tikz-engine.ts` — cheklangan TikZ parseri. `TEKSHIRISH.md`da sinov va foydalanish qadamlari bor. Eski `lib/demo-session.ts` faqat regressiya/izolyatsiyalangan SI testlarida saqlangan; ishlab turgan server bu kirish yo‘lini ochmaydi.

Rasmiy manbalar (2026-11-23):

- GeoGebra: https://geogebra.github.io/docs/reference/en/Material_Embedding_(Iframe)/
- Kahoot: https://support.kahoot.com/hc/en-us/articles/360018695193-How-to-embed-or-link-a-kahoot-onto-a-web-page
- Desmos: https://help.desmos.com/hc/en-us/articles/4405901719309-Saving-and-Sharing-Your-Work
- PhET: https://phet.colorado.edu/en/help-center/getting-started
- Forms: https://support.google.com/docs/answer/2839588
- Wolfram: https://reference.wolfram.com/language/workflow/EmbedACloudNotebookInAWebpage.html
- Maple: https://www.maplesoft.com/support/help/maple/view.aspx?path=Formats/MW
- TikZ: https://tikz.dev/tikz-actions
- Hosting: https://render.com/docs/free va https://render.com/docs/disks

KaTeX litsenziyasi `licenses/katex-LICENSE.txt`da. Shriftlar va PDF viewer tayyor `dist`da; asosiy interfeys CDN talab qilmaydi. Tashqi iframe va SI internet talab qiladi.
