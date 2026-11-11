# Idrok 2.0 — talabalar uchun adaptiv ta’lim

Mustaqil Node.js serverida ishlaydigan nusxa. Saytga kirishda ChatGPT hisobi yoki ChatGPT plaginlari talab qilinmaydi. Bu paketning o‘zi domen yaratmaydi: internet manzili hostingga joylangandan keyin beriladi.

## Nimalar tayyor?

- O‘zbekcha kirish oynasi va telefon/kompyuterga mos interfeys.
- 4 mavzu: algebra, kasrlar, geometriya va funksiyalar; 72 ta savol.
- 8 savollik diagnostika, darajaga mos mashqlar va javoblarning izohi.
- O‘quv yo‘li, XP, natijalar, CSV eksporti va namunaviy o‘qituvchi paneli.
- Serverda tekshiriladigan demo login; 8 soatlik imzolangan HttpOnly sessiya.

Natijalar shu brauzerning localStorage xotirasida saqlanadi; qurilmalar o‘rtasida almashilmaydi. O‘qituvchi jadvalidagi guruh — namuna. Bu demo haqiqiy imtihonlarni nazorat qilish yoki o‘zgartirib bo‘lmaydigan baholarni saqlash tizimi emas.

## 2.0 yangiliklari

- **Talaba paneli:** interfeysdagi o‘quvchi/sinf nomlari talaba/guruhga almashtirildi.
- **PDF materiallar:** PDF yuklash, sahifalarni o‘qish, qidirish, yuklab olish va o‘chirish. Bitta fayl 20 MB, kutubxona 60 MB gacha. Fayl brauzer IndexedDB xotirasida saqlanadi. Boshqa talabalar yoki boshqa qurilmalarga avtomatik tarqalmaydi; sayt manzili o‘zgarsa eski manzildagi fayllar yangi manzilda ko‘rinmaydi.
- **PDF bo‘yicha SI:** dastlabki 150 sahifadan, jami 180 000 belgigacha matn olinadi. Savolga mos sahifalardan taxminan 22 000 belgigacha parcha tanlanib yuboriladi. Rasmli/skanerlangan PDF uchun OCR ulanmagan; interfeys buni ko‘rsatadi. Asl PDFning barcha sahifalarini o‘qish mumkin.
- **SI yordamchi:** haqiqiy OpenAI Responses API bilan server orqali ishlaydi. Kalit qo‘yilmaganda “SI ulanmagan” holati chiqadi; tayyor sun’iy javob haqiqiy SI deb ko‘rsatilmaydi.
- **Funksiyani to‘la tekshirish:** ko‘phad va ratsional funksiyalar (surat/maxraj darajasi 6 gacha), aniqlanish va qiymatlar sohasi, simmetriya, nollar va ishora, birinchi/ikkinchi hosila, monotonlik, ekstremumlar, egilish/burilish, limit va asimptotalar, masshtabi o‘zgaradigan grafik, TXT hisobot. Ildiz va koordinatalar sonli-taqribiy. `sin`, `ln`, `sqrt` kabi ifodalar avtomatik hisoblagichga kiritilmaydi; ular SI yordamchisida muhokama qilinadi.

## SI ulash — sayt egasi uchun

Render’dagi ushbu xizmatning **Environment** sozlamasiga quyidagilarni qo‘shing va **Save, rebuild, and deploy** yoki mos saqlash/ishga tushirish amalini bajaring:

| Muhit o‘zgaruvchisi | Qiymat |
| --- | --- |
| `OPENAI_API_KEY` | O‘zingizning OpenAI API kalitingiz |
| `OPENAI_MODEL` | `gpt-4.1-mini` (ixtiyoriy; standart model) |
| `AI_REQUESTS_PER_HOUR` | `20` (ixtiyoriy; barcha demo foydalanuvchilariga umumiy limit) |

API kalitini https://platform.openai.com/api-keys sahifasida boshqaring. Kalitni GitHub fayliga yoki brauzer kodiga yozmang. API foydalanishi provayder tariflari va hisobingizdagi ruxsat/kvotaga bog‘liq. Model nomini hisobingizda mavjud boshqa mos modelga almashtirish mumkin.

Mahalliy ishlatishda shu qiymatlarni `.env` fayliga yozib, serverni qayta ishga tushiring. `OPENAI_API_KEY` Blueprint’da ataylab majburiy qilinmagan: sayt va funksiya hisoblagichi SI kalitisiz ham ishlaydi.

SIga faqat foydalanuvchi “SIga yuborish” tugmasini bosganda savol va tanlangan PDF matn parchalari jo‘natiladi. Server yangi SI API’ga kirishni imzolangan demo sessiyasi va Origin bilan tekshiradi, bitta javobni 2200 chiqish tokeni bilan cheklaydi. Soatlik limit server xotirasida: qayta ishga tushganda yangilanadi. Xarajatlarni qat’iy cheklash uchun API hisobingizda ham limit belgilang. “Kalit sozlangan” holati kalit mavjudligini bildiradi; kalit/kvota yaroqliligi birinchi so‘rovda tekshiriladi.

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
