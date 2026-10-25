<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function create(array $d): Appointment
    {
        return DB::transaction(function () use ($d) {
            $this->lockDoctor($d['doctor_id']);
            $this->assertFree($d['doctor_id'], $d['appointment_date'], $d['start_time'], $d['end_time']);
            return Appointment::create($d + ['status' => 'waiting']);
        });
    }

    public function changeStatus(Appointment $a, string $status): void
    {
        DB::transaction(function () use ($a, $status) {
            $this->lockDoctor($a->doctor_id);
            $a->refresh();
            // ถ้า "ยกเลิก" -> กลับมาเป็น รอ/มาแล้ว ต้องเช็คชนอีกครั้ง เพราะช่วงเวลานั้นอาจถูกจองไปแล้ว
            if ($a->status === 'cancelled' && $status !== 'cancelled') {
                $this->assertFree($a->doctor_id, $a->appointment_date->toDateString(), $a->start_time, $a->end_time, $a->id);
            }
            $a->update(['status' => $status]);
        });
    }

    /** lock แถวแพทย์ ทำให้คำขอที่จองแพทย์คนเดียวกันพร้อมกันต้องต่อคิว -> กัน race condition */
    private function lockDoctor(int $id): void
    {
        Doctor::whereKey($id)->lockForUpdate()->firstOrFail();
    }

    /** ซ้อนกันเมื่อ: เริ่มใหม่ < จบเดิม  และ  จบใหม่ > เริ่มเดิม (ต่อกันพอดี เช่น 10:00-11:00 กับ 11:00-12:00 ไม่นับว่าชน) */
    private function assertFree(int $doctorId, string $date, string $start, string $end, ?int $ignoreId = null): void
    {
        $c = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->where('status', '!=', 'cancelled')
            ->where('start_time', '<', $end)
            ->where('end_time', '>', $start)
            ->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))
            ->first();

        if ($c) {
            throw ValidationException::withMessages([
                'start_time' => 'แพทย์มีนัดซ้อนกับช่วง '.substr($c->start_time, 0, 5).'–'.substr($c->end_time, 0, 5),
            ]);
        }
    }
}
