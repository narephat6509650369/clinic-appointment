<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/appointments/today');

Route::get('/patients', [PatientController::class, 'index']);
Route::get('/patients/search', [PatientController::class, 'search']);
Route::post('/patients', [PatientController::class, 'store']);
Route::put('/patients/{patient}', [PatientController::class, 'update']);

Route::get('/appointments/today', [AppointmentController::class, 'today']);
Route::post('/appointments', [AppointmentController::class, 'store']);
Route::patch('/appointments/{appointment}/status', [AppointmentController::class, 'status']);

Route::get('/reports', [ReportController::class, 'index']);
