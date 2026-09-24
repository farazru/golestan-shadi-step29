# نصب روی سرور لینوکس ایران

اوبونتو ۲۲.۰۴ یا ۲۴.۰۴، حدود ۴ گیگ رم. Node 22.

```bash
sudo apt update
sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

فایل پروژه را روی سرور باز کنید، سپس:

```bash
cd school-platform
cp .env.example .env.local
nano .env.local
# BETTER_AUTH_SECRET
# BETTER_AUTH_URL=https://golestanshadi.ir
mkdir -p data/private/avatars data/private/karnameh data/private/submissions
# BETTER_AUTH_SECRET must be at least 32 random characters.
# openssl rand -base64 32
# BETTER_AUTH_URL=https://golestanshadi.ir
npm run preflight
npm run db:migrate
npm install
npm run build

```

اجرا (برای تست):

```bash
npm start
```

برای ماندگار بودن، systemd یا PM2:

```bash
sudo npm i -g pm2
PORT=8080 pm2 start npm --name golestan -- start
pm2 save
pm2 startup
```

دامنه را با رکورد A به IP سرور بزنید. جلوی آن nginx + گواهی رایگان:

```nginx
server {
  listen 80;
  server_name golestanshadi.ir;
  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

هر هفته `data/school.db` و پوشه `data/private` را رمزنگاری‌شده کپی کنید. بازیابی را یک بار روی یک پوشه خالی امتحان کنید: فایل دیتابیس و `avatars`، `karnameh`، `submissions` باید با هم برگردند. از داشبورد مدیر هم پشتیبان بگیرید. این فایل‌ها اطلاعات دانش‌آموز است؛ روی فضای عمومی نگذارید.

