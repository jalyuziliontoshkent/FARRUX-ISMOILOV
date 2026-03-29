# CurtainOrderApp - Premium Buyurtma Boshqarish Tizimi

## Loyiha Haqida
Pardalar va jalyuzilar ishlab chiqaruvchi korxonalar uchun maxsus ishlab chiqilgan, "Liquid Glass" dizaynga ega mobil ilova. Admin va Dealer rollariga asoslangan ERP tizimi.

## Texnologik Stack
- **Frontend**: React Native (Expo Router) 
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Auth**: JWT Bearer token
- **Design**: Liquid Glass (Qora & Oq)

## Rollar
### Admin
- Statistika ko'rish (buyurtmalar, daromad, dilerlar, materiallar)
- Buyurtmalarni boshqarish (tasdiqlash, rad etish, status o'zgartirish)
- Ombor (materiallar) boshqarish (qo'shish, o'chirish, qidirish)
- Dilerlarni boshqarish (qo'shish, o'chirish, kredit limit)
- Telegram uslubidagi chat har bir diler bilan

### Dealer
- Yangi buyurtma yaratish (material tanlash, o'lcham kiritish, kv.m hisoblagich)
- Buyurtmalar statusini kuzatish (kutilmoqda -> tasdiqlangan -> tayyorlanmoqda -> yetkazildi)
- Admin bilan chat
- Kredit limit va qarz ko'rish

## Hisob-kitob
- En × Bo'yi = Jami kv.m
- Narx = Jami kv.m × Material narxi (kv.m uchun)

## Buyurtma Statuslari
1. Kutilmoqda (yangi)
2. Tasdiqlangan (admin tomonidan)
3. Tayyorlanmoqda
4. Yetkazildi
5. Rad etilgan (sababini ko'rsatiladi)

## API Endpoints
- POST /api/auth/login
- GET /api/auth/me
- GET/POST /api/dealers
- GET/POST /api/materials
- GET/POST /api/orders
- PUT /api/orders/{id}/status
- GET/POST /api/messages
- GET /api/messages/{partner_id}
- GET /api/chat/partners
- GET /api/statistics
