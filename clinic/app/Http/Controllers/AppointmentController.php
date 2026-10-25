<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function __construct(private AppointmentService $svc) {}

    public function today(Request $r)
    {
        $date = $r->input('date', now()->toDateString());
        $q = Appointment::with(['patient:id,hn,first_name,last_name,phone', 'doctor:id,name'])
            ->where('appointment_date', $date)
            ->orderBy('start_time');
        if ($r->filled('doctor_id')) {
            $q->where('doctor_id', $r->doctor_id);
        }

        return Inertia::render('Appointments/Today', [
            'date' => $date,
            'doctorId' => $r->input('doctor_id', ''),
            'doctors' => Doctor::orderBy('name')->get(['id', 'name', 'specialty']),
            'appointments' => $q->get(),
        ]);
    }

    public function store(Request $r)
    {
        $d = $r->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:doctors,id',
            'appointment_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ], ['patient_id.required' => 'กรุณาเลือกผู้ป่วย', 'end_time.after' => 'เวลาสิ้นสุดต้องหลังเวลาเริ่ม']);

        $this->svc->create($d);
        return back()->with('success', 'สร้างนัดหมายแล้ว');
    }

    public function status(Request $r, Appointment $appointment)
    {
        $d = $r->validate(['status' => ['required', Rule::in(Appointment::STATUSES)]]);
        $this->svc->changeStatus($appointment, $d['status']);
        return back();
    }
}
