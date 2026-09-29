# Telegram News Bot for Cloudflare Workers

ربات خبری تلگرام که هر ۳۰ دقیقه با Cloudflare Cron اجرا می‌شود، با OpenAI و Web Search خبرهای جدید را آماده می‌کند و در کانال می‌فرستد. یک Web UI داخلی برای مدیریت ربات هم دارد.

## امکانات

- ارسال خودکار هر ۳۰ دقیقه
- ارسال دستی از پنل
- روشن/خاموش کردن ارسال خودکار
- تعیین تعداد خبر
- تعیین موضوعات
- تعیین سبک نوشتار
- قالب پیام
- تست اتصال Telegram
- داشبورد وضعیت و آخرین خروجی
- ورود امن پنل با رمز و session cookie
- ذخیره تنظیمات و sessionها در Cloudflare KV

## ساختار

```text
telegram-news-bot/
├─ src/
│  └─ index.js
├─ .github/workflows/deploy.yml
├─ wrangler.jsonc
├─ package.json
├─ .gitignore
└─ README.md
```

## 1. ساخت Repository

در GitHub یک Repository جدید بساز و تمام فایل‌های این پروژه را در ریشه آن قرار بده.

## 2. Deploy با Wrangler

```bash
npm install
npx wrangler login
npx wrangler deploy
```

Wrangler می‌تواند KV را هنگام deploy به‌صورت خودکار provision کند وقتی binding بدون ID تعریف شده باشد. در صورت درخواست Cloudflare، اجازه ساخت resource را تأیید کن.

## 3. Secretها

این‌ها را در Cloudflare Worker به‌صورت Secret تنظیم کن:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHANNEL
OPENAI_API_KEY
ADMIN_PASSWORD
```

اختیاری:

```text
OPENAI_MODEL
```

پیش‌فرض `gpt-5.6-luna` است.

مثال با Wrangler:

```bash
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHANNEL
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put ADMIN_PASSWORD
```

برای `TELEGRAM_CHANNEL` می‌توانی username کانال مثل `@YourChannel` را استفاده کنی.

## 4. Telegram

Bot را به کانال اضافه کن و اجازه ارسال پیام بده.

## 5. پنل

بعد از deploy آدرس Worker را باز کن. رمز `ADMIN_PASSWORD` را وارد کن.

## 6. GitHub Actions (اختیاری)

اگر می‌خواهی هر push به `main` خودش deploy شود، در GitHub Repository > Settings > Secrets and variables > Actions این دو Secret را بساز:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

این workflow خود Worker را deploy می‌کند؛ API keyهای ربات داخل GitHub ذخیره نمی‌شوند و باید در Cloudflare Secrets باقی بمانند.

## 7. Cron

Cron پروژه `*/30 * * * *` است؛ یعنی هر ۳۰ دقیقه. Cronهای Cloudflare بر اساس UTC اجرا می‌شوند.

## نکات مهم

- OpenAI API و Web Search هزینه API دارند.
- کلیدهای API را داخل GitHub commit نکن.
- `ADMIN_PASSWORD` را یک رمز قوی و اختصاصی قرار بده.
- اگر GitHub Actions استفاده نمی‌کنی، می‌توانی فقط با Wrangler deploy کنی.
