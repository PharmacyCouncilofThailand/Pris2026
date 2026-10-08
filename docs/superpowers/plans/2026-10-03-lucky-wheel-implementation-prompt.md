# Prompt สำหรับดำเนินการตามแผน PRIS2026 Lucky Wheel — แบบ B

คัดลอกข้อความตั้งแต่บรรทัดถัดไปไปใช้เป็นคำสั่งเริ่มงานได้โดยตรง

---

ให้ดำเนินการพัฒนา PRIS2026 Lucky Wheel ตามแผนที่อนุมัติแล้วจนจบทุก Task โดยยึดข้อบังคับด้านล่างอย่างเคร่งครัด เริ่มจากอ่านเอกสารและตรวจสภาพ workspace แล้วลงมือทำตามลำดับ ไม่หยุดเพียงการเสนอแผนหรือสรุปว่าจะทำอะไร

## 1. เอกสารอ้างอิงและขอบเขต

Workspace: `D:/confer/confer/conference`

อ่านเอกสารเหล่านี้ให้ครบก่อนแก้ไขโค้ด:

1. แผนหลัก: `D:/confer/confer/conference/Pris2026/docs/superpowers/plans/2026-10-03-lucky-wheel-implementation.md`
2. ข้อกำหนดที่อนุมัติ: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-03-lucky-wheel-design.md`
3. แนวทางหน้าจอแบบ B: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-03-lucky-wheel-surface-brief.md`
4. บันทึกการเลือกแบบ: `D:/confer/confer/conference/Pris2026/docs/superpowers/specs/2026-10-03-lucky-wheel-visual-options.md`
5. ภาพอ้างอิงที่อนุมัติ: `D:/confer/confer/conference/Pris2026/.impeccable/mocks/lucky-wheel-b.png` และไฟล์ JSON คู่กัน
6. คำสั่ง repository ที่ใช้บังคับ เช่น AGENTS.md และ scripts/configuration ที่เกี่ยวข้องกับแต่ละ Task

มี 3 Git repositories แยกกัน ได้แก่ `conference-api`, `conference-backoffice` และ `Pris2026` ต้องใช้ working directory ให้ถูกต้องสำหรับคำสั่ง Git, dependency, test และ build ไม่ถือว่า workspace root เป็น Git repository ที่รวมทั้งสามโครงการ

ห้ามออกนอกแผน เพิ่ม feature เปลี่ยนกติกาธุรกิจ เปลี่ยนแบบ B ทำ refactor ที่ไม่จำเป็น หรือขยายขอบเขตเพื่อความสะดวกของ implementation หากเอกสาร โค้ดจริง หรือคำสั่งที่ใช้บังคับขัดกัน ให้หยุดและถามตามข้อ 8 ห้ามเลือกตีความใหม่เอง

รายละเอียดเล็กน้อยที่แผนเปิดให้เลือกและไม่เปลี่ยนข้อกำหนด ให้ใช้ pattern เดิมในโครงการและวิธีที่เรียบง่ายที่สุด บันทึกเหตุผลเมื่อมีผลต่อการตรวจรับ ไม่ต้องขออนุมัติซ้ำสำหรับงานที่อนุมัติแล้ว

## 2. Skills และรูปแบบการทำงาน

- ใช้ **brainstorming** กำกับทุกขั้นตอน: ก่อนเริ่ม Task, เมื่อเลือกวิธีดำเนินการ, เมื่อพบปัญหา และก่อนสรุปผลตรวจรับ เพื่อเทียบกับแผนและข้อกำหนดเดิม ไม่ใช้เพื่อสร้าง scope ใหม่หรือเปิดคำถามที่ผู้ใช้ยืนยันแล้วซ้ำ
- ใช้ **api-design-principles** ในงานออกแบบและตรวจ API contract ตาม Task ที่เกี่ยวข้อง
- ใช้ **impeccable** และ **frontend-design** ในงานหน้าจอตามแบบ B รวมถึงการตรวจผลงานจริงกับภาพที่อนุมัติ
- ใช้ **caveman เฉพาะการสื่อสารในแชทและสรุปท้ายงาน** ให้สั้นและชัด แต่ไม่ตัดข้อมูลที่จำเป็นต่อการตัดสินใจ ใช้ภาษาปกติที่ครบถ้วนใน code, comments, tests, เอกสาร, หลักฐาน และ commit title/body
- อ่าน skill ที่ใช้จริงก่อนอ้างว่าใช้แล้ว หาก skill ที่จำเป็นไม่มี ให้ค้นหาจากรายการที่มีอยู่ก่อน หากยังหาไม่พบให้หยุดแจ้งข้อจำกัด ไม่แสร้งว่าโหลดแล้ว และไม่ติดตั้ง plugin เพิ่มโดยพลการ
- ดำเนินงานตาม Task ทีละขั้นด้วย workflow ปัจจุบัน และติดตามด้วย checkbox `- [ ]` / `- [x]` ไม่เพิ่มขั้นตอนเลือกวิธี execution ที่ไม่ได้อยู่ในแผน

## 3. ตรวจสภาพก่อนเริ่ม

1. ตรวจ branch, `git status`, diff และไฟล์ที่ยังไม่ถูกติดตามของทั้งสาม repository ระบุของเดิมที่มีอยู่ก่อนเริ่ม ห้ามลบ ย้อนกลับ หรือ stage งานอื่นของผู้ใช้
2. ตรวจเวอร์ชัน runtime, package manager, scripts และ conventions จากโครงการจริง ใช้ dependency เดิมก่อน ไม่สร้าง abstraction หรือเพิ่ม package ที่แผนไม่จำเป็นต้องใช้
3. ตรวจ migration ล่าสุดก่อนใช้เลขที่ระบุในแผน หากชนกับ migration ที่เพิ่มขึ้นใหม่ ให้หยุดอธิบายและขอยืนยันการเปลี่ยนเลข ห้าม overwrite migration เดิม
4. ตรวจ test database guard และสภาพแวดล้อมทดสอบให้แน่ใจว่าไม่ใช่ production ห้ามใช้ runtime database เป็นฐานทดสอบที่ล้างข้อมูล
5. สร้างหรือปรับบันทึกความคืบหน้าใน `Pris2026/docs/superpowers/verification/lucky-wheel/acceptance.md` โดยไม่ทับหลักฐานเดิม ใช้ไฟล์นี้เก็บ Task status, dependency ledger, ผลตรวจรับ และ commit ledger
6. หากขาดข้อมูลที่จำเป็นต่อ Task ปัจจุบันและไม่สามารถได้จาก repository ให้หยุดถาม ห้ามสมมติ event/session ID, credentials, ของรางวัลจริง, จุดรับของ หรือวันเวลาปิดรับเป็นค่าจริง

## 3A. Approved T09 scope amendment — 2026-10-03

ผู้ใช้อนุมัติให้ Task 9 แตะ `conference-api` ได้ **เฉพาะเท่าที่จำเป็น** เพื่อให้ Admin UI ใช้ข้อมูลจริงจาก server ตาม acceptance เดิม โดยเพิ่ม authenticated event-scoped admin read APIs สำหรับ:

- สถานะวงล้อปัจจุบัน: configuration/version/pool revision/pause/collection settings
- live segment stock และ stock/audit history ที่จำเป็นต่อหน้าจอ
- ผลการหมุน/claim state ที่กรองตามวันที่/รางวัล/สถานะรับของและแบ่งหน้าได้

ข้อบังคับ amendment:

- ใช้สิทธิ์ admin ตาม event และ re-check server-side identity แบบเดียวกับ Lucky Wheel admin routes เดิม
- เพิ่ม API/service/route tests และให้ผ่านก่อนทำ UI ต่อ
- ห้ามเพิ่ม business rule ใหม่, migration ใหม่, public leaderboard, worker/scheduler ใหม่ หรือ refactor นอกขอบเขต
- บันทึก amendment, tests และ acceptance evidence ใน `Pris2026/docs/superpowers/verification/lucky-wheel/acceptance.md`
- เมื่อ API gate ผ่าน ให้ resume Task 9 UI และเดิน Task 10–12 ตาม gate เดิม
- ห้าม push/deploy/production mutation

## 3B. Approved T10 attendee-history amendment — 2026-10-03

ผู้ใช้อนุมัติให้ Task 10 แตะ `conference-api` **เฉพาะ** authenticated owner-only Lucky Wheel history list แบบ paginated ตาม spec เดิม ภายใต้ attendee Lucky Wheel prefix ที่ระบบใช้อยู่

ข้อบังคับ amendment:

- owner ต้องมาจาก authenticated actor เท่านั้น และกรอง `eventId` ฝั่ง server
- ห้ามรับ `userId` จาก query/body/client
- response history ต้องไม่ส่ง reward QR token, display code หรือ credential สำหรับรับของ
- ต้องมี route/API tests และ PostgreSQL integration tests ครอบสิทธิ์, prize + no_prize, pagination และ claim/redemption status
- API gate ต้องผ่านก่อน wire `loadOwnSpins` และก่อนเริ่ม Task 11
- ห้ามเพิ่ม migration, business mutation, worker/scheduler, public lookup หรือ refactor นอกขอบเขต
- ทำต่อจาก durable revision 53; ห้ามทำ Task 1–9 ใหม่
- ห้าม push/deploy/production mutation

## 4. ลำดับ Task และสิ่งส่งมอบ

ใช้รายละเอียด Files, Interfaces และ checkbox ของแต่ละ Task ในแผนหลักเป็นรายการงานจริง ตารางนี้เป็นเพียงตัวช่วยติดตาม ไม่ใช้แทนรายละเอียดในแผน

| Task | ขอบเขตหลัก                                              | หลักฐานสำคัญก่อนผ่าน                                                              |
| ---- | ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 1    | Schema ประวัติเช็คอินรายวัน, migration, readiness query | Constraint ใน PostgreSQL จริง, ประวัติเดิมและจำนวนสิทธิ์ไม่เสียหาย                |
| 2    | กติกาสแกนร่วมทุกเส้นทาง, ยกเลิกรายวัน, backfill         | บัตรเดิมสแกนวันใหม่ได้, สแกนพร้อมกันไม่ซ้ำ, UTC แปลงถูก, session อื่นไม่เปลี่ยน   |
| 3    | API รายการ/สถิติ/รายละเอียด/ส่งออก                      | ตัวกรองวันที่และยอดผู้มีสิทธิ์/คนไม่ซ้ำ/จำนวนเข้าร่วมถูกต้อง                      |
| 4    | หน้าสแกนและรายงาน backoffice                            | วันที่จาก server ชัดเจน, ใช้ข้อมูลจริง, ยกเลิกเฉพาะวันที่เลือก                    |
| 5    | Schema วงล้อ, สต็อก, allocation และข้อบังคับข้อมูล      | โอกาสเท่ากันต่อช่องที่ใช้ได้, ของหมดไม่นำเข้าสุ่ม, ข้อมูลคงความถูกต้อง            |
| 6    | เผยแพร่/พัก/สต็อก/หมุนแบบ transaction                   | วันละหนึ่งสิทธิ์, idempotency, concurrency, snapshot และ stock ไม่ติดลบ           |
| 7    | หลักฐานรางวัล, QR/รหัส, รับของและการแก้ไข               | Owner/admin authorization, รับครั้งเดียว, retry ไม่สร้างผลซ้ำ, ไม่ตัดสต็อกซ้ำ     |
| 8    | R2 เฉพาะรูปวงล้อ                                        | ตรวจไฟล์จริง, สิทธิ์และ event, upload failure, เก็บรูปที่ประวัติยังใช้อยู่        |
| 9    | หน้าจัดการวงล้อ/สต็อก/รับของ                            | บันทึกและเผยแพร่, audit, preview ก่อนยืนยันรับ, เครือข่ายขัดข้อง                  |
| 10   | PRIS login return และ data client                       | กลับหน้าที่ถูกต้องหลัง login, ป้องกัน redirect ไม่ปลอดภัย, reconcile ผลเดิม       |
| 11   | หน้าวงล้อ/ประวัติ/หลักฐานรางวัลแบบ B                    | TH/EN, mobile, สถานะครบ, geometry ตรงผล server, accessibility และภาพหน้าจอจริง    |
| 12   | Integration, load, acceptance และ runbook               | 100 concurrent, invariants, end-to-end, staging/device/provider และหลักฐานตรวจรับ |

## 5. วงจรบังคับสำหรับทุก Task

ทำลำดับนี้ซ้ำตั้งแต่ Task 1 จนถึง Task 12:

1. ระบุ Task ปัจจุบันและ checkbox ที่กำลังทำ ตั้งสถานะ `RUNNING`
2. ใช้ brainstorming ตรวจเป้าหมาย ขอบเขต dependency และเงื่อนไขผ่านกับแผน อ่าน code และเส้นทางเรียกใช้งานที่เกี่ยวข้องก่อนแก้
3. ทำเฉพาะงานตาม Task ปัจจุบัน รวม tests ที่แผนกำหนด หากกำหนดให้ทดสอบล้มก่อนแก้ ต้องบันทึกว่าล้มเพราะพฤติกรรมที่กำลังพัฒนาจริง
4. รัน required checks ของ Task ให้ครบ เช่น unit/integration/API, DB constraints, typecheck, lint, build หรือ UI ตามที่แผนกำหนด
5. หากไม่ผ่าน ให้หาสาเหตุ แก้ใน scope แล้วรันตรวจซ้ำจนผ่าน ห้ามเริ่ม Task ถัดไปเพื่อหลีกเลี่ยงปัญหา ยกเว้นกรณี dependency ที่พิสูจน์ได้ตามข้อ 6
6. ห้ามลด assertion, ปิด test, ใช้ skip, ยกเลิก constraint หรือเปลี่ยน integration test เป็น mock เพื่อให้สถานะเขียว ห้ามถือว่า build ผ่านหมายถึงกติกาธุรกิจผ่าน
7. ตรวจ diff ว่าตรง Task และไม่กระทบงานอื่น บันทึกคำสั่ง สภาพแวดล้อม ผลลัพธ์และหลักฐานจริง ความล้มเหลวที่แก้แล้วต้องยังตรวจย้อนหลังได้
8. ให้ `PASS` และทำเครื่องหมาย checkbox เฉพาะเมื่อ checklist กับ required checks ของ Task ผ่านครบ ไม่รวม skipped/unverified เป็นผ่าน
9. ก่อนเริ่ม Task ใหม่ ตรวจ dependency ledger เสมอ หาก Task ที่เพิ่งผ่านปลด blocker ของ Task ก่อนหน้า ต้องกลับไปตรวจ Task เหล่านั้นทันทีตามข้อ 6
10. หากถึงรอบ commit ให้ทำข้อ 7 แล้วดำเนิน Task ถัดไปต่อทันที ไม่หยุดถามว่าจะทำต่อหรือไม่

สถานะที่ใช้:

- `PENDING`: ยังไม่เริ่ม
- `RUNNING`: อยู่ระหว่างดำเนินงานหรือตรวจรับ
- `DEFERRED_DEPENDENCY`: มี test ที่ต้องรอ Task ถัดไปในแผนพร้อมหลักฐานชัดเจน ยังไม่ถือว่าผ่าน
- `PASS`: งานและ required checks ผ่านครบ
- `DEFERRED_EXTERNAL_ACCEPTANCE`: ใช้เฉพาะ external staging/device/provider checks ที่ผู้ใช้อนุมัติให้ defer อย่างชัดเจน ไม่ใช่ `PASS` ของ check นั้นและไม่ใช่ `DEFERRED_DEPENDENCY`; ต้องบันทึก `NOT VERIFIED / DEFERRED` พร้อมสาเหตุ แต่ไม่บล็อก Implementation T12, Final comprehensive verification หรือ final batch commit เมื่อ local acceptance ที่กำหนดผ่านครบ
- `BLOCKED`: conflict หรือข้อจำกัดที่ต้องให้ผู้ใช้ตัดสินใจ ต้องหยุด

## 6. ข้อยกเว้นเมื่อ test ต้องรอ Task อื่น

อนุญาตให้เดินหน้าตามลำดับแผนได้โดยไม่ขออนุมัติซ้ำ **เฉพาะเมื่อพิสูจน์ได้ว่าข้อผิดพลาดเกิดจากงานที่ระบุไว้ใน Task หลังจากนี้และยังไม่ได้ดำเนินการ** ไม่ใช่ bug ของ Task ปัจจุบัน ไม่ใช่เหตุผลว่าแก้ภายหลังสะดวกกว่า และไม่ใช่การคิด Task ใหม่ขึ้นมา

ก่อนเดินหน้าต้องบันทึกครบ:

| Task ที่รอ  | Test/คำสั่งที่ล้ม | Error และหลักฐานสาเหตุ      | รอ Task/checkbox ใด    | เงื่อนไขกลับมาทดสอบ       | ผลทดสอบซ้ำ        |
| ----------- | ----------------- | --------------------------- | ---------------------- | ------------------------- | ----------------- |
| ระบุเลขจริง | ระบุคำสั่งจริง    | อธิบายความสัมพันธ์ที่ตรวจพบ | ระบุเลขและงานที่จำเป็น | ทันทีหลัง dependency ผ่าน | PENDING จนรันจริง |

กติกาหลังบันทึก:

1. ทำ checks ที่ไม่ติด dependency ของ Task ปัจจุบันให้ครบก่อน หากมี error อื่นให้แก้ก่อน
2. ตั้ง Task ที่รอเป็น `DEFERRED_DEPENDENCY` และคง checkbox ที่ยังไม่ผ่านไว้เป็น `- [ ]`
3. เดินหน้าตามลำดับ Task เดิม ไม่ข้ามไปสร้างงานนอกแผน
4. ทันทีที่ dependency Task ผ่าน ให้หยุดการเริ่ม Task ใหม่ แล้วกลับไปรัน checks ของทุก Task ที่เพิ่งถูกปลด blocker เรียง Task เก่าก่อน
5. แก้และทดสอบซ้ำจน Task ที่ถูกปลด blocker ผ่านครบ จึงเริ่ม Task ถัดไปได้ หากพบ dependency ใหม่อีกตัว ต้องพิสูจน์และบันทึกใหม่ ห้ามเลื่อนค้างโดยไม่มีเหตุผล
6. หาก dependency เป็นวงจร ต้องเพิ่มงานนอกแผน หรือยังหาสาเหตุไม่ได้ ให้ `BLOCKED` และหยุดถาม
7. ห้าม commit batch ที่ยังมี Task หรือ required check ค้าง แม้ Task หลังสุดของ batch ผ่านแล้ว

ตัวอย่าง: Task 5 มี check ที่ต้องใช้ส่วนใน Task 6 ให้บันทึก Task 5 ว่ารออะไร ทำ Task 6 จนผ่าน แล้วกลับมารัน checks ของ Task 5 จนผ่าน **ก่อนเริ่ม Task 7** ตัวอย่างนี้ไม่ใช่การประกาศว่ามี dependency ดังกล่าวจริง

การขาด test database, credential, อุปกรณ์ หรือบริการที่ต้องตรวจจริง ไม่ใช่ dependency Task โดยอัตโนมัติ ให้ทำ checks อิสระที่เหลือภายใน Task ปัจจุบัน แล้วหยุดขอข้อมูล/สิทธิ์/การตัดสินใจ ห้ามรายงาน `PASS` หรือข้าม gate เอง ไม่ขอให้ผู้ใช้ส่ง secret ในแชท เว้นแต่ผู้ใช้อนุมัติ acceptance-scope amendment อย่างชัดเจน; สำหรับ PRIS2026 Lucky Wheel amendment วันที่ 2026-10-03 ให้เฉพาะ LINE iOS/Android, real camera scan, rotation interruption/slow-network และ actual staging R2 upload/history persistence เป็น `DEFERRED_EXTERNAL_ACCEPTANCE` โดยต้องคงสถานะ `NOT VERIFIED / DEFERRED` และห้ามเปลี่ยน business logic/production behavior เพื่อชดเชยการไม่ได้ตรวจจริง

## 7. Commit เป็นชุด มี title และ body และห้าม push

รอบปกติ:

- ชุดที่ 1: Task 1–6 ผ่านครบ
- ชุดที่ 2: Task 7–12 ผ่านครบ **และผ่านการทดสอบภาพรวมรอบสุดท้ายในข้อ 9 แล้ว**

อนุญาตให้ปรับเป็นชุดที่ต่อเนื่องและสอดคล้องกัน 6–7 Tasks เมื่อ dependency ในแผนจำเป็น เช่น ชุดแรก Task 1–7 และชุดสุดท้าย Task 8–12 ให้บันทึกเหตุผล ชุดสุดท้ายซึ่งเป็นงานที่เหลือมีจำนวนน้อยกว่าได้ ห้ามใช้การแบ่งชุดเพื่อรวม Task ที่ยังไม่ผ่านแล้ว commit

ก่อน commit แต่ละชุด:

1. ยืนยันทุก Task ในชุดเป็น `PASS` ไม่มี required check หรือ deferred dependency ค้าง และผล test ตรงกับโค้ดล่าสุด; `DEFERRED_EXTERNAL_ACCEPTANCE` ที่ได้รับอนุมัติไม่ถือเป็น required check ค้าง แต่ต้องบันทึก `NOT VERIFIED / DEFERRED` และข้อจำกัดไว้ใน evidence/commit body โดยห้ามเรียกว่า `PASS`
2. ตรวจ `git status` และ diff ในแต่ละ repository เทียบกับ baseline ก่อนเริ่ม
3. Stage เฉพาะไฟล์ของงานที่ผ่านและหลักฐานที่เกี่ยวข้อง ตรวจ staged diff ก่อน commit ไม่ใช้ `git add .` โดยไม่ตรวจ scope
4. Commit จริงในแต่ละ repository ที่มีการเปลี่ยนแปลง ไม่เพียงเสนอ commit message ห้ามสร้าง empty commit ใน repository ที่ไม่มีงาน
5. ใช้ title และ body ครบถ้วน โดย title สรุปผลของชุดนั้น ส่วน body ระบุ Tasks ที่เกี่ยวข้อง พฤติกรรมที่เปลี่ยน สิ่งที่ตรวจจริงและข้อจำกัดที่มีนัยสำคัญ ใช้ภาษาปกติ ไม่ใช้ caveman ใน commit
6. บันทึก repository, task batch, SHA และ title/body จริงใน commit ledger สำหรับ SHA ของ commit สุดท้ายให้ยืนยันจาก Git และรายงานในแชท ไม่ต้องสร้าง commit เพิ่มเพื่อให้ commit บันทึก SHA ของตัวเอง
7. ตรวจว่าคงงานเดิมของผู้ใช้ครบ และดำเนินชุดถัดไปต่อทันที

ตัวอย่างโครงสร้างข้อความ ให้ปรับตาม diff จริง:

```text
feat(wheel): add daily attendance and atomic spin allocation

Tasks: 1–6; repository: conference-api.

Describe the implemented behavior and preserved compatibility.
Record the actual test commands, outcomes and relevant evidence.
State any material limitations without claiming unrun checks passed.
```

ใช้ body file เมื่อเรียก Git ผ่าน shell เพื่อรักษาขึ้นบรรทัดและอักขระตามจริง ห้ามใส่ secret ลง commit message

ห้าม push, amend, reset history หรือ force operation หากการแก้ปัญหา integration ใน Task หลังต้องแตะงานที่ commit แล้ว ให้รวม correction ที่อยู่ในแผนไว้ในชุดปัจจุบัน พร้อมอ้างอิง Task ต้นเหตุและทดสอบผลกระทบซ้ำ ไม่แก้ประวัติ commit เก่า

## 8. เมื่อมี conflict หรือจำเป็นต้องยืนยัน

หยุดงาน implementation ทันที รักษาไฟล์และหลักฐานที่ทำไว้ ไม่ดำเนินทางเลือกที่ต้องตัดสินใจต่อเอง แล้วแจ้ง:

```text
หยุดที่: Task … / checkbox …
แผนกำหนด: …
พบจริง: …
หลักฐาน: ไฟล์/ตำแหน่ง/คำสั่ง/error …
ผลกระทบ: …
ทางเลือกที่ทำได้: …
ต้องการให้ยืนยัน: …
งานที่ทำและตรวจผ่านแล้ว: …
```

รวมประเด็นที่รู้แล้วในขณะนั้นให้ผู้ใช้ตอบครั้งเดียว ระบุคำถามให้ตัดสินใจได้ หากข้อจำกัดมาจาก AGENTS.md, skill หรือระบบอนุมัติ ให้บอกแหล่งและเหตุผลอย่างตรงไปตรงมา ไม่อ้างว่าเป็นข้อบังคับของผู้ใช้เอง

หลังได้รับคำตอบจึงปรับเอกสารหรือวิธีดำเนินงานเท่าที่ได้รับอนุมัติ บันทึก decision แล้วกลับเข้ากระบวนการ Task/test เดิม ไม่มีการตอบหรือเวลาผ่านไปไม่ถือเป็นการอนุมัติ

## 9. ทดสอบภาพรวมทั้งหมดอีกครั้งหลัง Task สุดท้ายผ่าน

เมื่อ Task 1–12 ทุก Task เป็น `PASS` และ dependency ledger ไม่มีรายการค้าง ให้เริ่มรอบ **Final comprehensive verification แยกจากผลตรวจ Task 12** ห้ามเพียงคัดลอกผลเก่ามาเรียกว่า final test รายการที่ได้รับอนุมัติเป็น `DEFERRED_EXTERNAL_ACCEPTANCE` อาจคง `NOT VERIFIED / DEFERRED` และไม่บล็อกรอบ final แต่ต้องตรวจซ้ำว่าไม่มีการอ้างว่า external gate ผ่านจริง

ตรวจและบันทึกอย่างน้อย:

1. **Regression/build:** ชุดทดสอบ attendance/wheel/auth/ticket และ session-grant/invitation ที่เกี่ยวข้อง พร้อม lint/typecheck/production build ของโครงการที่เปลี่ยน ตามคำสั่งที่รองรับจริง
2. **สิทธิ์และเช็คอิน:** login เจ้าของ registration confirmed, Main Session เดิม/QR เดิม, ทุกเส้นทางสแกน, สแกนซ้ำ/พร้อมกัน, วันใหม่, เวลาไทย, ช่วงเวลา session และ session อื่นที่ต้องคงพฤติกรรมเดิม
3. **ประวัติและรายงาน:** backfill UTC ตามหลักฐานจริง, ยกเลิกรายวัน, re-check-in, จำนวนผู้มีสิทธิ์ไม่ถูกคูณ, คนไม่ซ้ำและจำนวนเข้าร่วม, filters/detail/export ตรงกัน
4. **การหมุนและสต็อก:** หนึ่ง account/event/day, หลายบัตรไม่เพิ่มสิทธิ์, โอกาสเท่ากันต่อช่องที่ยังใช้ได้, no-prize ไม่จำกัด, ของจริงหมดทั้งหมดหยุดและไม่หักสิทธิ์, refill, idempotency, stock ไม่ติดลบ และไม่ตัดซ้ำตอนรับของ
5. **Concurrent และ race:** ผู้เล่นพร้อมกัน 100 คน, account เดิมยิงซ้ำ, ของจริงชิ้นสุดท้าย, scan ซ้ำ, stock adjustment/publish/spin แข่งกัน, confirm รับของหลายจุด ตรวจ invariant ด้วยฐานข้อมูลจริง
6. **เผยแพร่และผลที่สำเร็จแล้ว:** edit form ระหว่างเล่น, publish atomic, client เก่าต้องโหลดใหม่โดยไม่เสียสิทธิ์, pause/resume, snapshot ผลสำเร็จไม่เปลี่ยนระหว่าง animation, sold-out อยู่ตำแหน่งเดิมและกลับมาสุ่มหลังเติม
7. **หลักฐานและรับของ:** history หลังปิดหน้า/เปลี่ยนอุปกรณ์, QR/รหัสจริงเฉพาะรางวัล, owner/admin/event authorization, lookup ไม่รับอัตโนมัติ, identity check, confirm ครั้งเดียว, retry คง actor/time เดิม, deadline/extension/correction และไม่มี auto stock/right refund
8. **การเชื่อมต่อ:** response loss หลังบันทึกสำเร็จ, reload, timeout, offline uncertainty, stale data, หมุนค้างระหว่าง animation และตรวจสถานะก่อนส่งของเมื่อไม่ทราบผลการยืนยัน
9. **UI แบบ B:** mobile-first TH/EN, ภาพหน้าจอจริงหลายขนาด, รายชื่อยาว/จำนวนช่องเปลี่ยน, สถานะสำคัญครบ, keyboard/focus/contrast/zoom/reduced motion และไม่ใช้รูป mock เป็นหลักฐานว่าหน้าจอจริงผ่าน
10. **R2 และอุปกรณ์จริง:** สำหรับ local/final evidence ให้ยืนยันว่า R2/image logic และสิทธิ์ที่ทดสอบได้ใน harness ยังผ่าน และบันทึก external staging LINE iOS/Android, real camera scan, rotation interruption/slow-network และ actual staging R2 upload/history persistence เป็น `NOT VERIFIED / DEFERRED_EXTERNAL_ACCEPTANCE` ตาม amendment วันที่ 2026-10-03 จนกว่าจะมีการทดสอบจริง การ mock storage ไม่เท่ากับตรวจ R2 จริง และห้ามรายงาน external checks เหล่านี้ว่า `PASS`
11. **ความพร้อมส่งมอบ:** ตรวจ checklist ทุก Task, requirements coverage, runbook, ข้อมูลลับ/PII ใน diff/หลักฐาน และ Git status ของทั้งสาม repository

หากพบ bug ที่แก้ได้ในแผน ให้แก้ รัน checks ของ Task ที่ได้รับผลกระทบและ regression ที่เกี่ยวข้อง แล้วรันทดสอบภาพรวมที่จำเป็นซ้ำบนโค้ดสุดท้ายจนผ่านครบ หากต้องออกนอกแผนหรือขาดสิ่งจำเป็นให้หยุดตามข้อ 8

เมื่อผ่านแล้วจึง commit ชุดสุดท้ายตามข้อ 7 ไม่ deploy ไม่ใช้ production data และไม่ push

## 10. ข้อกำหนดที่ต้องรักษาตลอดงาน

- ใช้ PRIS login เดิมเหมือน ticket; เปิดจาก LINE OA ไม่เพิ่มระบบบัญชีใหม่
- Main Session เดิมเพียงรายการเดียวทั้งงาน บัตร/QR/สิทธิ์เดิมยังใช้ได้ ไม่สร้าง session หรือสิทธิ์ใหม่รายวันให้ผู้ซื้อเดิม
- ประวัติเช็คอินสร้างเมื่อสแกนจริง อ้างอิงสิทธิ์เดิม เก็บผู้สแกนและการยกเลิก หนึ่ง active check-in ต่อสิทธิ์/session/วันไทย บังคับด้วยฐานข้อมูล
- หนึ่งสิทธิ์หมุนต่อบัญชี/event/วันไทยตาม server ต้องมี check-in วันนี้และอยู่ในเวลา Main Session; start รวมเวลาเริ่ม, end ไม่รวมเวลาสิ้นสุด ไม่มีเงื่อนไขรอ 24 ชั่วโมงหรือ reset cron
- ใช้ server เป็นผู้สุ่มและบันทึกผล ไม่ให้ animation หรือ client เลือกรางวัล สต็กลดพร้อมการบันทึกผลสำเร็จเพียงครั้งเดียว
- no-prize เป็นช่องแยกที่มีโอกาสเท่ากัน ไม่จำกัดจำนวนและใช้สิทธิ์วันนี้ เมื่อของจริงหมดทั้งหมดให้หยุด แม้ยังมี no-prize
- สต็อกกองเดียวทั้งงาน ปรับเพิ่ม/ลดพร้อมเหตุผลและ audit; ไม่ overwrite remaining โดยตรง ไม่คืนอัตโนมัติเมื่อยกเลิกเช็คอินหรือไม่มารับของ
- ช่องหมดเป็นสีเทา มีข้อความ และโอกาส 0% คงตำแหน่งเดิม; เติมแล้วกลับเข้าสุ่มครั้งถัดไป ผลที่สำเร็จแล้วไม่เปลี่ยน
- publish ทั้งชุดพร้อมกัน และ stock adjustment ทำทันทีแยกกัน; stale client ไม่เสียสิทธิ์; pause แยกปุ่ม
- จัดการวงล้อและรับรางวัลเป็น admin ในระยะแรก; เจ้าหน้าที่เช็คอินเดิมคงขอบเขตที่มี ไม่ขยายสิทธิ์โดยปริยาย
- QR คงที่ต่อรางวัลเป็น token ที่คาดเดายาก มีรหัสค้นหา; อ่านข้อมูลจริงจาก server; ยืนยันตัวผู้รับและกดรับอย่างชัดเจน ไม่รับจากการสแกนทันที ไม่ offline ไม่เพิ่ม OTP/dynamic QR
- จำกัดการรับซ้ำด้วยฐานข้อมูลและ idempotency; deadline/จุดรับต้องกำหนดจริง; correction เก็บประวัติและไม่คืนสต็อกหรือสิทธิ์หมุนเอง
- R2 ใช้เฉพาะรูปวงล้อ ไม่ย้ายไฟล์ Drive ส่วนอื่น ไม่ provision production หรือเปิดเผย credentials
- คงแบบ B และแบรนด์เดิม รองรับ TH/EN; ไม่เปลี่ยนเป็นแบบ A/C และไม่แต่งข้อมูลรางวัล/สถานที่/กำหนดเวลาจริงขึ้นมา
- ทดสอบรองรับประมาณ 500 ผู้เล่นตลอดงาน และ 100 พร้อมกันตามแผน ไม่สร้างโครงสร้างเผื่อ scale ที่ไม่ได้ร้องขอ

## 11. การสื่อสารและเงื่อนไขจบงาน

แจ้งความคืบหน้าในแชทแบบ caveman โดยยังอ่านรู้เรื่อง: Task ปัจจุบัน, สิ่งที่ผ่าน, blocker/dependency ที่พบ และสิ่งที่จะทำต่อ ไม่รายงานว่าเสร็จเมื่อเพียงเขียนโค้ดหรือ build ผ่านอย่างเดียว

ตอนจบสรุปสั้นแต่ตรวจสอบได้:

- Task ที่ผ่าน และผล final comprehensive verification พร้อมลิงก์หลักฐาน
- Commit แต่ละ repository: task batch, SHA, title และที่อ่าน body ได้
- ข้อจำกัดหรือรายการที่ยังตรวจไม่ได้ หากมีต้องแจ้งว่างานยังไม่ผ่านทั้งหมด
- ยืนยันว่า **ยังไม่ได้ push** และไม่ได้ deploy/เปลี่ยน production

เริ่มดำเนินการตาม Task 1 ได้เลยหลังอ่านเอกสารและตรวจสภาพครบ ไม่ขออนุมัติแผนหรือแบบ B ซ้ำ ทำต่อจนจบ เว้นแต่เข้ากติกาหยุดที่ระบุไว้ข้างต้น
