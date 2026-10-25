# ระบบนัดหมายคลินิก (Laravel 12 + MySQL + Inertia React)

## ติดตั้งและรัน
ต้องมี PHP 8.2+, Composer, Node 18+, MySQL 8
1. สร้างฐานข้อมูล: `CREATE DATABASE clinic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. `./setup.sh` (สร้างโปรเจกต์ Laravel, คัดลอกโค้ดทับ, ติดตั้งแพ็กเกจ, ตั้ง `.env`, migrate + seed)
   - ถ้าใช้ user/รหัสผ่าน MySQL อื่น ให้แก้ `DB_USERNAME` / `DB_PASSWORD` ใน `clinic/.env` แล้วรัน `php artisan migrate:fresh --seed`
3. เปิด 2 terminal ในโฟลเดอร์ `clinic/`: `php artisan serve` และ `npm run dev` → http://127.0.0.1:8000
4. ทดสอบข้อมูลหลักแสน: `php artisan db:seed --class=BulkSeeder`
- ไม่ใช้ Laravel migration: ใช้ `database/schema.sql` สร้างตาราง + ข้อมูลตัวอย่างแทนได้

## โครงสร้าง / แนวคิด
| ส่วน | ไฟล์ |
|---|---|
| แปลงเบอร์โทร | `app/Support/Phone.php` |
| HN + ค้นหา | `app/Models/Patient.php` |
| เช็คนัดชน + เปลี่ยนสถานะ | `app/Services/AppointmentService.php` |
| หน้าจอ (React) | `resources/js/Pages/*` |

**HN**: insert แล้วใช้ auto-increment `id` ทำเป็น `HN000001` ใน transaction เดียว + `UNIQUE(hn)` จึงไม่ซ้ำแม้กดพร้อมกัน

**เบอร์โทร**: ตัดทุกอย่างที่ไม่ใช่ตัวเลข, `+66`/`66`/`0066` → `0`, ต้องเป็น 9–10 หลักขึ้นต้น 0 ไม่งั้น error

**นัดชน**: ซ้อนกันเมื่อ `เริ่มใหม่ < จบเดิม AND จบใหม่ > เริ่มเดิม` (ครอบคลุมซ้อนบางส่วน/ครอบทั้งหมด; 10:00–11:00 กับ 11:00–12:00 ไม่ชน) กรองเฉพาะแพทย์เดียวกัน วันเดียวกัน และ `status != cancelled`
กัน race condition ด้วย `lockForUpdate()` แถวแพทย์ใน transaction เดียวกับการเช็ค+insert
การเปลี่ยนสถานะจาก "ยกเลิก" กลับเป็น รอ/มาแล้ว จะเช็คชนซ้ำ

**Index** (ดู `database/migrations`)
- `patients`: `UNIQUE(hn)`, `phone`, `(first_name,last_name)`, `last_name`, `registered_at` — ค้นหาแบบ prefix (`LIKE 'abc%'`) เพื่อใช้ index ได้ (ไม่ใช้ `%abc%`)
- `appointments`: `(doctor_id, appointment_date, start_time)` เช็คชน/กรองแพทย์, `(appointment_date, start_time)` หน้านัดวันนี้, `(appointment_date, status)` รายงาน

**รายงาน**: `COUNT(*)` / `GROUP BY status` ใน SQL ล้วน ไม่ดึงแถวมานับใน PHP; รายการผู้ป่วยใช้ pagination; เลือกผู้ป่วยตอนสร้างนัดใช้ autocomplete (limit 10)

## ข้อจำกัด / ที่ยังไม่ได้ทำ
- ไม่มีระบบ login/สิทธิ์ผู้ใช้, ไม่มีหน้าจัดการแพทย์ (ตามโจทย์)
- นัดข้ามเที่ยงคืนไม่รองรับ (เวลาสิ้นสุดต้องหลังเวลาเริ่มในวันเดียวกัน)
- ยังไม่มีแก้ไข/ย้ายเวลานัด (ทำได้แค่สร้าง + เปลี่ยนสถานะ)
- ยังไม่มี automated test; ค้นชื่อแบบ "ขึ้นต้นด้วย" เท่านั้น (ไม่ค้นกลางคำ)
- ไม่ตรวจเบอร์ซ้ำระหว่างผู้ป่วย

## ส่วนที่ใช้ AI ช่วย
> **(แก้ให้ตรงความจริง)** ใช้ Claude ช่วยร่างโค้ดทั้งหมดของโปรเจกต์เป็นโครงเริ่มต้น หลังจากนนั้นก็ปรับโค้ดเพื่อให้รันเพื่อส่งข้อมูลจาก frontend มา database ได้จริง 
"# clinic-appointment" 
