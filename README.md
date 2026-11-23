# Idrok 3.4 — Administrator va umumiy o‘quv kutubxonasi

Idrok 3.3 yangilandi. ZIP ichida tahrirlanadigan kod (`src`, `lib`), tayyor sayt (`dist`), testlar va namunalar bor. Bu mustaqil Node.js ilovasi: ChatGPT hisobi yoki plagini talab qilinmaydi. ZIPni olish internetga deploy qilish degani emas.

## Tez ishga tushirish

1. Node.js **24 LTS** o‘rnating: https://nodejs.org/
2. ZIPni to‘liq oching. `Idrok_adaptiv_demo` ichida Windows uchun `ISHGA-TUSHIRISH.cmd`ni bosing.
3. http://localhost:3000 ni oching. Administrator **mr.eshimbetov@gmail.com** va kelishilgan parol bilan **Kirish** orqali kiradi. Boshqalar **Ro‘yxatdan o‘tish** orqali Gmail hisobini yaratadi.
4. Tiklash kodini faylga yuklab olib, alohida saqlang. Parol unutilsa shu kod kerak bo‘ladi.

Terminaldan:

```sh
npm run setup
npm start
```

Tayyor `dist` uchun `npm ci` talab qilinmaydi. Serverni yopish — terminalda Ctrl+C. Boshqa kompyuterdan foydalanish uchun ilovani HTTPS va doimiy diskli hostingga joylashtirish kerak.

## Administrator va umumiy materiallar

Birinchi ishga tushishda **mr.eshimbetov@gmail.com** administrator hisobi avtomatik yaratiladi. Parol foydalanuvchi belgilagan qiymatga o‘rnatilgan; ochiq matn ZIPga yozilmagan. Kirgach **Hisob xavfsizligi** orqali parolni almashtirish va tiklash kodini olish mumkin. Keyingi server restartlari o‘zgartirilgan parolni qayta tiklamaydi.

- **Mavzu va savollar:** admin saqlagan faol darslar va savollar **Umumiy kutubxona → Dars va testlar**da ko‘rinadi. Arxivlangan materiallar umumiy ro‘yxatdan olinadi.
- **PDF materiallar**, **Mening ishlarim** va chizma studiyasidan yuklangan fayllar/saqlangan ishlar hammaga ko‘rinadi. Faqat muharrirda yozilgan, hali fayl yoki ish sifatida saqlanmagan chizma qoralamasi ulashilmaydi.
- **Adaptiv tizim modeli:** admin kiritgan resurs havolalari va loyiha shartlari ulashiladi. Shaxsiy profil, maqsad, loyiha javobi, baholash izohi, fikr-mulohaza va test natijalari ulashilmaydi.
- Talaba materiallarni o‘qiydi, yuklab oladi va test ishlaydi. Adminning asl materialini tahrirlay olmaydi. Talabaning o‘z mualliflik ishlari shaxsiy saqlanadi.
- Mashqlar va jonli viktorinada **Admin darslari / Shaxsiy darslar** manbasi tanlanadi. Shaxsiy va umumiy dars natijalari alohida identifikatorlar bilan saqlanadi.
- **Administrator paneli** jami hisoblar soni va oxirgi 200 hisobning ismi, Gmail manzili, roli va ro‘yxatdan o‘tgan sanasini ko‘rsatadi. Hech kimning paroli ko‘rsatilmaydi.

Admin muharririda **Hisobga saqlandi** holatini kuting. Boshqa hisobda **Umumiy kutubxona → Yangilash**ni bosing yoki sahifani yangilang. Kutubxona saytdagi hisobga kirgan foydalanuvchilar uchun ochiq.

`private/admin-seed.json` server uchun boshlang‘ich parolning scrypt xeshini saqlaydi. Uni `public` yoki `dist`ga ko‘chirmang va ushbu shaxsiy paketni ochiq repozitoriyga joylamang. Server bu faylni HTTP orqali bermaydi. Eski bazada ushbu Gmail allaqachon mavjud bo‘lsa, birinchi 3.4 ishga tushirishda aynan shu hisob admin bo‘ladi, paroli belgilangan qiymatga o‘rnatiladi, eski sessiya va tiklash kodi bekor qilinadi; avvalgi materiallar saqlanadi. Bu migratsiya bir marta bajariladi.

Batafsil: `ADMIN_VA_UMUMIY_MATERIALLAR.md`.

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

**LaTeX chizmalar** ichida ikki rejim bor:

- **To‘liq LaTeX / PDF:** haqiqiy XeLaTeX, pdfLaTeX yoki LuaLaTeX. TikZ kutubxonalari, makroslar, `\foreach`, PGFPlots 2D/3D va yordamchi fayllar; `.tex` va butun `.json` loyiha import/eksporti; PDFni ko‘rish, yuklab olish va hisobga saqlash.
- **Tez SVG:** avvalgi cheklangan brauzer parseri, serverda TeX o‘rnatmasdan sodda kesma/uchburchak/aylana/ko‘phad chizmalar. TeX/SVG eksporti va ish sifatida saqlash.

**To‘liq rejim uchun Docker/TeX Live workerni ulash shart.** `TEX_ISHGA_TUSHIRISH.md`da mahalliy va alohida HTTPS worker qadamlari bor. Worker ulanmasa holati aniq chiqadi, kompilyatsiya tugmasi faol bo‘lmaydi. Tayyor tez SVG rejimi ishlayveradi.

Barcha LaTeX buyruqlari cheklovsiz kafolatlanmaydi: paket/dvigatel/shrift mos bo‘lishi kerak. Shell-escape va tashqi dasturlar bloklangan. TeXdagi `\input` yoki makroslar to‘liq rejimda ishlaydi, tez SVG rejimida ishlamaydi. `examples/` ichida TikZ foreach va PGFPlots 3D namunalari bor. Yordamchi fayllarni yo‘qotmaslik uchun loyihani JSON eksport qiling yoki tayyor PDF bilan **Ishlarimga saqlash**ni bosing.

## TeX fayldan test importi

1. **Mavzu va savollar → TeX test importi**ni oching.
2. `.tex` fayl tanlang yoki manba kodini kiriting. **TeX shablonni olish** / **Namunani ko‘rish** ham mavjud.
3. Savollar, variantlar va formulalarni ko‘rib chiqing. Kalit bo‘lmasa har savol uchun to‘g‘ri javobni belgilang.
4. Mavjud mavzuni tanlang yoki yangi mavzu nomini kiriting. Qiyinlikni 1–3 oralig‘ida belgilang.
5. **Tekshirilgan savollarni bazaga qo‘shish**ni bosing. Savollar adaptiv mashqlarda va jonli viktorinada ishlatiladi.

Formatlar: `exam` usulidagi `\question`, `choices`/`oneparchoices`/`checkboxes`/`oneparcheckboxes`, `\choice`, `\CorrectChoice`/`\correctchoice`; izoh uchun `solution`. Yoki 7 argumentli `\idrokquestion{savol}{A}{B}{C}{D}{kalit A–D}{izoh}`. `examples/Idrok_test_exam.tex` va `Idrok_test_custom.tex`ni sinang.

Har savol **4 variant va 1 to‘g‘ri javob**. Ko‘p javobli, 5 variantli yoki noto‘g‘ri qavsli test xato bilan qaytariladi. Bir importda 200 savol, manbada 1 million belgi, faylda 2 MB gacha. `exam`dagi `[5]` balli qiyinlik darajasiga aylantirilmaydi. Aralash exam/custom format rad etiladi. TeX bajarilmaydi, makroslar yoyilmaydi. Savol formulalari KaTeX bilan ko‘rsatiladi; TikZ chizma kodi savol ichida kompilyatsiya qilinmaydi. Ixtiyoriy tartibsiz `.tex` fayl avtomatik testga aylantirilishi kafolatlanmaydi.

## Saytning o‘zida Kahoot uslubidagi jonli viktorina

1. Boshlovchi hisobga kiradi → **Jonli viktorina → Viktorina yaratish**.
2. Nom, har savol vaqti va bankdan 1–50 savol tanlaydi. **Xonani yaratish** 6 xonali kod beradi.
3. Talabalar o‘z Idrok hisobiga kirib, **Kod bilan qo‘shilish**da kod va o‘yindagi ismini kiritadi. Bir hisob — bitta ishtirokchi; kamida bitta ishtirokchi kerak, ko‘pi bilan 100 ta.
4. Boshlovchi **Viktorinani boshlash**ni bosadi. Savol va 4 rangli javob barcha ishtirokchilarda ko‘rinadi. Vaqt tugashi yoki boshlovchining **Javoblarni ochish** buyrug‘i natijani ochadi.
5. Server vaqt va javobni tekshiradi: to‘g‘ri javob 500–1000 ball, noto‘g‘ri javob 0; kechikkan/takroriy javob rad etiladi. Joriy savol kaliti va ballari javoblar ochilguncha qatnashchiga yuborilmaydi.
6. Boshlovchi keyingi savolga o‘tadi. Yakunda reyting va **CSV hisobot** chiqadi; hisobotda har ishtirokchi/savol, tanlov, to‘g‘ri javob, ball va vaqt bor. Xonalar va javoblar SQLite bazasida saqlanadi, **Xonalarim** orqali qayta ochiladi.

Bu Idrokning ichki viktorinasi: Kahoot akkaunti/API talab qilinmaydi, Kahootdan testlar avtomatik ko‘chirilmaydi. Xona yaratilganda savollar nusxasi olinadi; keyingi bank tahriri boshlangan xonaga ta’sir qilmaydi. O‘yin boshlangach yangi ishtirokchi kirmaydi; oldin qo‘shilgan ishtirokchi sessiyasi bilan qayta ochishi mumkin. Oynalar taxminan 1,5 soniyada yangilanadi. Vaqt tarmoq orqali serverga yetib kelishga ko‘ra hisoblanadi. Bu rasmiy himoyalangan imtihon emas. Jonli viktorina natijasi alohida saqlanadi; shaxsiy adaptiv mashqdagi o‘zlashtirish foizini avtomatik o‘zgartirmaydi.

## Mavzu, savol, adaptiv ta’lim

3.1 dagi imkoniyatlar saqlangan: 4 boshlang‘ich mavzu, 72 savol; yangi mavzu/dars va 4 variantli savol yaratish; 1–3 qiyinlik darajasi; izoh, tahrir, arxiv/tiklash; JSON import/eksport; formulalarning jonli ko‘rinishi. `NAMUNA_SAVOLLAR.json` — hosiladan 1 mavzu va 6 savol.

**Mavzu va savollar → Yangi mavzu → Shu mavzuga savol** orqali qo‘shing. Formula uchun `$...$`, `$$...$$`, `\(...\)`, `\[...\]` ishlatiladi. **Saqlangan testni sinash** orqali natijani ko‘ring. Faol mavzular darslar, maqsad, diagnostika va tavsiyalarga ham kiradi. 50 mavzu va 2000 savolgacha; import fayli 5 MB gacha, hisobning bitta holat yozuvi 3 MB gacha.

Maqsad mavzusi bajarilmagan bo‘lsa avval u, aks holda past o‘zlashtirishli mavzu tavsiya qilinadi. Mashq darajasi <45% da 1, 45–74% da 2, >=75% da 3. Javob darajani 1 pog‘ona oshiradi/pasaytiradi. Har mashg‘ulotda savol takrorlanmaydi, yetishmaydigan daraja o‘rniga mavjud eng yaqin daraja olinadi. Bu qoidalarga asoslangan adaptiv algoritm; psixometrik kalibrlangan imtihon yoki o‘qitilgan bashorat modeli emas.

O‘qituvchi/talaba rejimlari hozir **o‘z hisobingizdagi ish rejimlari**. Jonli viktorina boshlovchisi o‘z xonasidagi qatnashchilar natijalarini ko‘radi. Boshqa hisoblarning shaxsiy mashq tarixiga kirish, sinfni umumiy boshqarish va o‘zgartirib bo‘lmaydigan rasmiy baholar bazasi ulanmagan.

## Grafik, PDF va SI

- **Grafik laboratoriyasi:** 4 ta real `y=f(x)`, `a,b,c` parametrlari, `t` animatsiyasi, masshtab, sonli urinma, SVG. Misollar: `a*sin(b*x+t)+c`, `ln(x)`, `1/(x-1)`, `if(x<0,-x,x^2)`, `\frac{\sin(x)}{x}`. Umumiy yashirin/3D tenglamalar yechuvchisi emas.
- **Funksiya tahlili:** ko‘phad/ratsional ifoda, surat/maxraj darajasi 6 gacha; hosilalar, monotonlik, ekstremum, asimptota, grafik va TXT. Sonli-taqribiy chegaralar bor.
- **PDF materiallar:** yuklash, ko‘rish, qidirish, o‘chirish va SIga savol tayyorlash. Bitta fayl 20 MB; PDF bo‘limi 60 MB, barcha fayllar uchun hisob bo‘yicha jami 100 MB. Dastlabki 150 sahifadan 180 000 belgigacha matn olinadi; skanlar uchun OCR yo‘q.
- **SI yordamchi:** OpenAI Responses API server orqali. `.env` yoki hosting Environment’da `OPENAI_API_KEY`ni belgilang. Ixtiyoriy: `OPENAI_MODEL=gpt-4.1-mini`, `AI_REQUESTS_PER_HOUR=20`. Bu limit barcha hisoblarga umumiy va server qayta ishga tushganda yangilanadi. Kalitni brauzer, savol, Git yoki ZIPga kiritmang. Kalit bo‘lmasa SI ulanmagan holati chiqadi.

SIga faqat **SIga yuborish** bosilganda savol, tanlangan PDF parchalari va foydalanuvchi belgilasa o‘quv konteksti jo‘natiladi. Maple/Wolfram fayllari avtomatik SIga yuborilmaydi. Haqiqiy SI javobi uchun yaroqli kalit va provayder kvotasi kerak; testlar sun’iy javob bilan tekshirilgan.

## Ma’lumotlarni saqlash va zaxira

Hisoblar, profil, mavzu/savollar, model, grafik/LaTeX sozlamalari, fayllar va ish yozuvlari **serverdagi SQLite** bazasiga saqlanadi: `IDROK_DATA_DIR/idrok.sqlite` (standart `data/`). Bir xil hostingdagi hisobga boshqa brauzerdan kirilganda ma’lumotlar olinadi. Shaxsiy natijalar va hisoblar ajratilgan; adminning o‘quv materiallari umumiy kutubxonada boshqa hisoblarga ham ko‘rinadi.

Yuqoridagi saqlash holatini kuzating. Bir hisob ikki oynada o‘zgartirilsa eski nusxa yangisini ustidan yozmaydi: zaxira olish va sahifani yangilash taklif qilinadi. Tarmoq xatosida qayta saqlash yoki **Zaxira olib chiqish** bor. Holat JSON zaxirasi fayllarni o‘z ichiga olmaydi va avtomatik to‘liq tiklash vositasi emas; mavzu/savollar uchun o‘z JSON importi mavjud. Fayllarni alohida yuklab oling.

Sayt egasi to‘liq zaxira uchun serverni to‘xtatib, **butun `IDROK_DATA_DIR` papkasini** nusxalashi kerak; qayta tiklashda serverni to‘xtatib shu papkani qaytaring. Ishlab turgan SQLite faylini WALsiz nusxalashdan saqlaning. Bu papkada foydalanuvchi fayllari va parol xeshlari bor — ochiq Git/ZIPga yuklamang. Paketda foydalanuvchi bazasi yo‘q.

Limitlar: hisobga 200 ish, 250 fayl, 100 MB; faylga 20 MB. Server fayllari jami standart 2048 MB (`IDROK_MAX_STORAGE_MB` bilan sozlanadi). SQLite, indeks va matnlar uchun diskda qo‘shimcha bo‘sh joy qoldiring. Bitta server nusxasi uchun mo‘ljallangan.

**3.2 yoki 3.3 dan 3.4 ga:** serverni to‘xtating, butun `IDROK_DATA_DIR`ni zaxiralang. Yangi kodni alohida papkaga ochib avvalgi `.env` va aynan shu doimiy baza manzilini ishlating; yangi jadvallar avtomatik qo‘shiladi. `data/`ni o‘chirib yoki ustidan bo‘sh baza yozib yubormang.

**3.1 dan ko‘chish:** yangilashdan oldin eski brauzerdagi mavzu/savollarni JSON eksport qiling, PDFlarni yuklab oling. Keyin yangi hisobga import qiling. Eski umumiy demo profilining localStorage/IndexedDB ma’lumotlari yangi Gmail hisobiga avtomatik biriktirilmaydi.

## Internetga joylash

Loyiha ildizida `package.json`, `package-lock.json`, `src`, `lib`, `scripts`, `tests`, `tex`, `examples`, `private`, `public`, `licenses` va `dist` bo‘lsin. `.env`, `data`, `node_modules`ni Gitga yubormang. Build: `npm ci --include=dev && npm run build`; start: `npm start`; health: `/health`; Node 24.

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
