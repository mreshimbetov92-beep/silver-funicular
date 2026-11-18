# Idrok 3.1 — ishlatish va sinash

## Ishga tushirish

1. Node.js 24 o‘rnatilgan kompyuterda ZIPni to‘liq oching.
2. `ISHGA-TUSHIRISH.cmd`ni bosing. Yoki terminalda `npm run setup`, keyin `npm start`.
3. `http://localhost:3000`ni oching. Login: `mr.eshimbetov@gmail.com`. Parol: `demo123456`.
4. Paketdagi `dist` tayyor; uni ishga tushirish uchun avval `npm ci` shart emas.

## Mavzu, savol va LaTeX

1. Chap menyuda **Mavzu va savollar → Yangi mavzu**ni tanlang.
2. Nomiga “Integrallar”, faniga “Matematik analiz” yozing. Dars mazmuniga `Aniq integral: $\int_0^1 x^2\,dx=\frac{1}{3}$.` kiriting. Jonli namunasini ko‘ring, mavzuni saqlang.
3. **Shu mavzuga savol**ni bosing. Savol: `$\int_0^1 x^2\,dx$ ni hisoblang.` Variantlar: `$1/3$`, `$1/2$`, `$1$`, `$0$`. A ni to‘g‘ri javob deb belgilang. Izoh: `Boshlang‘ich funksiya $x^3/3$; qiymat $1/3$.` Darajani tanlang va savolni saqlang.
4. **Saqlangan testni sinash**ni bosing. Bitta savol bo‘lsa test bitta savol bilan tugaydi. Natijani ko‘ring. Saqlanmagan o‘zgartirishlar testga kirmaydi.
5. Mavzu uchun har darajada kamida 2 tadan turli savol kiritish tavsiya qilinadi. 6 tadan kam savol bo‘lsa mavjudlari beriladi, bir mashg‘ulotda takrorlanmaydi. Mavjud eng yaqin qiyinlik olinadi.
6. **O‘quv yo‘lim**, **Mashqlar**, **Adaptiv tizim modeli → Bilish maqsadi** va **Natijalarim** bo‘limlarida yangi mavzu paydo bo‘lganini tekshiring.
7. Savolni/mavzuni tahrirlang. Arxiv tugmasi uni yangi testlardan chiqaradi; **Arxivdagilarni ko‘rsatish** orqali tiklang. Tarix va matnlar o‘chirilmaydi.

## Tayyor matematik analiz namunasi

1. **Bazani import qilish**ni bosing; arxivdagi `NAMUNA_SAVOLLAR.json`ni tanlang.
2. 1 mavzu va 6 savol haqidagi ko‘rib chiqish oynasida **Birlashtirish**ni bosing.
3. “Hosila va uning tatbiqlari” mavzusini oching. Dars, yechilgan misol, 3 darajali savollar va LaTeX ko‘rinishini ko‘ring.
4. **Bazani yuklab olish** orqali o‘z bazangizni saqlang. Boshqa kompyuterda shu JSONni import qiling.
5. Import 5 MB gacha. Bir xil ID li yozuvlar yangilanadi; boshqa yozuvlar saqlanadi. Xato format bazani qisman o‘zgartirmaydi. Eksportga PDF, profil va natijalar kirmaydi.

## Grafik laboratoriyasi

1. **Grafik laboratoriyasi**ni oching. `a*sin(b*x+t)+c` to‘lqinini ko‘ring.
2. a/b/c slayderlarini suring. **Animatsiyani boshlash**da t o‘zgaradi. Keyin animatsiyani to‘xtating.
3. `ln(x)` yozib **Grafikni yangilash**ni bosing: faqat x>0 qismi chiziladi.
4. `1/(x-1)`ni chizing: x=1 da uzilish bo‘lishini kuzating. Ko‘rinish chegaralarini o‘zgartiring.
5. Bo‘lakli ifoda: `if(x<0,-x,x^2)`. LaTeX: `\frac{\sin(x)}{x}`. Oddiy ifodada `*` — ko‘paytirish, `^` — daraja; burchaklar radianlarda.
6. **Grafik qo‘shish** orqali bir oynada 4 tagacha funksiya chizing. Ko‘rsatish belgisini yoki ifodani o‘zgartirgach **Grafikni yangilash**ni bosing.
7. Urinmani yoqib x₀ nuqtasini suring. f(x₀) va taqribiy hosilani ko‘ring. Hosila uzilish/burchaklarda ishonchli emas.
8. **SVG** orqali grafikni yuklab oling. Bu vektorli faylni brauzerda ochish mumkin.
9. Yashirin, parametrik va 3D grafiklar uchun **Ta’lim vositalari → GeoGebra/Desmos**dan foydalaning. Ichki simulyator haqiqiy y=f(x) ifodalari bilan ishlaydi; barcha matematik funksiyalarni yoki tenglamalarni avtomatik yechmaydi.

## Ta’lim vositalari, PDF va SI

- **Ta’lim vositalari**da GeoGebra, Kahoot (yaratish va o‘yinga kirish), Desmos, PhET va Google Forms bor. Havolalar yangi oynada ochiladi. Natijalar Idrokka avtomatik olinmaydi.
- **PDF materiallar** orqali matnli PDF yuklang va sahifalarni o‘qing. Bitta fayl 20 MB, jami 60 MB. Skanerlangan PDF uchun OCR ulanmagan.
- PDF kartasida **SIga savol**ni bosing, savolni tahrirlang. **SIga yuborish** foydalanuvchi bosgandagina so‘rov yuboriladi.
- **SI yordamchi**ning ishlashi uchun serverga haqiqiy `OPENAI_API_KEY` kerak. Kalitsiz “SI ulanmagan” holati chiqadi. Kalitni sayt formasi, GitHub yoki savolga kiritmang.
- Render’da Environment ga `OPENAI_API_KEY`ni qo‘shing, xizmatni qayta ishga tushiring. Ixtiyoriy: `OPENAI_MODEL=gpt-4.1-mini`, `AI_REQUESTS_PER_HOUR=20`. Mahalliy serverda `.env`dan foydalaning.
- SI javoblaridagi `$...$`/`$$...$$` LaTeX formulalari ham render qilinadi. SI chiqishini mustaqil tekshirib foydalaning.

## Model va natijalar

1. **Adaptiv tizim modeli → Talaba va rollar**da profil va taqdimot afzalligini saqlang.
2. **Bilish maqsadi**da mavzu va foizni belgilang. Tavsiya shu maqsad va mavjud ko‘rsatkichlarga moslashadi.
3. **Identifikatsiya**da savollar sonini ko‘ring: har faol savolli mavzudan 2 tagacha savol; savolsiz mavzu testga kirmaydi. Testni to‘liq tugatgach natija saqlanadi.
4. Loyiha topshiring, demo o‘qituvchi rejimida izoh qoldiring, teskari aloqa kiriting. Bular bitta brauzerdagi demo amallar.
5. **O‘qituvchi paneli**da o‘z bazangizning uch daraja bo‘yicha qamrovini tekshiring. **Natijalarim**dan CSV yuklab oling.
6. Sahifani yangilang: saqlangan mavzu/savollar, natijalar, grafik va PDFlar qolishi kerak. Boshqa brauzerga avtomatik uzatilmaydi.
7. **Funksiya tahlili**dagi avvalgi to‘la tekshirishni `x^3-3*x` bilan sinang. Bu bo‘lim ko‘phad/ratsional funksiyalar uchun.

## Mavjud hostingni yangilash

ZIPdagi `Idrok_adaptiv_demo` papkasining **ichidagi** barcha fayl va papkalarni mavjud GitHub loyihasining ildiziga yuklang. `src`, `lib`, `public`, `config`, `scripts`, `tests`, `licenses`, `package.json`, `package-lock.json` va `render.yaml`ni saqlang. Mahalliy `.env` va `node_modules`ni yuklamang. So‘ng mavjud Render xizmatida oxirgi commitni deploy qiling. Yangi nusxa internetga bu ZIPning o‘zi bilan avtomatik joylanmaydi.

## Dasturiy tekshiruvlar

`npm ci --include=dev`, `npm run build`, `npm test` — koddan qayta yig‘ish va tekshirish.

Testlar: login/sessiya/server, eski to‘la funksiya tahlili, SI kirish va xato holatlari, adaptiv tavsiya, dinamik savollar banki, arxiv/import, LaTeX va grafik parseri. SI testlari nazoratli javoblar bilan bajariladi; haqiqiy API kalitisiz jonli SI javobi tasdiqlanmagan.

2026-11-18 dagi tekshiruv: production build va barcha 8 test fayli muvaffaqiyatli tugadi. Brauzerda mavzu yaratish, LaTeXli savolni saqlash, bir savolli testni yakunlash, yangilangandan keyin saqlanish, JSON import/eksport, dinamik diagnostika, ln va bo‘lakli grafik, noto‘g‘ri ifodani rad qilish, parametr va animatsiya, urinma/SVG eksporti hamda PDF yuklash/ochish tekshirildi. Interfeys mahalliy sinov kirish nuqtasida sinaldi; yakuniy paketda oddiy server sessiyasiga bog‘langan login qayta tiklandi va brauzerda ko‘rildi. Tashqi xizmatlar natija sinxronlash va jonli SI javobi bu tekshiruvga kirmaydi.
