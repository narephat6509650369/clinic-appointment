-- สคริปต์ SQL เทียบเท่ากับ migration (ใช้แทน php artisan migrate ได้ถ้าต้องการ)
CREATE TABLE patients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  hn VARCHAR(20) NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(10) NOT NULL,
  birth_date DATE NOT NULL,
  registered_at DATE NOT NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  INDEX (phone), INDEX (first_name, last_name), INDEX (last_name), INDEX (registered_at)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL, specialty VARCHAR(255) NULL,
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL, doctor_id BIGINT UNSIGNED NOT NULL,
  appointment_date DATE NOT NULL, start_time TIME NOT NULL, end_time TIME NOT NULL,
  status VARCHAR(12) NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL,
  INDEX idx_doctor_day (doctor_id, appointment_date, start_time),
  INDEX idx_date_start (appointment_date, start_time),
  INDEX idx_date_status (appointment_date, status),
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ข้อมูลตัวอย่าง
INSERT INTO doctors (name, specialty) VALUES
 ('นพ.สมชาย ใจดี','อายุรกรรม'),('พญ.วิภา รักษา','ผิวหนัง'),('นพ.ธนา มั่นคง','กุมารเวช'),('พญ.นภา สุขสวัสดิ์','สูตินรีเวช');
INSERT INTO patients (hn, first_name, last_name, phone, birth_date, registered_at) VALUES
 ('HN000001','สมศรี','แสนดี','0812345678','1990-05-12',CURDATE()),
 ('HN000002','วิชัย','เจริญสุข','0898765432','1985-11-03',CURDATE()),
 ('HN000003','มาลี','วงศ์ไทย','0623456789','2001-02-20',CURDATE());
INSERT INTO appointments (patient_id, doctor_id, appointment_date, start_time, end_time, status) VALUES
 (1,1,CURDATE(),'09:00','09:30','waiting'),(2,1,CURDATE(),'09:30','10:00','waiting'),(3,2,CURDATE(),'10:00','11:00','waiting');
