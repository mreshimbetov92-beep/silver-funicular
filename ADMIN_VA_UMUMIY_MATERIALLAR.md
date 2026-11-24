# Idrok 3.5: administrator va talabalar

## Birinchi kirish

1. ZIPni oching va `ISHGA-TUSHIRISH.cmd`ni ishga tushiring yoki `npm run setup` va `npm start`ni bajaring. Node.js 24 kerak.
2. `http://localhost:3000`ni oching. **Kirish** oynasida login: **mr.eshimbetov@gmail.com**. Parol — siz belgilagan parol.
3. **Administrator paneli** ochiladi. Bu hisobni qayta ro‘yxatdan o‘tkazish kerak emas.
4. **Hisob xavfsizligi**da joriy parolni kiritib yangi parol o‘rnatish mumkin. Berilgan yangi tiklash kodini yuklab olib saqlang. Eski sessiyalar bekor qilinadi; yangi sessiya ochiq qoladi.

## Talabaning kirishi

**Ro‘yxatdan o‘tish** → ism → `@gmail.com` manzil → kamida 10 belgili yangi Idrok paroli → hisob yaratish. Gmailning o‘z parolini kiritish talab qilinmaydi. Tiklash kodini saqlang. Gmail domeni tekshiriladi; pochta egasi ekanligi email yoki Google OAuth bilan tasdiqlanmaydi. Ro‘yxatdan o‘tuvchi admin rolini tanlay olmaydi.

## Barcha talabalarga dars chiqarish

1. Admin hisobida **Mavzu va savollar**ni oching.
2. Mavzu, nazariy matn va misol kiriting; savol va javob variantlarini qo‘shing. LaTeX va TeX import imkoniyatlari saqlangan.
3. Saqlang va yuqorida **Hisobga saqlandi** holatini kuting.
4. Talaba hisobida **Umumiy kutubxona → Yangilash**ni bosing. **Darsni o‘qish** yoki **Test ishlash**ni tanlang.
5. Talabaning ishlagan test natijasi o‘z hisobiga saqlanadi. Admin darsini tahrirlash tugmasi talabalarga berilmaydi.

## Fayl, havola va dasturlarda bajarilgan ishlar

- PDF: admin **PDF materiallar**ga yuklaydi; talabalar shu bo‘limda yoki umumiy kutubxonada ko‘radi.
- GeoGebra, Kahoot, Desmos, PhET, Google Forms, Maple va Wolfram: admin **Mening ishlarim**da havola/asl fayl/natijani qo‘shib **Ishni saqlash**ni bosadi; talabalar **Umumiy kutubxona → Saqlangan ishlar**dan ochadi. Tashqi xizmat ruxsatlari amal qiladi.
- LaTeX: chizmani fayl yoki ish sifatida saytga saqlang. Faqat muharrir qoralamasi boshqalarga chiqarilmaydi.
- Resurs havolasi va loyiha shartlari: **Adaptiv tizim modeli**da saqlang; umumiy kutubxonaning tegishli bo‘limida chiqadi. Loyiha yechimi va baholash izohlari shaxsiy qoladi.
- Admin o‘quv fayllarini o‘chirganda umumiy ro‘yxat ham yangilanadi. Fayl ishga biriktirilgan bo‘lsa avval biriktirmani yoki ishni o‘chiring.

## Talabalarni kuzatish

**Talabalar ishlari → ism/Gmail orqali qidirish → Barcha ishlar**. Natijalar, javoblar, fayllar, loyiha yechimlari, muharrir qoralamalari, SI va jonli viktorina ma’lumotlari tegishli bo‘limlarda ko‘rinadi. Talaba ishlari boshqa talabalarga ko‘rsatilmaydi.

## Hisoblar va parollar

**Administrator paneli** Gmail loginlarini va oxirgi 200 hisobni ko‘rsatadi. Parollar ko‘rsatilmaydi: ular xesh sifatida saqlanadi. Foydalanuvchi o‘z parolini **Hisob xavfsizligi**dan o‘zgartiradi yoki kirish sahifasida o‘z tiklash kodidan foydalanadi. Email orqali avtomatik tiklash ulanmagan.

## Oldingi versiyani yangilash

Serverni to‘xtating. Butun `IDROK_DATA_DIR` papkasini zaxiralang. Yangi kodni alohida ochib eski `.env` va doimiy ma’lumotlar papkasidan foydalaning. `data`ni o‘chirmang. Birinchi 3.4 start adminni tayyorlaydi; keyingi startlar parolni qayta o‘rnatmaydi. Admin sifatida tayinlangan eski hisobdagi o‘quv materiallari ham umumiy ko‘rinadi.

ZIP tayyor dastur va kodni beradi; internetdagi eski saytni avtomatik yangilamaydi. Umumiy foydalanish uchun Node serverni doimiy disk va HTTPS bilan bitta hostingga joylashtiring. Alohida kompyuterlarda ishga tushirilgan mustaqil serverlar bir-birining bazasini ulashmaydi.
