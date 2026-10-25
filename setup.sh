#!/usr/bin/env bash
# ใช้: ./setup.sh  (ต้องมี PHP 8.2+, Composer, Node 18+, MySQL และสร้างฐานข้อมูลชื่อ clinic ไว้ก่อน)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
composer create-project laravel/laravel "$HERE/clinic" --prefer-dist
rsync -a --exclude setup.sh --exclude README.md --exclude clinic "$HERE/" "$HERE/clinic/"
cd "$HERE/clinic"
composer require inertiajs/inertia-laravel
npm i react react-dom @inertiajs/react && npm i -D @vitejs/plugin-react
# ตั้งค่า .env : MySQL + เขตเวลาไทย
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/; s/^# *DB_HOST=.*/DB_HOST=127.0.0.1/; s/^# *DB_PORT=.*/DB_PORT=3306/; s/^# *DB_DATABASE=.*/DB_DATABASE=clinic/; s/^# *DB_USERNAME=.*/DB_USERNAME=root/; s/^# *DB_PASSWORD=.*/DB_PASSWORD=/' .env
grep -q '^APP_TIMEZONE' .env || echo 'APP_TIMEZONE=Asia/Bangkok' >> .env
php artisan migrate --seed --force
echo "เสร็จแล้ว: รัน 2 terminal -> php artisan serve  และ  npm run dev  แล้วเปิด http://127.0.0.1:8000"
