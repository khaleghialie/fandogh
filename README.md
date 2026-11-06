<div dir="rtl" align="center">

# Fandogh

### مدیریت ساده و دیداری پروژه‌ها با بردهای کانبان

بردهای کاری‌تان را بسازید، مراحل را مطابق جریان کار خودتان تغییر دهید و کارت‌ها را با کشیدن و رها کردن جابه‌جا کنید.

<a href="https://github.com/khaleghialie/fandogh">
  <img src="https://img.shields.io/badge/GitHub-fandogh-181717?style=flat&logo=github" alt="مخزن Fandogh در GitHub">
</a>
<img src="https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js" alt="Next.js 16">
<img src="https://img.shields.io/badge/React-19-149eca?style=flat&logo=react" alt="React 19">
<img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat&logo=typescript" alt="TypeScript 5">

</div>

---

## درباره‌ی پروژه

**Fandogh** یک فضای کاری سبک و تصویری برای پیگیری کارهای پروژه است. هر برد پنج مرحله‌ی قابل‌تغییر دارد و کارت‌ها را می‌توان بین مراحل جابه‌جا کرد. پروژه با Next.js و React ساخته شده و برای شروع، یک برد نمونه با چند کارت آماده دارد.

## امکانات

- ساخت چند برد و جابه‌جایی بین آن‌ها
- پنج مرحله برای هر برد: Inbox، To Do، In Progress، Review و Done
- تغییر نام مرحله‌ها
- ساخت و حذف کارت‌های دارای عنوان و جزئیات
- جابه‌جایی کارت‌ها با کشیدن و رها کردن یا صفحه‌کلید
- رابط کاربری واکنش‌گرا
- بدون نیاز به حساب کاربری یا پایگاه داده

> داده‌ها فقط در حافظه‌ی مرورگر نگهداری می‌شوند؛ با بازخوانی یا بستن صفحه، تغییرات از بین می‌روند.

## شروع سریع

به پوشه‌ی برنامه بروید، وابستگی‌ها را نصب کنید و سرور توسعه را اجرا کنید:

```bash
cd frontend
npm ci
npm run dev
```

سپس [http://localhost:3000](http://localhost:3000) را در مرورگر باز کنید.

## فرمان‌های پروژه

فرمان‌ها را از پوشه‌ی `frontend` اجرا کنید:

| فرمان | کاربرد |
| --- | --- |
| `npm run dev` | اجرای سرور توسعه |
| `npm run build` | ساخت نسخه‌ی آماده‌ی انتشار |
| `npm run start` | اجرای نسخه‌ی ساخته‌شده |
| `npm run lint` | بررسی کد با ESLint |
| `npm test` | اجرای آزمون‌های واحد |
| `npm run test:e2e` | اجرای آزمون‌های مرورگر با Playwright |

آزمون‌های مرورگر به Google Chrome نیاز دارند.

## فناوری‌ها

- [Next.js](https://nextjs.org/) و [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [dnd-kit](https://dndkit.com/) برای جابه‌جایی کارت‌ها
- [Lucide](https://lucide.dev/) برای آیکون‌ها
- [Vitest](https://vitest.dev/) و [Playwright](https://playwright.dev/) برای آزمون‌ها

## ساختار پروژه

```text
frontend/
├── e2e/          # آزمون‌های مرورگر
├── src/
│   ├── app/      # صفحه‌ها و اجزای رابط کاربری
│   └── lib/      # منطق برد و آزمون‌های واحد
├── package.json
└── README.md
```

## مشارکت

برای پیشنهاد تغییر یا گزارش مشکل، یک [Issue](https://github.com/khaleghialie/fandogh/issues) باز کنید یا Pull Request بفرستید.
