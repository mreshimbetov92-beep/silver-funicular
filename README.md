# Idrok — adaptiv ta’lim demo sayti

Mustaqil Node.js serverida ishlaydigan nusxa. Saytga kirishda ChatGPT hisobi yoki ChatGPT plaginlari talab qilinmaydi. Bu paketning o‘zi domen yaratmaydi: internet manzili hostingga joylangandan keyin beriladi.

## Nimalar tayyor?

- O‘zbekcha kirish oynasi va telefon/kompyuterga mos interfeys.
- 4 mavzu: algebra, kasrlar, geometriya va funksiyalar; 72 ta savol.
- 8 savollik diagnostika, darajaga mos mashqlar va javoblarning izohi.
- O‘quv yo‘li, XP, natijalar, CSV eksporti va namunaviy o‘qituvchi paneli.
- Serverda tekshiriladigan demo login; 8 soatlik imzolangan HttpOnly sessiya.

Natijalar shu brauzerning localStorage xotirasida saqlanadi; qurilmalar o‘rtasida almashilmaydi. O‘qituvchi jadvalidagi guruh — namuna. Bu demo haqiqiy imtihonlarni nazorat qilish yoki o‘zgartirib bo‘lmaydigan baholarni saqlash tizimi emas.

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

`src/app/` — interfeys va savollar; `lib/demo-session.ts` — demo kirish; `server.mjs` — Node serveri; `render.yaml` — joylash sozlamalari.

Tekshiruvlar: TypeScript va production build; to‘g‘ri/noto‘g‘ri kirish; sessiya imzosi va muddati; boshqa manbadan so‘rovni rad qilish; HTTPS cookie; chiqish; statik fayllar; maxfiy fayllarni berkitish.

Rasmiy yo‘riqnomalar (2026-11-10 da tekshirilgan):

- https://render.com/docs/blueprint-spec
- https://render.com/docs/deploy-node-express-app
- https://render.com/docs/environment-variables
- https://render.com/docs/free
