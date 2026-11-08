# گلستان شادی — اپ اندروید

سایت وب همان است. این پوشه یک پوستهٔ بومی است که همان سایت را داخل اپ باز می‌کند.

## آیا سایت باید زنده باشد؟

برای نسخهٔ نهایی بله. اپ صفحات را از سرور می‌خواند؛ اگر سایت نباشد، اپ خالی باز می‌شود.

برای تست قبل از دامنهٔ نهایی، اپ را به سرور محلی وصل کنید.

## تست قبل از دامنه

۱. روی رایانهٔ خود سایت را اجرا کنید:

```bash
npm install
npm run db:push
npm run dev
```

۲. شبیه‌ساز اندروید (داخل Android Studio) به رایانه با آدرس `10.0.2.2` وصل می‌شود:

```bash
CAPACITOR_SERVER_URL=http://10.0.2.2:8080 npx cap sync android
npx cap open android
```

۳. گوشی واقعی روی همان وای‌فای: آدرس IP رایانه را بگذارید (مثلاً `192.168.1.20`):

```bash
CAPACITOR_SERVER_URL=http://192.168.1.20:8080 npx cap sync android
```

در Android Studio دکمهٔ Run را بزنید. اپ همان سایت محلی را نشان می‌دهد.

## ساخت APK برای انتشار

بعد از اینکه سایت روی دامنه بالا آمد:

```bash
CAPACITOR_SERVER_URL=https://golestanshadi.ir npx cap sync android
npx cap open android
```

Build → Build Bundle(s) / APK(s) → Build APK.

این محیط ساخت APK ندارد (Android SDK اینجاست نیست). APK را روی ویندوز یا مک با Android Studio می‌سازید.