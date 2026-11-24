# Idrok 3.5: to‘liq LaTeX kompilyatorini ulash

Tez SVG rejimi darhol ishlaydi. **To‘liq LaTeX → PDF** uchun alohida TeX Live muhiti kerak. ZIPdagi kod ulanishni amalga oshiradi; foydalanuvchi serverida Docker image qurilishi va worker ishga tushirilishi lozim. Internetdagi hostingga avtomatik o‘rnatilmagan.

## Overleaf orqali darhol onlayn ishlash

1. **LaTeX chizmalar → To‘liq LaTeX · PDF**da kod va yordamchi fayllarni tayyorlang.
2. **Overleafda ochish**ni bosing. Tugma manba va fayllarni faqat shu harakatda Overleafga yuboradi. Ochiq internetga alohida loyiha faylini joylash talab qilinmaydi.
3. Overleaf hisobingizga kirish so‘ralsa kiring, keyin **Recompile**ni bosing. Tanlangan dvigatel import parametrida uzatiladi.
4. PDFni yuklab oling. Idrokda **Tayyor PDFni qaytarish → Ishlarimga saqlash**. Manba bilan natija admin panelida ko‘rinadi.
5. Oyna ochilmasa **Overleaf uchun ZIP**ni yuklab oling; Overleafda **New Project → Upload Project**dan import qiling.

Bu yo‘l Idrok serveridagi workerni o‘rnatmaydi. Idrok ichida to‘g‘ridan-to‘g‘ri PDF yaratish uchun quyidagi Docker/remote yo‘li kerak. Overleaf bilan avtomatik ikki tomonlama sinxronlash yoki tashqi hisobdan PDF tortib olish yo‘q. Rasmiy import protokoli: https://www.overleaf.com/devs ; ZIP importi: https://docs.overleaf.com/managing-projects-and-files/uploading-a-project .

## 1. Bitta kompyuter yoki VPS

1. Node.js 24 va Docker o‘rnating. Windowsda Docker Desktop’ning Linux containers rejimidan foydalaning. Docker ishlayotganini `docker info` orqali tekshiring.
2. ZIPni ochib, `Idrok_adaptiv_demo` papkasida terminal oching.
3. Image yarating:

```sh
npm run tex:build
```

`texlive-full` katta: internet, bir necha GB bo‘sh disk va yetarli vaqt kerak. Bu bosqich bir marta bajariladi. Har bir kompilyatsiya uchun 1 GB xotira limiti, bir vaqtda ko‘pi bilan 2 ta ish bor; tizimning o‘ziga ham xotira qoldiring.

4. `npm run setup`ni bajaring. Yaratilgan `.env` fayliga quyidagilarni kiriting:

```dotenv
IDROK_TEX_MODE=docker
IDROK_TEX_IMAGE=idrok-tex:3.3
```

5. `npm start` bilan saytni ishga tushiring. Hisobga kiring → **LaTeX chizmalar → To‘liq LaTeX / PDF**. “Ulanishni tekshirish”ni, keyin **Kompilyatorni amalda sinash**ni bosing. Ikkinchi tugma tanlangan dvigatelda TikZ/PGFPlots hujjatidan haqiqiy PDF yaratadi; vaqt va PDF hajmini ko‘rsatadi.
6. **TikZ va foreach → PDF chizmani yaratish**ni sinang. Keyin **PGFPlots 3D**ni sinang.
7. PDF tayyor bo‘lsa yuklab oling yoki **Ishlarimga saqlash**ni bosing. TeX manba va yordamchi fayllar JSON loyiha sifatida, natija esa PDF sifatida saqlanadi.

## 2. Sayt boshqa hostingda, TeX esa alohida serverda

Oddiy Node hosting Docker jarayonini ochishga ruxsat bermasligi mumkin. Bunday holatda Docker ishlaydigan VPSda worker saqlanadi. Saytning doimiy bazasi uchun doimiy disk ham zarur.

1. Worker serveriga loyiha kodini joylashtiring; `tex/`, `lib/tex-compiler.mjs`, `lib/tex-archive.mjs` va `lib/student-monitor.mjs` kerak. Node.js 24, Docker va `idrok-tex:3.3` image bo‘lsin.
2. Kuchli maxfiy token yarating:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Tokenni xabar, brauzer yoki Gitga joylamang. Worker serverining `.env` faylida:

```dotenv
TEX_WORKER_TOKEN=BU_YERGA_YARATILGAN_TOKEN
TEX_WORKER_HOST=127.0.0.1
TEX_WORKER_PORT=3010
IDROK_TEX_IMAGE=idrok-tex:3.3
```

3. `npm run tex:worker` bilan controller ishga tushadi. U har bir so‘rov uchun alohida vaqtinchalik Docker konteyner yaratadi. Workerning o‘zi hamma foydalanuvchi fayllarini saqlaydigan ilova katalogidan alohida serverda ishlagani ma’qul. Jarayon uchun systemd kabi odatiy xizmat boshqaruvini sozlang.
4. HTTPS reverse proxy o‘rnating. Masalan, Caddy 2.10+ konfiguratsiyasi (o‘zingizning domeningizni kiriting):

```caddyfile
tex.sizning-domeningiz.uz {
    request_body {
        max_size 12MiB
    }
    reverse_proxy 127.0.0.1:3010 {
        transport http {
            response_header_timeout 90s
        }
    }
}
```

Domen DNS yozuvi VPSga yo‘nalgan va HTTPS ochiq bo‘lishi kerak. Controllerning 3010-portini internetga to‘g‘ridan-to‘g‘ri ochmang. Proxy `Authorization` sarlavhasini workerga uzatishi kerak. Worker barcha so‘rovlarda tokenni tekshiradi.
5. **Idrok saytining** Environment sozlamalariga:

```dotenv
IDROK_TEX_MODE=remote
TEX_WORKER_URL=https://tex.sizning-domeningiz.uz
TEX_WORKER_TOKEN=WORKER_BILAN_BIR_XIL_TOKEN
```

6. Sayt serverini qayta ishga tushiring va yuqoridagi namuna chizmalarni tekshiring. Worker URL faqat serverda saqlanadi; brauzer `/api/tex` orqali Idrok bilan gaplashadi.

## 3. Nimalar qo‘llanadi?

- XeLaTeX, pdfLaTeX, LuaLaTeX; tanlangan dvigatelga mos haqiqiy LaTeX hujjatlari.
- TikZ/PGF kutubxonalari, `\foreach`, `\newcommand`, `\def`, hisoblashlar, PGFPlots 2D/3D, koordinatalar va formulalar.
- `\input{parts/chizma.tex}` va `\includegraphics{rasm.png}` kabi loyiha yordamchi fayllari. Faylni qo‘shgach nomini muharrirdagi yo‘l bilan bir xil qiling.
- Shaxsiy `.sty`, `.cls`, `.ttf`, `.otf` fayllari; shrift yuklashda XeLaTeX/LuaLaTeX va `fontspec` kerak bo‘lishi mumkin.
- Manba `.tex` import/eksporti; barcha yordamchi faylli `.json` loyiha import/eksporti; PDF ko‘rinishi va eksporti.

**“Barcha buyruqlar” mutlaq kafolat emas.** Buyruqning paketi, dvigatel va shrifti mos bo‘lishi kerak. Tizim buyruqlari, shell-escape, tarmoq, foydalanuvchi bazasiga kirish yopiq. TikZ externalization, `minted`, Asymptote, avtomatik EPS→PDF kabi tashqi jarayon talab qiladigan yo‘llar ishlamasligi mumkin. EPSni avval PDF/PNGga aylantiring. BibTeX/Biber, DVI→PS, MetaPost yoki boshqa yordamchi dastur avtomatik ishga tushirilmaydi. `\usepackage` paketni internetdan o‘rnatmaydi.

Limitlar: 500 000 belgi manba; 20 ta yordamchi fayl, jami 8 MB; HTTP loyiha 12 MB; PDF 10 MB; TeX har bosqichda 25 soniya, 2 bosqich; butun Docker chaqiruvi 65 soniya; foydalanuvchiga soatiga 30 so‘rov; 2 parallel kompilyatsiya. Juda katta 3D grafikda `samples`ni kamaytiring.

Konteyner tarmoqsiz, root huquqisiz, read-only tizim bilan ishlaydi. Faqat `/work` va `/tmp` vaqtinchalik yoziladigan joylar; ilova bazasi, host kataloglari, API tokenlari yoki Docker socket kompilyator ichiga berilmaydi. Konteyner nomi bilan yakunda o‘chiriladi. Docker daemon/controllerga faqat sayt operatori kira olsin. Ushbu cheklovlarni ommaviy serverda o‘chirmang.

## 4. Xatolar

| Holat | Amal |
| --- | --- |
| Worker ulanmagan | `.env`da `IDROK_TEX_MODE`ni tekshiring, serverni qayta oching |
| Docker topilmadi / image yo‘q | Docker’ni oching, `npm run tex:build`, keyin `docker image inspect idrok-tex:3.3` |
| LaTeX xatosi | “Kompilyatsiya jurnali”ni oching; birinchi xato satri va paket nomini tekshiring |
| Worker ruxsat bermadi | Sayt va worker tokenlari bir xil, URL HTTPS, proxy Authorization uzatayotgan bo‘lsin |
| Vaqt / xotira limiti | Grafik namuna soni, jadval hajmi yoki aylanishlar sonini kamaytiring |
| Shrift yoki paket yo‘q | Yordamchi fayl qo‘shing yoki operator image’ga kerakli paketni o‘rnatsin |

Rasmiy ma’lumotlar: https://docs.docker.com/engine/containers/run/ , https://ctan.org/pkg/pgf , https://ctan.org/pkg/pgfplots .

Tekshiruv holati: bu muhitda Docker mavjud bo‘lmagani uchun image build va real PDF kompilyatsiya tasdiqlanmagan. `TEKSHIRISH.md`dagi operator qabul sinovini bajaring. Caddy manbasi: https://caddyserver.com/docs/caddyfile/directives/reverse_proxy .
