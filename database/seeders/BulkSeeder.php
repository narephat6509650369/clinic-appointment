<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/** ข้อมูลทดสอบปริมาณมาก: php artisan db:seed --class=BulkSeeder  (ผู้ป่วย 200,000 / นัด 300,000) */
class BulkSeeder extends Seeder
{
    public function run(): void
    {
        $fn = ['สมชาย', 'สมหญิง', 'วิชัย', 'มาลี', 'ประเสริฐ', 'นภา', 'อนุชา', 'กานดา'];
        $ln = ['ใจดี', 'รักษา', 'สุขสวัสดิ์', 'มั่นคง', 'วงศ์ไทย', 'เจริญสุข'];
        $max = (int) DB::table('patients')->max('id');
        $docs = DB::table('doctors')->pluck('id')->all();

        for ($c = 0; $c < 200; $c++) {
            $rows = [];
            for ($i = 1; $i <= 1000; $i++) {
                $id = $max + $c * 1000 + $i;
                $rows[] = ['id' => $id, 'hn' => sprintf('HN%06d', $id), 'first_name' => $fn[array_rand($fn)], 'last_name' => $ln[array_rand($ln)],
                    'phone' => '08'.str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT),
                    'birth_date' => now()->subYears(random_int(1, 80))->toDateString(),
                    'registered_at' => now()->subDays(random_int(0, 365))->toDateString()];
            }
            DB::table('patients')->insert($rows);
        }
        $total = $max + 200000;
        for ($c = 0; $c < 300; $c++) {
            $rows = [];
            for ($i = 0; $i < 1000; $i++) {
                $h = random_int(8, 17);
                $rows[] = ['patient_id' => random_int(1, $total), 'doctor_id' => $docs[array_rand($docs)],
                    'appointment_date' => now()->subDays(random_int(0, 365))->toDateString(),
                    'start_time' => sprintf('%02d:00:00', $h), 'end_time' => sprintf('%02d:30:00', $h),
                    'status' => ['waiting', 'arrived', 'cancelled'][random_int(0, 2)]];
            }
            DB::table('appointments')->insert($rows);
        }
    }
}
