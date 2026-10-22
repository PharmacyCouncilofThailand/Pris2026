# Smoke กับ API จริงในเครื่อง (spec §11.3)

สถานะ: smoke not run — needs DB prep by the user (runbook §1, §4)

## สิ่งที่ตรวจ (อ่านอย่างเดียว)

- `../conference-api` อยู่ที่ branch `feat/merchandise-preorder` (ตรวจด้วย `git branch --show-current`, ไม่ได้สลับ branch)
- `.env` ของ conference-api ชี้ไป Postgres ที่เชื่อมต่อได้ (host ระยะไกล, ไม่บันทึกค่าใน repo)
- รัน `SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = current_schema() AND c.relname LIKE 'merch\_%'` (runbook §1.1) ได้ 0 แถว: ยังไม่มีตาราง `merch_*` / migration 0043 ยังไม่ถูกรัน
- ฐานข้อมูลนี้เป็นของใช้ร่วมกัน จึงไม่ได้รัน migration, seed, INSERT/UPDATE และไม่ได้แก้ env หรือ config ใด ๆ ไม่ได้เปิดเซิร์ฟเวอร์ API

## ที่ผู้ใช้ต้องเตรียมก่อนเดิน smoke

1. รัน `drizzle/0043_merchandise.sql` ตาม runbook §1 กับ DB dev (หลังตรวจข้อ 1.1)
2. seed และตั้งสินค้า/เปิดร้านตาม runbook §4
3. รัน API แล้วชี้ Pris ด้วย `NEXT_PUBLIC_API_URL`; เดิน flow ร้าน → สินค้า → ตะกร้า → checkout → หน้าออเดอร์ และบันทึกผล (ถ้ายังไม่ตั้ง env PaySolution คาดว่าจะเห็น `awaiting_qr` และ “ระบบชำระเงินยังไม่พร้อม”)

## ผลการเดิน flow

ยังไม่ได้ทำ (ดูสถานะด้านบน) ส่วนพฤติกรรมฝั่ง Pris ถูกครอบคลุมด้วย e2e ที่ใช้ fake API (`npm run test:e2e:merchandise`)
