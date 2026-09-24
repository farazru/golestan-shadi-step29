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
mkdir -p data/private/avatars data/private/karnameh
npx drizzle-kit push
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

هر هفته `data/school.db` و پوشه `data/private` را روی فلش کپی کنید. مدیر از داشبورد هم می‌تواند پشتیبان بگیرد.
