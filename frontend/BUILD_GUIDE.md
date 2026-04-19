# Lion Blinds - EAS Build Guide

## Branding Updates ✅
- App Name: **Lion Blinds**
- Bundle ID: `uz.lion.blinds`
- Logo: Barcha joyda bir xil icon.png foydalaniladi
- Background: #000000 (qora)

## Logo Faylni Saqlash

Yuklangan **Lion Blinds** logoni quyidagi fayl sifatida saqlang:

```
frontend/assets/images/icon.png
```

**Talablar:**
- Format: PNG
- O'lcham: 1024x1024 px (eng yaxshi)
- Orqa fon: Qora (#000000) yoki transparent
- Ikonka markazda joylashgan bo'lishi kerak

## APK Build Qilish

### 1. Expo Project ID olish (agar yo'q bo'lsa):

```bash
cd frontend
npx expo login
npx expo init --id  # Yangi project ID yaratadi
```

Yoki https://expo.dev da yangi project yarating va ID ni `app.json` ga qo'shing.

### 2. EAS Build ishga tushirish:

```bash
# Preview APK (test uchun)
eas build -p android --profile preview

# Yoki package.json script orqali:
yarn build:preview
```

### 3. Build ni kuzatish:

Build cloud'da bo'ladi. Statusni ko'rish:
```bash
eas build:list
```

### 4. APK ni yuklab olish:

Build tugagach, Expo email orqali yoki `eas build:list` dan URL olib, APK ni yuklab oling.

## Build Turlari

| Profile | Turi | Maqsad |
|---------|------|--------|
| `development` | APK | Development/debug |
| `preview` | APK | Test/Taqdimot |
| `production` | AAB | Play Store |

## Qisqa Buyruqlar

```bash
# Preview APK
eas build -p android --profile preview

# Production AAB
eas build -p android --profile production

# iOS Simulator
eas build -p ios --profile preview
```

## Muammolar

**Agar build xato beringan bo'lsa:**

1. `app.json` da projectId to'g'ri ekanligini tekshiring
2. Expo account ga login qiling: `eas login`
3. Qayta urunib ko'ring

**Build cache tozalash:**
```bash
eas build -p android --profile preview --clear-cache
```
