-- ── LMS: database & user (pola isolasi sama dgn mpi_db/mpi_user) ──────
-- GANTI password sebelum dijalankan! Jalankan: sudo mysql < db.sql
-- (sekali saja, saat setup awal server — lihat RUNBOOK §2)

CREATE DATABASE IF NOT EXISTS smp_lms
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'lms_user'@'localhost'
  IDENTIFIED BY 'GANTI_PASSWORD_KUAT';

GRANT ALL PRIVILEGES ON smp_lms.* TO 'lms_user'@'localhost';

-- ⚠ HANYA selama bootstrap migrasi (RUNBOOK §5). Setelah selesai bootstrap,
--   cabut kembali:
--     REVOKE SELECT ON cbt_tka.* FROM 'lms_user'@'localhost'; FLUSH PRIVILEGES;
-- GRANT SELECT ON cbt_tka.* TO 'lms_user'@'localhost';

FLUSH PRIVILEGES;
