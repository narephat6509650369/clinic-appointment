<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $t) {
            $t->id();
            $t->string('hn', 20)->nullable()->unique();        // HN000001 (unique กัน HN ซ้ำ)
            $t->string('first_name', 100);
            $t->string('last_name', 100);
            $t->string('phone', 10);                            // เก็บแบบ normalize แล้ว
            $t->date('birth_date');
            $t->date('registered_at');
            $t->timestamps();
            $t->index('phone');                                 // ค้นหาด้วยเบอร์
            $t->index(['first_name', 'last_name']);             // ค้นหาด้วยชื่อ (prefix)
            $t->index('last_name');                             // ค้นหาด้วยนามสกุล
            $t->index('registered_at');                         // รายงานผู้ป่วยใหม่
        });

        Schema::create('doctors', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('specialty')->nullable();
            $t->timestamps();
        });

        Schema::create('appointments', function (Blueprint $t) {
            $t->id();
            $t->foreignId('patient_id')->constrained();
            $t->foreignId('doctor_id')->constrained();
            $t->date('appointment_date');
            $t->time('start_time');
            $t->time('end_time');
            $t->string('status', 12)->default('waiting');       // waiting | arrived | cancelled
            $t->timestamps();
            $t->index(['doctor_id', 'appointment_date', 'start_time'], 'idx_doctor_day'); // เช็คนัดชน + กรองตามแพทย์
            $t->index(['appointment_date', 'start_time'], 'idx_date_start');             // หน้านัดวันนี้เรียงตามเวลา
            $t->index(['appointment_date', 'status'], 'idx_date_status');                // รายงานแยกสถานะ
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('doctors');
        Schema::dropIfExists('patients');
    }
};
