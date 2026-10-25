<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([['นพ.สมชาย ใจดี', 'อายุรกรรม'], ['พญ.วิภา รักษา', 'ผิวหนัง'], ['นพ.ธนา มั่นคง', 'กุมารเวช'], ['พญ.นภา สุขสวัสดิ์', 'สูตินรีเวช']] as [$n, $s]) {
            Doctor::create(['name' => $n, 'specialty' => $s]);
        }
        foreach ([['สมศรี', 'แสนดี', '0812345678', '1990-05-12'], ['วิชัย', 'เจริญสุข', '0898765432', '1985-11-03'], ['มาลี', 'วงศ์ไทย', '0623456789', '2001-02-20']] as [$f, $l, $p, $b]) {
            Patient::register(['first_name' => $f, 'last_name' => $l, 'phone' => $p, 'birth_date' => $b]);
        }
        $today = now()->toDateString();
        foreach ([[1, 1, '09:00', '09:30'], [2, 1, '09:30', '10:00'], [3, 2, '10:00', '11:00']] as [$p, $d, $s, $e]) {
            Appointment::create(['patient_id' => $p, 'doctor_id' => $d, 'appointment_date' => $today, 'start_time' => $s, 'end_time' => $e, 'status' => 'waiting']);
        }
    }
}
