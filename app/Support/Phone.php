<?php

namespace App\Support;

class Phone
{
    /** ตัดอักขระที่ไม่ใช่ตัวเลข และแปลงรหัสประเทศ 66 / 0066 เป็น 0 (ไม่ตรวจความยาว ใช้กับการค้นหาบางส่วนได้) */
    public static function clean(?string $raw): string
    {
        $d = preg_replace('/\D+/', '', (string) $raw);
        if (str_starts_with($d, '0066')) {
            $d = '0'.substr($d, 4);
        } elseif (str_starts_with($d, '66')) {
            $d = '0'.ltrim(substr($d, 2), '0'); // รองรับ +66 (0)81...
        }
        return $d;
    }

    /** คืนค่าเบอร์มาตรฐาน 0XXXXXXXXX หรือ null ถ้ารูปแบบไม่ถูกต้อง */
    public static function normalize(?string $raw): ?string
    {
        $d = self::clean($raw);
        if ($d !== '' && $d[0] !== '0') {
            $d = '0'.$d; // กรอกมาแบบ 812345678
        }
        return preg_match('/^0\d{8,9}$/', $d) ? $d : null;
    }
}
