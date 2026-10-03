# Prompt เสริมสำหรับ PRIS2026 Lucky Wheel — Durable Continuous Execution / Scheduled Continuation

ไฟล์นี้เป็น **prompt เสริมด้าน execution continuity** สำหรับใช้ร่วมกับ prompt หลัก:

`D:/confer/confer/conference/Pris2026/docs/superpowers/plans/2026-10-03-lucky-wheel-implementation-prompt.md`

ห้ามใช้ไฟล์นี้แทน prompt หลัก และห้ามตีความว่าไฟล์นี้อนุมัติการเปลี่ยน scope, business rule, UI แบบ B, acceptance criteria, migration, test expectation, commit policy, push/deploy หรือ production behavior เพิ่มเติม

---

## 1. ลำดับอำนาจและวิธีใช้

ให้อ่านและยึดเอกสารตามลำดับนี้ก่อนเริ่มงาน:

1. Prompt หลัก:
   `D:/confer/confer/conference/Pris2026/docs/superpowers/plans/2026-10-03-lucky-wheel-implementation-prompt.md`
2. Prompt เสริม continuity ฉบับนี้
3. เอกสาร Design / Plan / Surface brief / Visual options / AGENTS.md / repository instructions ที่ prompt หลักระบุ

กติกาการตีความ:

- **Prompt หลักเป็น authoritative สำหรับ scope, business rules, Task 1–12, tests, acceptance, commit policy, stop conditions และข้อห้ามทั้งหมด**
- **Prompt เสริมฉบับนี้เป็น authoritative เฉพาะวิธีรักษาความต่อเนื่องของ execution** ได้แก่ durable goal, lease ownership, checkpoint, background task tracking, scheduled continuation, stale recovery และ terminal cleanup
- หากสองไฟล์ดูเหมือนขัดกันในเรื่อง implementation ให้ยึด prompt หลัก
- หาก prompt หลักสั่งให้หยุดถามเพราะเป็น conflict / user-decision blocker ให้หยุด implementation ตามนั้น Prompt เสริมนี้ห้ามใช้ scheduler หรือ recovery เพื่อข้ามการตัดสินใจของผู้ใช้
- การที่ chat session จบ, client reconnect, worker เปลี่ยน, task observation ชั่วคราวล้ม, หรือไม่มีข้อความใหม่จากผู้ใช้ **ไม่ถือเป็น stop condition ของ implementation**
- ห้ามขอให้ผู้ใช้พิมพ์ `continue`, `ทำต่อ`, `ดำเนินการต่อ` เพื่อให้งานที่ยังไม่จบเดินต่อ

Design และ Plan ของ Lucky Wheel ได้รับการอนุมัติแล้วตาม prompt หลัก จึงให้ใช้ brainstorming เป็น **scope/assumption/failure analysis guard** ตาม prompt หลัก ไม่เปิด design approval ใหม่และไม่ถามยืนยันสิ่งที่เอกสารเดิมอนุมัติไว้แล้วซ้ำ

---

## 2. Durable Goal identity ที่ต้องคงเดิมตลอดงาน

Workspace root:

`D:/confer/confer/conference`

Stable goal key:

`pris2026-lucky-wheel-implementation-2026-10-03`

Objective:

ดำเนิน PRIS2026 Lucky Wheel ตาม prompt หลักและแผนที่อนุมัติ ตั้งแต่ preflight → Task 1–12 → final comprehensive verification → commit/ledger/finalization ให้ถึง verified terminal completion โดยไม่ push, deploy หรือเปลี่ยน production และต้อง recover/resume ได้เมื่อ chat/session/worker เปลี่ยน

ก่อน mutation แรกของงาน implementation ให้ใช้ durable goal runtime ของ InwJud โดย:

1. resolve/reuse workspace identity จริงของ `D:/confer/confer/conference`; ห้าม invent workspace ID
2. เรียก `run_goal` ด้วย stable `goalKey` ด้านบน
3. ใช้ `scheduledContinuation:auto`
4. ใช้ normal worker lease ตาม contract ปัจจุบัน; ค่า default 600 วินาทีเหมาะสม เว้นแต่ runtime contract เปลี่ยน
5. หาก goal เดิมมีอยู่และ active ให้ **resume goal เดิม** ห้ามสร้าง goal ใหม่เพียงเพราะ session หรือ worker เปลี่ยน
6. หาก goal เดิม terminal แล้ว ห้ามเปิด goal ใหม่ด้วย key อื่นเพื่อทำงานเดิมต่อโดยพลการ ต้องตรวจเหตุผลและสถานะก่อน
7. เก็บ lease token / lease generation เป็นข้อมูลภายใน ห้ามแสดงในแชท, commit, evidence file หรือ Scheduled Task prompt

ใช้ durable plan steps สำหรับการกู้สถานะดังนี้ โดยไม่เปลี่ยน Task plan จริง:

- `PREFLIGHT` — อ่านเอกสาร, ตรวจ 3 repositories, baseline/diff/runtime/test guards, acceptance ledger
- `T01` — Task 1
- `T02` — Task 2
- `T03` — Task 3
- `T04` — Task 4
- `T05` — Task 5
- `T06` — Task 6
- `T07` — Task 7
- `T08` — Task 8
- `T09` — Task 9
- `T10` — Task 10
- `T11` — Task 11
- `T12` — Task 12
- `FINAL_VERIFY` — Final comprehensive verification ตามข้อ 9 ของ prompt หลัก
- `FINALIZE` — commit/ledger check, scheduled watchdog cleanup, durable goal terminalization และ final report

ขั้น `FINALIZE` เป็น execution lifecycle เท่านั้น ไม่อนุญาต feature/refactor/deploy เพิ่ม

### 2.1 Persistent Local PostgreSQL test container — สร้างครั้งเดียวและเก็บไว้จนกว่าจะมีคำสั่งลบ

ก่อนเริ่ม Task 1, ก่อนรัน integration test ใด ๆ และก่อนทำ database mutation สำหรับ Lucky Wheel ให้เตรียม **Local Docker PostgreSQL test environment เพียงหนึ่ง container** สำหรับ goal นี้ แล้ว reuse container เดิมตลอด Task 1–12 และ Final Comprehensive Verification

ลำดับที่ต้องทำ:

1. acquire/resume durable goal ด้วย `run_goal` ก่อน เพื่อให้ creation มี ownership ที่ผูกกับ goal นี้
2. ตรวจ Docker engine และ inspect containers/volumes ที่มีอยู่ก่อน ห้ามลบหรือ reuse environment ที่ ownership ไม่ชัดเจน
3. ใช้ container identity คงที่:
   - container: `pris2026-lucky-wheel-postgres-test-20261003`
   - volume: `pris2026-lucky-wheel-postgres-test-data-20261003`
   - ownership label ถ้า Docker runtime รองรับ: `lnwjud.goal=pris2026-lucky-wheel-implementation-2026-10-03`
4. หาก exact container นี้มีอยู่แล้วจาก goal เดิม:
   - inspect name/label/image/volume/port/health ก่อน
   - หาก identity ตรง ให้ **reuse**
   - หาก stopped ให้ start container เดิม
   - ห้ามสร้าง container ตัวที่สอง
5. หาก exact container ยังไม่มี:
   - เลือก PostgreSQL major version ที่สอดคล้องกับ repository/dev/test environment จริงหลังตรวจ config ที่เกี่ยวข้อง; ห้ามเดา version เมื่อโครงการระบุไว้แล้ว
   - สร้าง container เดียวพร้อม named volume ด้านบน
   - bind host port เฉพาะ `127.0.0.1` และเลือก port ว่างหลังตรวจ Docker bindings จริง; ห้ามชน service เดิม
   - ใช้ credentials สำหรับ local test เท่านั้น เก็บใน local execution environment; ห้ามแสดง password/secret ในแชท, commit, acceptance evidence หรือ Scheduled Task prompt
6. รอจน PostgreSQL healthy/พร้อมรับ connection จริงก่อนเริ่ม database tests
7. บันทึกเฉพาะข้อมูลที่ไม่ลับลง checkpoint และ `acceptance.md`:
   - container name
   - container ID แบบย่อหรือ ownership proof ที่เหมาะสม
   - image/version
   - loopback host/port
   - volume name
   - health/readiness
   - database names ที่สร้างภายใน instance
   - วันที่/Task ที่สร้างหรือ reuse
   ห้ามบันทึก password หรือ connection string ที่มี secret
8. test suite ต่าง ๆ สามารถสร้าง **dedicated test databases หลาย database ภายใน PostgreSQL container เดิม** ได้ตามแผน เช่น integration database แยกตาม module/suite แต่ห้ามสร้าง PostgreSQL container เพิ่มเพียงเพื่อแยก Task
9. database/schema/fixture ที่ใช้ต้องเป็น test-owned เท่านั้น ห้าม copy production data, ห้ามใช้ production/runtime database และห้ามชี้ `TEST_DATABASE_URL` ไปยังฐานใช้งานจริง
10. ใช้ test database guard เดิมของ repository ทุกครั้งที่ destructive reset/cleanup ต้องเกิด
11. การ reset/drop database ภายใน container ทำได้เฉพาะ database ที่พิสูจน์ว่าเป็น test-owned และเมื่อ test lifecycle ต้องการจริง; **ห้ามลบ/recreate container หรือ named volume เพื่อแก้ test failure**
12. เมื่อ session/worker เปลี่ยน ให้ recover โดย inspect exact container เดิมก่อน แล้ว reuse ต่อจาก state เดิม
13. หาก container เดิมหายไปหลังจากเคยบันทึกว่าสร้างสำเร็จแล้ว:
   - ห้ามสร้าง replacement แบบเงียบ ๆ
   - ตรวจ Docker state/recovery evidence ก่อน
   - checkpoint ว่า test-environment continuity สูญหาย
   - ถ้าพิสูจน์ไม่ได้ว่าการสร้างใหม่ปลอดภัยและไม่ทำให้หลักฐานเดิมคลาดเคลื่อน ให้ถือเป็น blocker ที่ต้องแจ้งผู้ใช้
14. container นี้เป็น **retained test infrastructure** ของ Lucky Wheel goal:
   - ถ้าต้อง track เป็น supporting service ให้ใช้ `role:supporting_service`
   - ใช้ `cancelWithGoal:false`
   - ห้าม cleanup พร้อม ordinary checkpoint
   - ห้าม cleanup เมื่อ Task 12 ผ่าน
   - ห้าม cleanup เมื่อ Final Comprehensive Verification ผ่าน
   - ห้าม cleanup เมื่อ Scheduled Continuation ถูกยกเลิก
   - ห้าม cleanup เมื่อ durable goal ถูก `finish_goal(status:completed)`
   - ห้าม cleanup เมื่อ goal ถูกหยุด/ยกเลิก เว้นแต่ผู้ใช้สั่งลบ test environment โดยชัดแจ้ง
15. **คำว่า FINAL, completed, cancelled, abandoned, cleanup หรือ terminal goal ไม่ถือเป็นคำสั่งลบ Docker test environment นี้**
16. ลบ container/volume นี้ได้เฉพาะเมื่อผู้ใช้มีคำสั่งใหม่ที่ระบุให้ลบ Lucky Wheel local Docker test environment โดยตรง
17. เมื่อได้รับคำสั่งลบ:
   - verify exact container identity/label/volume/ownership ก่อน
   - ตรวจว่าไม่มี goal/task ที่ยังใช้งาน environment นี้
   - ลบเฉพาะ container และ volume ที่สร้างสำหรับ Lucky Wheel goal นี้
   - ห้ามแตะ container/volume/database อื่น
   - บันทึก cleanup evidence ตามจริง

ดังนั้น lifecycle ที่ต้องการคือ:

`create once → reuse across all tasks/sessions → keep after FINAL → delete only on explicit later user command`


---

## 3. Mapping สถานะจาก prompt หลักเข้าสู่ Durable Goal

สถานะใน prompt หลักยังเป็น source of truth ทาง acceptance:

- `PENDING`
- `RUNNING`
- `DEFERRED_DEPENDENCY`
- `PASS`
- `BLOCKED`

เมื่อต้องบันทึกเข้า durable step ซึ่งรองรับเพียง `pending / in_progress / completed / blocked` ให้ map ดังนี้:

| Prompt หลัก | Durable step | กติกา |
| --- | --- | --- |
| PENDING | pending | ยังไม่เริ่ม |
| RUNNING | in_progress | มีงานหรือ verification ค้าง |
| DEFERRED_DEPENDENCY | in_progress | ห้าม mark completed; บันทึก dependency และ return condition |
| PASS | completed | ใช้ได้เฉพาะเมื่อ required checks ผ่านจริงครบ |
| BLOCKED | blocked | มี blocker ตาม prompt หลัก; ห้ามทำ workaround |

ห้ามใช้ durable step `completed` เพื่อกลบ `DEFERRED_DEPENDENCY`, skipped test, unverified environment หรือ pending final verification

`Pris2026/docs/superpowers/verification/lucky-wheel/acceptance.md` เป็น human-readable evidence ledger และต้องอัปเดตตาม prompt หลัก แต่ **durable goal/checkpoint เป็น authoritative continuation state** สำหรับ lease, next action และ tracked background work

---

## 4. Checkpoint protocol ที่ต้องทำให้ recover ได้จริง

สร้าง checkpoint เมื่อมี meaningful milestone เช่น:

- preflight เสร็จ
- Task เปลี่ยนสถานะ
- ก่อน/หลัง long-running blocking job
- พบและแก้ root cause สำคัญ
- เกิด deferred dependency
- ก่อน commit batch
- หลัง commit batch
- final verification เปลี่ยนสถานะ
- ก่อน actual turn boundary
- ก่อนหยุดเพราะ user-decision blocker
- ก่อน terminal cleanup

checkpoint ทุกครั้งต้องบันทึกอย่างน้อย:

1. `currentPhase`
2. step statuses ที่เปลี่ยน
3. summary ที่บอกว่า **ทำอะไรจริงแล้ว**
4. `nextAction` ที่ executable และเฉพาะเจาะจง
5. `blockers`
6. evidence paths / commit SHA / exact task IDs / concise verified results ตามที่เหมาะสม
7. `trackedTasks` สำหรับ background work ที่ยังเกี่ยวข้อง
8. สิ่งที่ห้ามทำซ้ำ เช่น migration ที่ apply แล้ว, commit ที่เกิดแล้ว, test fixture ที่ยังมีอยู่, external operation ที่ผลลัพธ์ยังไม่แน่นอน

reconstruction-grade context ต้องครอบคลุม:

- repository และ branch ที่เกี่ยวข้อง
- files changed สำคัญ
- exact commands ที่รัน
- passed / failed / running
- exit code เมื่อมี
- root cause และ fix ที่ทำแล้ว
- failed attempts ที่ไม่ควรลองซ้ำ
- deferred dependencies
- pending validation
- commit ledger / SHA ที่เกิดแล้ว
- DB/migration/schema state ที่พิสูจน์แล้ว
- background tasks/services ที่ยัง live
- next exact action

หาก schema ปัจจุบันของ `checkpoint_goal` expose field เช่น `resumeContext` ให้ใช้ตาม skill/runtime contract ปัจจุบัน

หาก schema ปัจจุบัน **ไม่ expose field นั้น**:
- ห้าม invent field
- ให้เก็บ reconstruction-grade details ใน `acceptance.md` และใช้ `summary / nextAction / blockers / evidence / trackedTasks` เท่าที่ schema รองรับ
- durable state กับ acceptance ledger ต้องชี้กันได้และไม่ขัดกัน

checkpoint ปกติ **ไม่ใช่เหตุผลให้หยุด turn และไม่ใช่ handoff**
- ใช้ lease เดิมต่อ
- `releaseLease:false` หรือไม่ระบุ ตาม contract
- checkpoint แล้วต้องกลับเข้า Active Coordinator Loop ตามข้อ 5.8 ทันที
- การ checkpoint ว่า task กำลังรัน, task เพิ่ง terminal, Task เพิ่ง PASS, commit เพิ่งสำเร็จ หรือ nextAction เปลี่ยน **ไม่อนุญาตให้จบ turn เพียงเพราะบันทึก state สำเร็จ**
- ถ้า checkpoint มี tracked task ที่ terminal แล้วแต่ยังไม่ได้ `RESULT_INSPECTED` ต้อง consume ผลนั้นก่อน user-visible final/progress reply ที่จะทำให้ turn จบ
- ถ้า checkpoint ทำให้ Task ปัจจุบัน PASS และมี Task/nextAction ถัดไปที่ไม่ blocked ต้องเริ่มขั้นถัดไปใน turn เดิม

ใช้ `releaseLease:true` เฉพาะ checkpoint สุดท้ายก่อน actual turn boundary ที่หลีกเลี่ยงไม่ได้ และหลังยืนยันทั้งหมดต่อไปนี้:
1. ไม่มี terminal tracked task ที่ยังไม่ได้ inspect/disposition
2. task ที่ยัง running เป็น goal-bound durable task หรือ external target ที่ recover ได้จริง
3. ไม่มี safe useful parallel work เหลือ
4. nextAction ถูกบันทึกแบบ executable
5. scheduled continuation coverage ถูกยืนยันตามจริง

หลัง release lease ห้าม mutation เพิ่มใน turn เดิม

---

## 5. Background task policy

งานที่ใช้เวลานาน หรือผลของงานนั้นต้อง survive ข้าม ChatGPT turn / session / scheduled wake เช่น:

- test suite
- build
- typecheck/lint
- Docker integration/E2E
- load/concurrency test
- migration verification
- CI watcher
- long-running validation command
- script ที่ผลลัพธ์เป็น acceptance gate

ต้องใช้ **goal-bound durable task** เป็นค่าเริ่มต้น ห้ามพึ่ง session-bound process handle เป็น continuation primitive

### 5.1 Tool selection — บังคับใช้ตามอายุงาน

#### A. งานที่อาจข้าม turn/session หรือผลเป็น acceptance gate

ให้ใช้ `task_create` เป็นหลัก โดยผูกกับ durable goal ด้วย `goalId` หรือ `goalLease` ของ worker ปัจจุบัน

ข้อกำหนด:

1. ระบุ `workspaceId`, executable/arguments, cwd และ timeout ให้ชัด
2. ผูก task กับ goal เดิม ไม่สร้าง standalone task ถ้างานเป็นส่วนหนึ่งของ Lucky Wheel acceptance
3. เมื่อ task ถูกสร้าง ให้บันทึก task ID ทันที
4. track ใน checkpoint เป็น:
   - provider: `shell`
   - role: `blocking_job`
   - `cancelWithGoal:true`
5. ใช้ `task_status` / `task_result` สำหรับ durable observation
6. ห้ามใช้ `process_start` สำหรับ test/build/typecheck/lint/load/verification ที่อาจต้องอ่านผลหลัง session เปลี่ยน
7. ห้ามใช้ ordinary `shell run` เป็น task ที่จะ handoff ข้าม session หาก runtime ของ shell task ผูก ownershipกับ client session
8. ถ้า repository ย่อยถูก register เป็น workspace แยก แต่ durable goal อยู่ที่ workspace root:
   - ให้ `task_create` ใช้ workspaceId/cwd ของ durable-goal root เพื่อรักษา goal ownership
   - target child repository ภายใน command อย่างชัดเจน เช่น wrapper `cmd /c "cd /d <child-repo> && <command>"`, หรือวิธีเทียบเท่าที่ไม่เปลี่ยน durable workspace identity
   - ห้ามเปลี่ยน `workspaceId` ของ durable task ไปเป็น child workspace ถ้า goal ไม่ได้เป็นเจ้าของ child workspace นั้น
   - หลังใช้ wrapper ต้องยืนยันว่า command รันจาก child repository จริง และ tool/project config เช่น tsconfig/package.json ถูก resolve ถูกตำแหน่ง
9. บน Windows ถ้า durable wrapper ใช้ PowerShell เพื่อเรียก Node package tools:
   - prefer `npm.cmd` / `npx.cmd` หรือใช้ `cmd.exe` wrapper เพื่อไม่ให้ PowerShell ExecutionPolicy เลือก `npm.ps1` / `npx.ps1` แล้วถูก block
   - wrapper ต้อง propagate launcher/child exit code อย่างถูกต้อง
   - ถ้า stderr มี launcher error เช่น `PSSecurityException`, executable-not-found หรือ command-not-started แม้ outer process exit 0 ให้ classify เป็น `COMMAND_WIRING_FAILURE` ไม่ใช่ PASS
   - acceptance evidence ต้องยืนยันว่า target command เริ่มทำงานจริง ไม่ใช่ดู exit code อย่างเดียว
10. หากเลือก ordinary shell/process สำหรับคำสั่งสั้น ต้องอ่าน terminal result ให้จบใน turn เดิม และต้องไม่ checkpoint handle นั้นเป็น cross-session blocking job

#### B. งานสั้นที่จบแน่นอนใน turn เดิม

ordinary shell/process ใช้ได้เฉพาะเมื่อ:

- เป็น read-only หรือผลข้างเคียงเข้าใจได้
- worker สามารถ wait จน terminal
- terminal result ถูก inspect ก่อน checkpoint/handoff
- ไม่มีความจำเป็นต้อง reattach จาก scheduled wake

ถ้า command ยังไม่ terminal ตอน host turn ใกล้จบ ให้ถือว่าการเลือก tool ผิดสำหรับ continuation และต้องไม่ปล่อย session-bound handle ค้างเป็น durable dependency

#### C. Long-lived supporting service

เช่น local API/dev server ที่ต้องอยู่หลาย turn:

- ถ้าต้อง survive session ให้ใช้ goal-bound durable mechanism ที่ reattach ได้ หรือใช้ external identity ที่ตรวจ state ได้โดยไม่พึ่ง client session เช่น Docker container ที่มีชื่อ/label คงที่
- ห้ามใช้ process handle ที่ query ได้เฉพาะ session เดิมเป็น source of truth
- retained PostgreSQL container ตามข้อ 2.1 ใช้ Docker identity เป็น authoritative state ไม่ใช้ process handle

### 5.2 Blocking jobs

งานที่ผลลัพธ์ต้องรู้ก่อน Task จะผ่าน ให้ track เป็น:

- `role: blocking_job`
- provider ให้ตรงกับ runtime จริง
- สำหรับ `task_create` local shell runtime ให้ใช้ provider `shell`
- `cancelWithGoal:true` สำหรับ goal-owned verification jobs

ตัวอย่าง:

- integration test
- load test
- exact CI watcher
- migration verification
- typecheck/build/lint ที่เป็น acceptance gate
- browser/E2E runner ที่ผลต้องตรวจจริง

### 5.3 Supporting services

service ที่ต้องเปิดเพื่อให้ test ทำงาน เช่น local API, test frontend, PostgreSQL/Mongo/Redis test service ให้ track เป็น:

- `role: supporting_service`

ตั้ง `cancelWithGoal` ตาม ownership จริง:

- `true` เฉพาะ service/test environment ที่สร้างเพื่อ Lucky Wheel goal นี้และได้รับอนุญาตให้ cleanup พร้อม goal จริง ๆ
- `false` สำหรับ shared dev service หรือ service เดิมของผู้ใช้ที่ไม่ควรถูกปิด
- **ข้อยกเว้นบังคับ:** `pris2026-lucky-wheel-postgres-test-20261003` เป็น retained test infrastructure ตามข้อ 2.1 และต้องใช้ `cancelWithGoal:false` แม้จะถูกสร้างเพื่อ goal นี้โดยเฉพาะ

ห้ามหยุด container/process จากชื่อหรือ port อย่างเดียว ต้องพิสูจน์ ownership ก่อน

### 5.4 Durable task state machine

ทุก blocking verification task ต้องเดินตาม state นี้:

`CREATED → RUNNING → TERMINAL_OBSERVED → RESULT_INSPECTED → DISPOSITIONED`

ความหมาย:

- **CREATED**: runtime คืน durable task ID แล้ว
- **RUNNING**: `task_status` ยืนยันว่ากำลังทำงาน
- **TERMINAL_OBSERVED**: runtime ยืนยัน completed/failed/cancelled/timeout
- **RESULT_INSPECTED**: อ่าน exit code + stdout/stderr/log ที่จำเป็นครบ
- **DISPOSITIONED**:
  - PASS → ใช้เป็น acceptance evidence ได้
  - FAIL → trace root cause / repair / rerun
  - CANCELLED/TIMEOUT → ประเมิน side effect และ rerun เฉพาะเมื่อปลอดภัย
  - UNKNOWN → ห้ามนับผลและเข้าสู่ ownership recovery

กฎ:

1. process/task ถูกสร้างสำเร็จ ≠ PASS
2. `RUNNING` ≠ PASS
3. terminal โดยยังไม่อ่าน result ≠ PASS
4. exit code 0 แต่ไม่ได้ตรวจว่าเป็น command/target ที่ถูกต้อง ≠ PASS
5. ต้องเก็บ exact command/cwd/target และ concise outcome ใน evidence หรือ acceptance ledger
6. เอา task ออกจาก `trackedTasks` ได้เมื่อ:
   - RESULT_INSPECTED และ disposition ชัดเจน หรือ
   - พิสูจน์ว่า stale/orphan และใช้ recovery rule ข้อ 8.1 จัดการแล้ว
7. ห้ามทิ้ง task ที่ state unknown ไว้เป็น blocking job แบบไม่มีกำหนด

### 5.5 Observation policy

หลัง `task_create`:

1. ตรวจ `task_status` อย่างน้อยหนึ่งครั้งเพื่อยืนยัน runtime ownership/readability
2. ระหว่าง running ใช้ bounded observation ไม่ tight-poll
3. ถ้า command ควรจบเร็ว ให้ observe ต่อใน turn เดิม
4. เมื่อ terminal ให้เรียก `task_result` ทันที
5. ถ้า result fail ให้ตรวจ stderr/stdout ของ exact task เดิมก่อนแก้ code
6. ถ้า task observation เกิด transient transport error:
   - retry bounded ใน turn เดิม
   - re-read durable goal/recovery state
   - ห้ามสร้าง duplicate task เพียงเพราะ observation ครั้งเดียว fail

### 5.6 Duplicate prevention

ก่อนสร้าง verification task ใหม่:

1. อ่าน checkpoint ล่าสุด
2. ตรวจ `trackedTasks`
3. ตรวจ durable task runtime ที่ current worker เข้าถึงได้
4. เปรียบเทียบ semantic identity:
   - command
   - cwd
   - target suite/build
   - Task/verification gate
5. ถ้ามี task เดิม live และอ่านได้ ให้ reuse
6. ถ้ามี task เดิม terminal ให้ inspect result ก่อนสร้างใหม่
7. ถ้ามี task เดิม inaccessible ด้วย ownership error ให้ใช้ข้อ 8.1 ห้าม blind duplicate

### 5.7 กติกาบังคับทั่วไป

- task fail ให้ trace exact failure แล้วแก้ root cause ใน scope จากนั้น rerun ตาม prompt หลัก
- ก่อน spawn งานเดิม ให้ตรวจ tracked tasks/processes เดิมก่อนเสมอ
- ถ้า blocking job ยังทำงาน ให้ทำงานอื่นที่ไม่ conflict ก่อน
- ถ้าไม่มี parallel work ให้ bounded-wait/observe ใน turn เดิมตามสมควร
- ห้ามโยนงานให้ hourly watchdog ทั้งที่ task ใกล้จบและยังตรวจต่อใน turn เดิมได้
- เมื่อ blocking job terminal ให้ inspect result และดำเนิน success/failure path ใน turn เดิมถ้ายังทำได้
- ห้าม checkpoint session-bound `processId` เป็นหลักฐานว่า scheduled worker รอบหน้าจะ reattach ได้
- ห้ามถือ ChatGPT timeout เป็น task cancellation
- ห้ามถือ ownership error เป็น proof ว่า command fail หรือ success

### 5.8 Active Coordinator / Post-task Continuation Loop — กติกาหลักของ worker ที่ยังมีชีวิต

ตราบใดที่ worker ปัจจุบันยังถือ lease ที่ถูกต้องและ host turn ยังเปิดอยู่ ให้ worker ทำหน้าที่เป็น **active coordinator** ไม่ใช่เพียง launcher ของ background task

ให้วน state-machine ต่อไปนี้โดยไม่กำหนดจำนวนรอบตายตัว:

#### Phase A — Reconcile authoritative state

1. อ่าน durable goal/checkpoint ล่าสุดเมื่อเริ่ม worker/wake หรือหลัง recovery
2. ตรวจ `trackedTasks`, `activeTaskIds`, blockers, currentPhase และ nextAction
3. reconcile Git/DB/Docker/external state เฉพาะส่วนที่จำเป็น
4. terminal tracked task มี priority สูงกว่า nextAction ใหม่ เพราะผลของมันอาจเปลี่ยน state/nextAction

#### Phase B — Drain terminal task queue ก่อน

สำหรับ tracked task ทุกตัว:

- ถ้า `running` → เก็บไว้และไปพิจารณา parallel work
- ถ้า terminal → เรียก `task_result` ทันที
- validate ว่า target command เริ่มจริง, cwd/target ถูกต้อง, exit code/log ไม่ใช่ wrapper false-positive
- classify เป็น PASS / FAIL / CANCELLED / TIMEOUT / UNKNOWN
- update evidence/acceptance ตามจริง
- เอาออกจาก active/tracked blocking set เมื่อ RESULT_INSPECTED + disposition ชัดเจน
- ถ้ามี terminal หลายตัว ให้ **drain ให้ครบทุกตัว** ก่อนจบ coordinator iteration

ห้ามปล่อย terminal task ค้างใน `activeTaskIds` เพียงเพื่อให้ watchdog รอบหน้าอ่านซ้ำ

#### Phase C — Advance durable state

หลัง consume ผล:

1. ถ้า verification PASS และ acceptance ของ Task ครบ → update `acceptance.md` → mark Task PASS/completed
2. ถ้า Prompt 1 ต้องมี commit boundary → ทำ commit/ledger verification ตาม Prompt 1 แล้วถือ commit เป็น work ต่อเนื่อง ไม่ใช่ yield boundary
3. resolve deferred dependency ที่ถูกปลดแล้ว
4. คำนวณ nextAction ใหม่จาก Task plan จริง
5. checkpoint milestone ได้ แต่ checkpoint แล้วต้องวนต่อ Phase D

#### Phase D — Execute nextAction ทันที

ถ้า:
- goal ยัง active
- blockers=[]
- มี nextAction
- ownership ปลอดภัย

ให้ execute nextAction ใน **turn/wake เดียวกัน** ทันที

ตัวอย่างบังคับ:
- T04 verification terminal PASS → update acceptance → T04 PASS → commit ถ้า plan กำหนด → เริ่ม T05
- RED test fail ตามคาด → implement minimum fix → rerun test
- build fail ที่แก้ได้ → trace → repair → rerun
- migration verification PASS → ไป acceptance/checklist ถัดไป
- task terminal หลัง checkpoint → consume task → advance state; ห้ามตอบผู้ใช้แล้วรออีก 60 นาที

#### Phase E — เมื่อสร้าง durable blocking task ใหม่

ทันทีหลัง `task_create`:

1. track task ID/role/cancel policy
2. verify readability ด้วย `task_status`
3. checkpoint ได้ถ้าเป็น meaningful milestone แต่ห้ามหยุดเพราะ checkpoint
4. ทำ non-conflicting useful work ก่อน
5. ถ้าไม่มี parallel work ให้ observe/wait แบบ bounded ใน turn เดิม
6. สำหรับ local test/build/lint/typecheck ที่ปกติใช้เวลาหลักวินาทีถึงไม่กี่นาที ให้พยายามรักษา active worker เพื่อ consume terminal result แทนการจบ turn ทันทีหลัง spawn
7. เมื่อ task terminal ระหว่าง turn ให้กลับ Phase B ทันที

#### Phase F — Yield decision

ยอมจบ/yield ได้เฉพาะกรณีใดกรณีหนึ่ง:

1. goal terminal จริง
2. user-decision blocker หรือ external blocker ที่ไม่มี safe useful work
3. มี genuinely long-running durable blocking job ที่ยัง live, ไม่มี useful parallel work เหลือ, checkpoint/coverage พร้อม และการรอต่อใน turn ปัจจุบันไม่สมเหตุผล
4. host บังคับ actual turn boundary
5. scheduled wake พบ live owner จริงและ runtime สั่ง `worker_busy_noop` โดยไม่มี stale-recovery path ใน wake นั้น

**ห้าม yield** เมื่อ:
- tracked task terminal แล้ว
- Task เพิ่ง PASS และมี Task ถัดไป
- nextAction มีอยู่และไม่ blocked
- เพิ่ง checkpoint
- เพิ่ง commit
- เพิ่งสร้าง task ที่คาดว่าจะจบเร็วและยัง observe ต่อได้
- เพียงต้องการส่ง progress update

#### User-visible reply ไม่ใช่ control-flow boundary

- progress prose สามารถส่งได้เฉพาะเมื่อไม่ทำให้ execution หยุด หรือเมื่อถึง yield boundary จริง
- ห้ามจบ scheduled wake ด้วยข้อความประเภท “T04 ผ่านแล้ว ต่อไป T05” ถ้ายังสามารถเริ่ม T05 ใน wake เดียวกัน
- ห้ามใช้ final/progress reply แทนการ execute nextAction
- ก่อน user-visible reply ที่จะจบ turn ให้รัน Yield decision ด้านบนเสมอ

#### ข้อจำกัดที่ต้องรายงานตามจริง

Prompt นี้ **ไม่สามารถสร้าง event-driven callback จาก task completion หลัง worker ตายไปแล้วได้**
ดังนั้น:
- ถ้า worker ยังมีชีวิตตอน task จบ → Active Coordinator ต้อง consume และเดินต่อทันที
- ถ้า host ปิด worker/turn ก่อน task จบ → durable task ยังทำงาน/เก็บผลได้ และ hourly watchdog เป็น recovery fallback
- ห้ามอ้างว่า watchdog รายชั่วโมงคือ instant continuation
- เป้าหมายคือกำจัด idle gap ที่เกิดจาก worker “เลือกหยุดเอง” ทั้งที่ยังทำต่อได้ ไม่ใช่รับประกัน instant wake หลัง host terminate worker

### 5.9 Short-budget Scheduled Wake Strategy — ใช้ทุก scheduled wake โดย default

Scheduled wake ต้องถือว่า host execution window **อาจสั้นและถูกตัดได้ทุกเวลา** แม้ไม่มีสัญญาณเตือนล่วงหน้า จึงต้องจัดลำดับงานให้ recoverable และให้แต่ละ wake สร้างความคืบหน้าจริงมากที่สุด

หลักการคือ:

`claim → refresh canonical prompt/state → drain terminal work → choose smallest acceptance-bearing packet → execute/code → launch durable verification early → checkpoint recoverable state → continue if host still alive`

#### A. Front-load continuity-critical work

หลัง acquire:

1. ห้ามเริ่มด้วย progress prose
2. ห้ามอ่านไฟล์/scan ทั้ง repository แบบกว้างหาก nextAction ระบุขอบเขตอยู่แล้ว
3. ใช้ checkpoint ล่าสุด + exact Task plan เป็น navigation source ก่อน
4. batch read/search เฉพาะไฟล์ที่จำเป็นต่อ next acceptance unit
5. terminal task ที่ค้างต้อง consume ก่อน
6. ถ้ามี verified nextAction ชัดเจน ให้เริ่ม mutation/verification โดยเร็ว แทนการทำ status audit ซ้ำหลายรอบ
7. เมื่อ code unit หนึ่งมี shape พอทดสอบ ให้ launch goal-bound durable verification โดยเร็ว เพื่อให้ process สามารถเดินต่อได้แม้ host ตัด workerภายหลัง

#### B. Work packetization

scheduled wake ห้ามพยายามถือทั้ง Task ใหญ่เป็น atomic unit ให้แตกเป็น **continuation packets** ที่แต่ละ packet มี:

- objective ย่อยหนึ่งข้อ
- exact files/DB surface
- expected RED/GREEN evidence
- deterministic nextAction
- side-effect classification
- checkpoint boundary ที่ recover ได้

ตัวอย่าง T05:

1. packet: schema contract + RED migration tests
2. packet: migration SQL/Drizzle exports
3. packet: strict Zod validation
4. packet: policy/invariant tests
5. packet: integration regression/build
6. packet: acceptance + commit boundary

เมื่อ packet หนึ่งเสร็จ:
- checkpoint milestone ได้
- ถ้า host ยัง active ให้เริ่ม packet ถัดไปทันที
- ห้ามรอ hourly watchdogเพียงเพราะ packet จบ

#### C. Mutation-first, verification-early

สำหรับ coding packet:

1. inspect minimum relevant context
2. เขียน RED test/spec guard ก่อนถ้า Prompt 1 กำหนด TDD
3. implement minimum scoped change
4. spawn durable verification **ทันทีเมื่อ testable**
5. ขณะ verification running ให้ทำ non-conflicting review/documentation/next small prep
6. เมื่อ terminal ให้ consume result ใน wake เดิมถ้ายังมี worker
7. ถ้าถูก host ตัด ผล durable verification ต้องยัง recover ได้ใน wake/manual resume ถัดไป

ห้ามใช้เวลาส่วนใหญ่ของ short wake ไปกับ:
- รายงานสถานะ
- re-read เอกสารเดิมทั้งหมด
- broad grep ที่ไม่สัมพันธ์กับ nextAction
- formatting/rewording evidence ก่อนมี actual progress
- checkpoint ซ้ำโดยไม่มี state change

#### D. Checkpoint placement สำหรับ short wake

ต้อง balance ระหว่าง recoverability กับ overhead:

- checkpoint เมื่อ packet เปลี่ยน durable state อย่างมีนัยสำคัญ
- checkpoint หลัง mutation ชุดสำคัญที่ถ้าหายแล้ว reconstruction ยาก
- checkpointทันทีหลังสร้าง durable task ถ้า task/result เป็น dependency สำคัญและยังไม่มี reconstruction-grade state
- checkpointหลัง consume terminal result + เปลี่ยน nextAction
- ไม่ต้อง checkpoint หลัง read-only lookup ทุกครั้ง
- ห้าม checkpoint ซ้ำด้วย summary เดิมเพื่อซื้อเวลา

ทุก checkpoint ของ scheduled wake ต้องทำให้ worker ถัดไปตอบได้ทันทีว่า:
- ทำอะไรเสร็จจริง
- อะไรยัง unverified
- task ไหน live/terminal
- mutation ไหนห้ามทำซ้ำ
- next exact action คืออะไร

#### E. Host-cut resilience

เพราะไม่มี API รับประกัน remaining turn time:

- อย่ารอ “ใกล้หมดเวลา” ค่อย checkpoint
- อย่าถือว่าจะมีโอกาสส่ง final message เสมอ
- durable state ต้องปลอดภัยหลัง meaningful mutation ทุก packet
- long verification ใช้ durable task
- non-idempotent mutation ต้องมี state/receipt ที่ตรวจย้อนหลังได้
- หาก host ตัดกลาง coding edit ก่อน checkpoint ให้ worker ถัดไป inspect Git diff/file state ก่อนเขียนซ้ำ

#### F. Scheduled-wake priority order

ทุก `recurring_acquired` ให้ใช้ priority นี้:

1. terminal unconsumed durable tasks
2. unsafe/unknown mutation reconciliation
3. Task acceptance ที่พร้อมปิด
4. required commit/ledger boundary
5. current Task smallest actionable packet
6. durable verification launch
7. non-conflicting parallel prep
8. checkpoint
9. next packet

ห้ามใช้ progress reply แทรก priority chain เว้นแต่ถึง Yield decision จริง

### 5.10 Durable delegation strategy — ฝากสิ่งที่ฝากได้ก่อน host ตัด

AI reasoning/editing ไม่สามารถรันเองต่อหลัง host ปิด worker แต่ external/durable execution สามารถอยู่ต่อได้ จึงต้อง delegate งานที่เหมาะสมให้เร็ว:

ใช้ goal-bound durable task สำหรับ:
- tests
- lint
- typecheck
- build
- migration verification
- deterministic scripts
- DB invariant checks
- load/concurrency tests
- exact CI watcher

อย่าใช้ durable task แทนงานที่ต้อง reasoning/edit code โดยตรง

เมื่อ packet มีทั้ง code + verification:
- ทำ code ให้ถึง testable state
- spawn durable verification
- checkpoint exact task ID/command/expected evidence
- ถ้า host ยัง active → observe + continue
- ถ้า host ถูกตัด → task/result พร้อมให้ wake/manual resume ถัดไป consume

หากไม่มี durable work ที่สมเหตุผลให้ spawn:
- checkpoint exact coding state/next edit location
- อย่าสร้าง dummy/sleep/background task เพื่อแสร้งว่ากำลังทำงานต่อ

### 5.11 Manual immediate resume — ไม่ต้องรอ dueAt

ผู้ใช้สามารถสั่ง resume goal เดิมได้ทุกเวลา **ก่อน watchdog dueAt** เพื่อเริ่ม worker ใหม่ทันที

เมื่อได้รับ manual resume:

1. ใช้ stable goalKey เดิม
2. เรียก `run_goal` / recovery ตาม ownership fence
3. ถ้า `retryAfterSeconds <= 60` เพราะ stale grace ให้ bounded wait/retryใน request เดิม
4. ห้าม create/update/delete Native Scheduled Task เดิม
5. watchdog รายชั่วโมงยังคง schedule เดิม เป็น fallback
6. manual resume ต้อง refresh canonical Prompt 1 + Prompt 2 และ checkpoint ล่าสุด
7. drain terminal tasks ก่อน
8. เข้า Active Coordinator + Short-budget strategy ทันที
9. ห้ามเริ่ม Task ใหม่จากต้น
10. ห้ามสร้าง duplicate task/migration/commit
11. manual resume ไม่ถือว่า scheduled watchdog ถูก consume หรือเลื่อน dueAt
12. เมื่อ manual worker ยัง active ให้ทำงานต่อโดยไม่รอ scheduled wake ถัดไป

Short manual resume prompt สามารถอ้างเพียง:
- workspace
- stable goalKey
- Prompt 1/2 canonical paths
- “resume from latest checkpoint and enter Active Coordinator Loop”

ไม่ต้อง copy checkpoint/task IDs ลง prompt เพราะ durable goal เป็น authoritative state

### 5.12 Lease continuity ระหว่าง active work

worker lease เป็น ownership fence ไม่ใช่เวลาที่ workerควรหยุด

กติกา:

1. ถ้า worker ยังทำ useful work แต่ lease ใกล้หมด/หมด:
   - re-read goal
   - reacquire same goalKey อย่างปลอดภัย
   - continue Active Coordinator Loop
2. ถ้า `run_goal` คืน `acquired:false` + `retryAfterSeconds <= 60` และไม่มี live newer owner:
   - bounded wait
   - retryใน request/turn เดิม
   - ห้าม yieldไปอีกชั่วโมง
3. ถ้ามี live owner จริง:
   - ห้าม steal lease
   - no-op mutation
4. ห้ามใช้ lease expiry เป็นวิธี “พักงาน”
5. ก่อน long durable task ให้ checkpoint task identity/packet state แต่ไม่ release leaseเพียงเพราะ taskเริ่ม
6. `releaseLease:true` ใช้เฉพาะ actual turn boundary ตามข้อ 17
7. manual immediate resume ต้องสามารถ takeoverหลัง stale grace ตาม runtime fence โดยไม่แตะ watchdog schedule

---

## 6. Exactly-one Scheduled Continuation watchdog

สำหรับ goal นี้ต้องมี **Native ChatGPT Scheduled Task เพียงหนึ่งตัว** สำหรับ continuation ตลอดช่วงที่ goal active และ autonomous continuation ยังเปิดอยู่

contract ปัจจุบันที่ต้องยึด:

- recurring interval: **60 นาที**
- occurrence: interval
- destination: current chat
- cloud execution: requested
- native task ID เดิมต้องถูก reuse ข้าม ordinary wakes
- ordinary wake ไม่ consume task
- ordinary checkpoint ไม่สร้าง successor
- ordinary checkpoint ไม่ retime cadence
- ห้ามสร้าง scheduled task ใหม่ทุกครั้งที่ checkpoint หรือ wake

หลัง `run_goal` และเมื่อมี durable state เพียงพอแล้ว:

1. โหลด/ใช้ skill `lnwjud-scheduled-continuation`
2. ตรวจว่ามี confirmed watchdog เดิมหรือไม่
3. หากมี confirmed live watchdog สำหรับ goal นี้ ให้ reuse
4. หากยังไม่มี ให้ใช้ `prepare_scheduled_continuation`
5. ใช้ schedule request ที่ tool คืนมาตามจริง
6. สร้าง Native ChatGPT Scheduled Task ผ่าน host Scheduled Task surface ที่มีอยู่จริง
7. record truthful creation receipt ด้วย real native task ID และ host-reported dueAt
8. หาก host ไม่ expose proof ว่ารันบน cloud ให้บันทึก `unverified`; ห้ามอ้างว่า cloud confirmed
9. หาก create ผลลัพธ์ ambiguous ห้าม blind retry เพราะอาจสร้าง duplicate
10. หาก explicit host dispatch failure พิสูจน์ว่าไม่ได้ส่งจริง ให้ re-resolve host operation และ retry ได้หนึ่งครั้งตาม skill ปัจจุบัน

ห้ามใช้สิ่งต่อไปนี้เป็น fallback:

- Windows Task Scheduler / `schtasks`
- cron
- shell timer / sleep loop
- browser/DOM automation เพื่อกดสร้าง schedule
- lnwjud local scheduler ที่ไม่ใช่ Native ChatGPT Scheduled Task
- scheduled task ตัวที่สองเผื่อ task แรกไม่ทำงาน

scheduler degradation ไม่ใช่เหตุผลให้ mark goal completed/failed และไม่ใช่เหตุผลให้หยุด current worker ถ้ายังทำงานต่อได้

### 6.1 Watchdog เป็น recovery safety net ไม่ใช่ primary coordinator

- recurring 60 นาทีมีหน้าที่ recover เมื่อ worker/turn เดิมหาย, ไม่ใช่ cadence ปกติของการเดิน Task
- active worker ต้องใช้ Active Coordinator Loop ข้อ 5.8 เพื่อ chain งานเอง
- ห้ามจงใจ yield หลัง spawn/checkpoint/Task PASS เพื่อ “ให้ watchdog ทำต่อ”
- ถ้า task จบขณะที่ worker ยัง active ต้อง consume ตอนนั้น ไม่รอ dueAt
- dueAt รอบถัดไปไม่ใช่ handoff deadline
- การที่ watchdog พร้อมใช้งานไม่ลดภาระของ current worker ในการทำ useful work ต่อ
- เมื่อ worker ถูก host terminate จริง watchdog จึงเป็นตัวกู้ state ในรอบถัดไปตาม cadence 60 นาที

Scheduled Task prompt ต้อง bind กลับมายัง connected InwJud connector ของ current chat ตาม skill/runtime contract และห้ามใส่:

- lease token
- credentials
- secrets
- private internal session IDs
-ข้อมูลที่ไม่จำเป็นต่อ wake protocol

---

## 7. Scheduled wake protocol

ทุกครั้งที่ Native Scheduled Task ปลุกกลับมา:

**กฎแรก:** ก่อน workspace mutation และก่อน user-visible progress reply ให้ใช้ `claim_scheduled_continuation` เป็น connected InwJud action แรก

จากนั้นจัดการผลตาม contract ปัจจุบัน:

### `recurring_acquired`

เมื่อ acquire สำเร็จ ห้ามทำเพียง “หนึ่ง action แล้วตอบ” ให้เข้า **Active Coordinator Loop ข้อ 5.8 + Short-budget Strategy ข้อ 5.9** ทันที

ก่อนทำ workspace mutation ให้ refresh canonical continuity instructions จาก:
- Prompt 1 canonical path
- Prompt 2 canonical path ปัจจุบัน
- durable checkpoint ล่าสุด

ห้ามพึ่ง cached prompt text จากตอนสร้าง Scheduled Task อย่างเดียว

จากนั้น:

1. โหลด durable checkpoint ล่าสุด
2. ตรวจ `trackedTasks` / `activeTaskIds`
3. classify ทุก task เป็น readable-live / readable-terminal / ownership-denied / external-service
4. **drain readable-terminal tasks ก่อน nextAction ใหม่**
5. ถ้าพบ ownership-denied ให้ใช้ข้อ 8.1 ก่อน ห้าม duplicate
6. reconcile repository/DB/Docker/external state เฉพาะที่จำเป็นต่อ current packet
7. consume terminal result → update acceptance/step/checkpoint → execute nextAction ต่อใน wake เดียวกัน
8. ถ้า Task ปัจจุบัน PASS ให้เข้า Task ถัดไปใน wake เดียวกัน เว้นแต่ Prompt 1 กำหนด blocker/commit boundary ซึ่งต้องทำ boundary นั้นก่อนแล้วเดินต่อ
9. แตก Task ใหญ่เป็น continuation packet ตามข้อ 5.9 แทนการพยายามทำ Task ใหญ่รวดเดียว
10. verification ใหม่ที่อาจข้าม turn/session ต้องใช้ goal-bound `task_create` และควร launch ทันทีเมื่อ packet testable
11. ถ้า task ใหม่จบภายใน wake ให้ consume ผลและวนต่ออีก iteration
12. ถ้า host ตัดก่อน task จบ ต้องมี reconstruction-grade checkpoint/task identity เพียงพอให้รอบถัดไป consume ได้
13. ห้ามจบ wake เพียงเพราะ:
    - terminal task ถูกอ่านแล้ว
    - checkpoint สำเร็จ
    - Task PASS
    - commit สำเร็จ
    - continuation packet สำเร็จ
    - task ใหม่ถูกสร้าง
    - มี nextAction ที่ทำได้
14. reuse recurring native task เดิม; ห้าม create/update/replace โดยไม่มีเหตุจำเป็น
15. user-visible progress reply ให้เกิดหลัง Yield decision เท่านั้น
16. ห้ามใช้ scheduled wake หนึ่งรอบเพียงเพื่อรายงาน ownership error, PASS, หรือ “เริ่ม Task แล้ว” ถ้ายังทำ packet ถัดไปได้
17. scheduled wake ที่สั้นต้อง prioritize actual mutation/verification/checkpoint ตามข้อ 5.9 มากกว่ารายงานหรือ broad re-analysis

### `worker_busy_noop`

หมายถึงมี worker/live blocking work หรือยังไม่ปลอดภัยให้ takeover

- ห้าม mutation
- ห้ามขโมย lease
- ห้ามสร้าง duplicate background task
- ห้ามแตะ recurring native task

ถ้า runtime คืน `retryAfterSeconds <= 60` และระบุว่าเป็น stale-heartbeat grace:
- bounded wait ตามค่านั้น
- retry claim/run_goal ใน **wake เดิม**
- ถ้าปลอดภัยให้ recover ใน wake เดิม ไม่รออีกหนึ่งชั่วโมงโดยไม่จำเป็น

### `already_claimed`

- ถือเป็น concurrent/duplicate wake
- ห้าม mutation
- ห้ามสร้าง worker ใหม่
- ห้ามเปลี่ยน schedule

### `not_due`

- ไม่ทำ mutation
- ปล่อย recurring task เดิมไว้

### `receipt_required`

- reconcile exact native host metadata/receipt ก่อน
- ห้ามสร้าง schedule ใหม่แบบเดา

### `terminal_cleanup_required`

- **cleanup only**
- ห้าม resume implementation
- ทำ recurring native task ตัวเดิมให้ non-runnable ด้วย strongest host operation ที่มีจริง: prefer delete, ไม่เช่นนั้น confirmed disable
- record truthful cancellation receipt
- จากนั้นทำ administrative durable finalization ตาม skill เท่านั้น

### `terminal_noop`

- ไม่มีงาน
- ห้ามสร้าง scheduled task ใหม่
- return ตามธรรมชาติ

ถ้า runtime เพิ่ม/เปลี่ยน outcome ในอนาคต ให้ยึด skill/schema เวอร์ชันปัจจุบัน ห้ามเดาพฤติกรรมของ outcome ที่ไม่รู้จัก

---

## 8. Stale session / ownership recovery

เมื่อเกิดอาการเช่น:

- chat session เดิมจบ
- client reconnect
- worker/session ownership เปลี่ยน
- stale continuation detected
- task/process handle จาก session เดิม query ไม่ได้
- `PERMISSION_DENIED: Task is not owned by this client session and workspace`
- `Process handle is not owned by this client and workspace`
- lease ยังอยู่แต่ worker ไม่ทำงาน
- Scheduled Task ปลุกมาเจอ checkpoint เก่า

ห้ามสรุปทันทีว่า “task หายแล้ว”, “task fail แล้ว” หรือ “เริ่มใหม่ได้”

ให้ทำ recovery reconciliation ตามลำดับ:

1. อ่าน durable goal ล่าสุด
2. อ่าน scheduled continuation ล่าสุด
3. ตรวจ `recovery_status`
4. ตรวจ checkpoint `trackedTasks`, active task IDs และ nextAction
5. ตรวจ repository status/diff/commits ที่เกี่ยวข้อง
6. ตรวจ external state ที่มี identity คงที่ เช่น Docker container/database/CI run
7. สำหรับ DB/migration/non-idempotent operation ให้ตรวจ state จริงก่อน retry
8. จำแนก state:
   - live worker
   - live/readable blocking task
   - terminal/readable task ที่ยังไม่ได้ inspect result
   - inaccessible task เพราะ session ownership
   - stale lease with no live work
   - unknown side-effect state
9. takeover ได้เฉพาะเมื่อ durable-goal ownership fence อนุญาต
10. ถ้า `run_goal` หรือ claim ระบุ stale grace <= 60 วินาที ให้ bounded wait และ retry ใน turn/wake เดิม
11. ห้ามรอ lease expiry เองเป็น continuation strategy
12. ห้ามสร้าง goal ใหม่เพื่อหนี stale lease

MCP session equality หรือเวลาที่ผ่านไปอย่างเดียวไม่ใช่หลักฐานว่า worker/task ตาย

### 8.1 Ownership-denied task recovery — กติกาบังคับ

เมื่อ `task_status`, `task_result`, shell wait/status/result หรือ process status/logs คืน ownership error:

#### ขั้น A — freeze duplicate creation

ทันทีที่พบ ownership error:

1. ห้ามสร้าง command เดิมซ้ำทันที
2. ห้าม mark PASS/FAIL จาก error นี้
3. ห้ามลบ evidence ของ task ID เดิม
4. บันทึก:
   - old task/process ID
   - exact command ถ้ารู้
   - cwd
   - Task/verification gate
   - error text แบบไม่ใส่ secret
   - เวลาโดยประมาณ
5. ถือผลเดิมเป็น `UNKNOWN_UNOBSERVABLE`

#### ขั้น B — classify operation ก่อนตัดสิน rerun

แบ่ง command เดิมเป็น 2 กลุ่ม:

**กลุ่ม 1: read-only / repeat-safe verification**

ตัวอย่าง:

- `tsc --noEmit`
- lint
- build ที่ไม่ publish/deploy
- unit test
- read-only integration verification ที่ fixture lifecycle ปลอดภัย
- file/diff inspection

สำหรับกลุ่มนี้ การ rerun อาจทำได้ **หลังพิสูจน์ว่าไม่มี live execution เดิมที่ยังทำงานอยู่ หรือ runtime ownership/liveness fence อนุญาต**

**กลุ่ม 2: mutating / non-idempotent / externally visible**

ตัวอย่าง:

- migration apply
- backfill
- fixture mutation ที่มี side effect
- stock-changing command
- commit
- upload
- external provider call
- cleanup/destructive reset

สำหรับกลุ่มนี้ **ห้าม rerun เพราะ ownership error เพียงอย่างเดียว**
ต้องตรวจ state จริง/receipt/schema/data/Git/external target ก่อนเสมอ

#### ขั้น C — liveness reconciliation

สำหรับ inaccessible handle:

1. ตรวจ durable task runtime ที่ current client มองเห็น
2. ตรวจ `recovery_status`
3. ตรวจ process/task liveness ผ่าน tool ที่ runtime ปัจจุบันรองรับ
4. ตรวจ external side effects/target state ตามชนิด command
5. ถ้า runtime มี resume/reconcile ownership operation ให้ใช้ operation นั้นก่อน rerun
6. transient observation error ให้ retry bounded
7. หาก authoritative evidence ยืนยันว่า execution เดิมยัง live → ห้าม duplicate; รอ/ติดตามตาม capability ที่มี
8. หาก authoritative evidence ยืนยันว่า terminal แต่ result อ่านไม่ได้:
   - read-only verification → ไม่ใช้ run เดิมเป็น PASS; rerun ด้วย goal-bound durable task เพื่อสร้าง inspectable evidence
   - mutating operation → ใช้ state/receipt จริงตัดสิน outcome; rerun เฉพาะเมื่อพิสูจน์ idempotency/absence
9. หากไม่มี live evidence, lease/session เก่าหมด และ handle inaccessible:
   - read-only/repeat-safe verification สามารถ classify old handle เป็น stale/unobservable ได้
   - บันทึก old run ว่า `UNVERIFIED_STALE_HANDLE`
   - เอา old handle ออกจาก active/tracked blocking set ใน checkpoint ถัดไป
   - rerun exact verification ด้วย `task_create` ที่ผูก current goalLease
10. ห้ามเอา old handle ออกจาก tracked set ถ้ายังมี credible live-process evidence หรือ command เป็น mutating operation ที่ outcome ยัง unknown

#### ขั้น D — rerun rule สำหรับ verification

เมื่ออนุญาตให้ rerun read-only/repeat-safe verification:

1. ใช้ `task_create`
2. ผูก current `goalId/goalLease`
3. ใช้ exact cwd/command/target เดิม เว้นแต่ code ถูกแก้หลัง run เดิม
4. track new task ID เป็น blocking job
5. ทดสอบ readability ด้วย `task_status` ทันที
6. wait/observe จน terminal
7. อ่าน `task_result`
8. ใช้เฉพาะผล run ใหม่ที่ inspect ได้เป็น acceptance evidence
9. เก็บ old task ID ใน evidence ว่า superseded due ownership transport issue; ห้ามลบประวัติ

#### ขั้น E — ป้องกัน ownership loop

ถ้า scheduled wake สองรอบติดกันเจอ ownership error กับ session-bound command ชนิดเดียวกัน:

1. ห้ามทำแบบเดิมรอบที่สาม
2. เปลี่ยน execution path เป็น goal-bound `task_create`
3. ห้ามใช้ `process_start` หรือ ordinary shell background สำหรับ gate นั้นอีก
4. checkpoint ว่า execution strategy ถูก hardened
5. ถ้า goal-bound durable task เองยังไม่ readable หลัง session change ให้ถือเป็น runtime/tooling blocker ที่แท้จริงและแจ้งผู้ใช้ พร้อม exact evidence; ห้ามวนสร้าง task ใหม่รายชั่วโมง

### 8.2 Stale tracked-task cleanup

tracked blocking task ห้ามค้างถาวรเพียงเพราะ owner session หาย

สามารถ clear task เก่าออกจาก `trackedTasks` ได้เมื่อครบทั้งหมด:

- handle อ่านไม่ได้เพราะ ownership/session
- ไม่มี credible evidence ว่ายัง live
- worker/lease เก่าถูก recover/replaced อย่างถูกต้อง
- operation เป็น read-only/repeat-safe **หรือ** mutating outcome ถูก reconcile แล้ว
- old task ID/error ถูกเก็บใน evidence
- nextAction ระบุชัดว่าจะ rerun/verify อย่างไร

การ clear tracked task เป็น **state reconciliation** ไม่ใช่การประกาศว่ารันเดิม PASS

### 8.3 Unknown mutating outcome

ถ้า command ที่ ownership หายเป็น mutating/non-idempotent และ outcome ยังพิสูจน์ไม่ได้:

- ห้าม clear เพื่อความสะดวก
- ห้าม rerun
- ตรวจ state จริงต่อ
- หากยังพิสูจน์ไม่ได้และไม่มี safe useful work ให้ตั้ง blocker ที่อธิบาย uncertainty
- Scheduled Continuation ห้ามใช้การไม่มี response เป็นเหตุอนุมัติ rerun

---

## 9. Resume logic สำหรับ Task 1–12

เมื่อ worker ใหม่ acquire goal ได้:

1. ห้ามเริ่มจาก Task 1 อัตโนมัติ
2. อ่าน checkpoint + `acceptance.md` + Git state
3. ตรวจ `trackedTasks` / `activeTaskIds` **ก่อน** เชื่อ nextAction เก่า
4. ถ้ามี terminal task ที่ยังไม่ได้ inspect ให้ consume ผ่าน Active Coordinator Phase B ก่อนทุกอย่าง
5. ถ้า checkpoint ยังเขียนว่า task `running` แต่ runtime บอก terminal ให้ runtime terminal state เป็นหลัก แล้ว reconcile checkpoint
6. ถ้า task PASS ทำให้ Task ปัจจุบันครบ acceptance ให้ update ledger/step และคำนวณ nextAction ใหม่ทันที
7. หา Task เก่าสุดที่ยังไม่ `PASS` หรือ deferred dependency ที่ถูกปลดแล้ว
8. ตรวจว่ามี commit batch ที่เกิดแล้วหรือ staged state ค้างหรือไม่
9. ทำ recovery consistency check ก่อน mutation
10. เข้า Active Coordinator Loop ข้อ 5.8 และทำ exact checkbox/verification ที่ค้างต่อ
11. หลัง resume สำเร็จ ห้ามหยุดเพียงเพราะ “recovery complete”; recovery เป็นทางเข้าสู่งาน ไม่ใช่ผลลัพธ์ของ wake

priority ตอน resume:
`terminal unconsumed task → ownership recovery → ledger/state reconciliation → required commit boundary → nextAction → new work`

ตัวอย่าง:
- T01–T06 PASS และ commit SHA มีจริง → ห้ามทำ T01–T06 ใหม่
- T04 tracked API task terminal PASS แต่ checkpoint ยังบอก running → inspect result → clear task → update acceptance → T04 PASS → commit ถ้ากำหนด → เริ่ม T05 ใน turn เดิม
- T09 RUNNING และมี focused test fail ที่แก้ code แล้วแต่ยังไม่ rerun → เริ่มจาก rerun นั้น
- T05 DEFERRED_DEPENDENCY รอ T06 และ T06 เพิ่ง PASS → กลับ T05 ก่อน T07 ตาม prompt หลัก
- FINAL_VERIFY กำลังรัน load test → inspect/reuse tracked task ก่อนสร้าง load test ใหม่
- commit ถูกสร้างแล้วแต่ worker ตายก่อน ledger update → verify SHA/diff ก่อน update ledger; ห้าม commit ซ้ำ

---

## 10. Work-conserving rule — Scheduled Task ไม่ใช่ข้ออ้างให้หยุด

ตราบใดที่:

- goal ยัง active
- lease ปัจจุบันยังใช้ได้หรือ recover ได้อย่างปลอดภัย
- ไม่มี user-decision blocker
- ยังมี useful work ที่ไม่ conflict
- host turn ยังไม่บังคับจบ

ให้ทำ Active Coordinator Loop ต่อใน turn เดิม

ห้ามหยุดเพียงเพราะ:

- checkpoint สำเร็จ
- commit สำเร็จ
- Task หนึ่ง PASS
- background task ถูก spawn
- background task เพิ่ง terminal
- test หนึ่ง fail แล้วรู้วิธีตรวจต่อ
- tool observation ครั้งเดียว fail
- มี Scheduled Task แล้ว
- ถึง milestone
- recovery สำเร็จ
- acceptance ledger เพิ่ง update
- nextAction เพิ่งถูกคำนวณใหม่
- session เคย stale มาก่อนแต่ recover แล้ว

กฎ chaining:

1. terminal task → inspect/disposition
2. disposition → update durable state/acceptance
3. state update → required commit boundary ถ้ามี
4. commit/acceptance → nextAction
5. nextAction → execute
6. spawn new task → observe/parallel work
7. task terminal → กลับข้อ 1

พบ failure ที่แก้ได้ใน scope = next unit of work ไม่ใช่ handoff boundary

หาก background job รันนาน:
- ทำ non-conflicting work ก่อน
- ใช้ bounded wait/observe เมื่อไม่มี parallel work
- local verification ที่คาดว่าจบในหลักวินาที/นาทีไม่ควรถูกโยนให้ hourly watchdogโดยสมัครใจ
- scheduled wake ให้ใช้ Short-budget Strategy ข้อ 5.9 และ Durable Delegation ข้อ 5.10
- ถ้า host ตัด workerก่อน durable job terminal ผล task ต้อง recover ได้โดยไม่ rerun mutation
- yield ได้เมื่อ job ยัง live จริง, ไม่มี useful parallel work, checkpoint reconstruction-grade พร้อม และ watchdog coverage ยืนยันแล้ว

ก่อน yield ให้ถามเชิง state ไม่ใช่ถามผู้ใช้:
- มี terminal task ที่ยังไม่ได้ consume หรือไม่?
- blockers=[] และมี nextAction หรือไม่?
- Task เพิ่ง PASS แต่ Task ถัดไปยัง pending หรือไม่?
- มี commit/ledger boundary ที่ต้องทำหรือไม่?
ถ้าคำตอบข้อใดเป็น “ใช่” และทำได้อย่างปลอดภัย → **ยังห้าม yield**

ไม่กำหนดเวลาว่า worker ต้องหยุดหลัง N นาที ให้ใช้ host turn อย่างมีประโยชน์จนถึง Yield decision ของข้อ 5.8

---

## 11. User-decision blocker / external blocker

### 11.1 User-decision blocker

ถ้าเข้าข้อ 8 ของ prompt หลัก เช่น:

- แผนกับโค้ด/ข้อบังคับขัดกัน
- migration number ชน
- ต้องเพิ่ม scope
- ต้องเลือก business behavior ใหม่
- ต้องใช้ค่าจริงที่ repository ไม่มี
- ต้องการสิทธิ์/ข้อมูลจากผู้ใช้

ให้:

1. หยุด implementation ตรงจุดนั้น
2. บันทึก Task/checkbox/blocker/evidence/nextAction
3. update `acceptance.md`
4. checkpoint durable goal เป็น blocked สำหรับ step ที่เกี่ยวข้อง
5. **คง durable goal ไว้ ไม่รายงาน completed**
6. ห้ามสร้าง workaround
7. ห้ามใช้ scheduler ตีความ “ไม่มีคำตอบ” เป็น approval
8. scheduled wake ที่เจอ blocker เดิมและไม่มี state change ให้ no-op ทาง implementation; ห้ามทำงานเสี่ยงซ้ำ
9. เมื่อผู้ใช้ตอบ ให้ resume goal เดิมและ clear blocker เฉพาะเมื่อคำตอบแก้ blocker จริง

อย่าเรียก `finish_goal(status:completed)` ในกรณีนี้

### 11.2 External state blocker ที่เปลี่ยนเองได้

เช่น exact CI run, staging service, provider availability หรือ task ที่รันอยู่:

- track dependency/task อย่างชัดเจน
- current worker ต้องติดตามต่อใน turn เดิมเท่าที่สมเหตุผลก่อนพึ่ง Scheduled Continuation
- Scheduled Continuation เป็น recovery fallback หาก worker จบก่อน dependency terminal
- ตรวจ exact target เดิม ไม่สลับไป “latest” ที่อาจเป็นคนละ run
- เมื่อ dependency เปลี่ยนเป็น terminal ขณะที่ worker/wake ยัง active ให้ inspect result และเดินหน้าต่อทันทีใน iteration เดิม
- ห้ามเห็น terminal external state แล้ว checkpoint+reply โดยไม่ execute nextAction ที่ถูกปลด ถ้ายังทำได้

---

## 12. CI / long external verification

หากมี GitHub Actions หรือ CI ที่ต้องรอ:

1. resolve exact run ID
2. ห้าม monitor “latest branch run” หลังเริ่มติดตาม
3. ใช้ durable background watcher สำหรับ exact run
4. reuse watcher เดิมถ้ายัง live
5. track เป็น `blocking_job`
6. wait/inspect terminal conclusion
7. fail → อ่าน logs ของ exact run ก่อนแก้
8. ห้าม merge/tag/release/push โดย prompt หลักก็ห้าม push อยู่แล้ว

Scheduled Continuation เป็นคนละสิ่งกับ CI watcher และห้ามใช้ watchdog รายชั่วโมงแทน exact CI watcher ถ้ายังติดตาม CI ใน worker ปัจจุบันได้

---

## 13. Git / commit recovery safety

prompt หลักกำหนด commit batch และห้าม push ต้องรักษาเหมือนเดิม

ก่อน commit หรือ retry commit หลัง recovery:

1. ตรวจ `git status` ของ repository นั้น
2. ตรวจ staged diff
3. ตรวจ commit ledger
4. ตรวจ HEAD SHA
5. แยก pre-existing user changes ออกจาก Lucky Wheel changes
6. ถ้า checkpoint บอกว่า commit สำเร็จแล้ว ให้ verify SHA ก่อนทำอะไร
7. ถ้า command response ขาดหายแต่ commit อาจสำเร็จ ห้าม commit ซ้ำจนตรวจ HEAD/reflog/log ที่เหมาะสม
8. ห้าม amend/reset/force เพื่อแก้ continuation
9. ห้าม push

checkpoint หลัง commit ต้องเก็บ:
- repository
- batch/tasks
- real SHA
- title
- verification state ที่ commit นั้นอ้างอิง

---

## 14. Database / migration / external side-effect recovery

สำหรับ operation ที่ rerun แล้วอาจเกิด side effect:

- migration
- backfill
- fixture creation
- stock mutation test
- R2 upload
- external provider operation
- schema/constraint creation
- data cleanup

ก่อน retry หลัง timeout/session loss:

1. ตรวจ state จริงก่อน
2. ตรวจ transaction outcome/log/schema/data
3. ใช้ idempotency ที่ระบบมีจริง
4. ห้าม assume ว่า timeout = rollback
5. ห้าม assume ว่าไม่มี response = operation ไม่เกิด
6. ถ้าผลยัง unknown ให้ checkpoint เป็น uncertainty/blocker และสืบต่อ
7. ห้ามทำ mutation ซ้ำเพื่อ “ลองใหม่” จนกว่าจะปลอดภัย

production data และ production infrastructure ยังเป็นข้อห้ามตาม prompt หลัก

---

## 15. Browser/UI verification recovery

สำหรับ Task 4, 9, 10, 11 และ final UI verification:

- browser tab/session เดิมไม่ใช่ durable source of truth
- หาก browser context หาย ให้เปิด context ใหม่ตาม tool ownership ที่รองรับ
- อย่าถือ screenshot mock/reference เป็นผลตรวจของ implementation จริง
- เก็บ screenshot/result paths และ viewport/locale/state ที่ตรวจจริงใน acceptance evidence
- ถ้า UI test background process ยัง live ให้ reuse
- ถ้า server supporting service เป็น shared service ห้าม kill/restart โดยไม่มี ownership proof
- TH/EN, mobile, accessibility, reduced motion และสถานะตาม prompt หลักยังต้องตรวจจริง

---

## 16. Progress reporting

ใช้ caveman เฉพาะ chat progress ตาม prompt หลัก แต่ต้องบอกความจริง

รายงานเมื่อมี meaningful change เช่น:

- Task X PASS
- test/background job terminal
- blocker ใหม่
- root cause + fix สำคัญ
- commit batch สำเร็จ
- final verification milestone
- recovery สำเร็จจาก stale worker

ไม่จำเป็นต้อง spam ทุก poll

รูปแบบสั้น:

```text
ตอนนี้: Txx / checkbox …
ผ่านแล้ว: …
กำลังรัน: …
Blocker/dependency: …
ต่อไป: …
```

ห้ามรายงาน “ยังทำงานอยู่” หากไม่มี live worker/task evidence
ห้ามรายงาน “เสร็จแล้ว” ก่อน durable terminal completion

### Progress reply policy

progress reporting **ไม่ใช่เหตุผลให้จบ worker**

ก่อนส่งข้อความที่มีแนวโน้มจะเป็น final response ของ turn ให้ตรวจ Yield decision ข้อ 5.8 ก่อน:
- ถ้า blockers=[] และมี executable nextAction → ทำ nextAction ก่อน
- ถ้ามี terminal tracked task → consume ก่อน
- ถ้า Task เพิ่ง PASS และมี Task ถัดไป → เริ่ม Task ถัดไปก่อน
- ถ้ามี durable task ที่คาดว่าจะจบเร็วและยัง observe ได้ → observe ต่อก่อน

Scheduled wake ห้ามจบด้วยข้อความเพียง:
- “Task X ผ่านแล้ว”
- “กำลังจะเริ่ม Task Y”
- “checkpoint แล้ว”
- “test จบแล้ว”
ถ้า Y หรือ nextAction สามารถเริ่มได้ใน wake เดียวกัน

ถ้าจำเป็นต้องรายงานระหว่างทำงาน ให้รายงานสั้นโดยไม่ถือเป็น handoff และทำ execution ต่อ

---

## 17. Turn-boundary handoff

ใช้ section นี้ **เฉพาะเมื่อ actual host turn boundary หลีกเลี่ยงไม่ได้จริง** ไม่ใช่เมื่อ worker อยากจบหลัง milestone

ก่อน handoff ต้องทำ Final Drain:

1. inspect terminal result ของ tracked blocking task ทุกตัวที่ terminal แล้วให้ครบ
2. ถ้าพบ terminal task:
   - consume/disposition
   - update acceptance/durable step
   - clear จาก active/tracked set เมื่อเหมาะสม
   - ถ้าผลดังกล่าวปลด nextAction และ host ยังไม่บังคับจบทันที ให้กลับ Active Coordinator Loop; **ยังไม่ handoff**
3. ถ้า Task เพิ่ง PASS และยังมี required commit/Task ถัดไปที่เริ่มได้ ให้ทำต่อจน host บังคับ boundary จริง
4. สำหรับ blocking task ที่ยัง running:
   - ต้องเป็น goal-bound durable task ที่ออกแบบให้ reattach ข้าม session ได้
   - ต้องมี task ID, exact command/cwd/role และ current state ใน checkpoint
   - ห้าม handoff session-bound `processId` หรือ ordinary shell handle ที่ยังไม่ terminal
5. หากพบ session-bound task ยัง running ตอนใกล้ turn boundary:
   - ถ้าเป็น read-only verification ให้พยายาม wait ให้ terminal ใน turn เดิม
   - ถ้า wait ไม่ทันและ stop ได้อย่างปลอดภัย ให้ stop/abandon ตาม runtime แล้ว checkpoint ว่า verification ยังไม่ผ่าน
   - ถ้า stop/observe ไม่ได้ ให้บันทึก `UNKNOWN_UNOBSERVABLE` และใช้ข้อ 8.1 ใน recovery; ห้ามถือว่าเป็น durable blocking job ที่รอบหน้าต้อง reattach ได้
6. checkpoint exact progress รวม:
   - current Task/checkbox
   - current continuation packet และ packet status
   - changed files
   - exact commands/results
   - durable task IDs ที่ **ยัง live จริง**
   - terminal task results ที่ consume แล้ว
   - ownership anomalies
   - acceptance/commit state
   - mutation/operation ที่ห้ามทำซ้ำ
   - exact nextAction และ next packet แบบ executable
7. ยืนยัน exactly one confirmed Native ChatGPT watchdog
8. หาก scheduler host degraded ให้บันทึกตามจริง ห้ามอ้างว่ามี coverage
9. หากจำเป็นและ tool รองรับ ใช้ `session_handoff` เฉพาะ bounded same-chat recovery summary; ห้ามใช้แทน durable goal
10. ก่อน release lease ตรวจ:
    - ไม่มี terminal task ที่ยัง unconsumed
    - ไม่มี executable nextAction ที่ยังทำได้ก่อน boundary
    - ไม่มี session-bound blocking handle ที่ถูก checkpoint เป็น dependency แบบผิดชนิด
11. release lease ใน checkpoint สุดท้ายเท่านั้น
12. หลัง release lease ห้าม mutation
13. ไม่ขอให้ผู้ใช้พิมพ์ continue

ถ้าทุก tracked task terminal แล้วและ blockers=[] แต่ nextAction ยังมีอยู่ นั่น **ไม่ใช่ handoff state**; ต้อง advance ต่อก่อน

ห้ามสร้าง:
- USER_INSTRUCTIONS persistence file
- generic handoff/history file
- recovery prompt fileแบบถาวรเพื่อแทน checkpoint

continuation state เป็น task data ไม่ใช่ persistent instruction injection

---

## 18. Verified terminal completion

ห้ามรายงานงานทั้งหมดเสร็จจนเงื่อนไขเหล่านี้ครบ:

1. PREFLIGHT completed
2. T01–T12 = completed ซึ่งหมายถึง prompt หลักเป็น PASS จริงทั้งหมด
3. deferred dependency ledger ไม่มีรายการค้าง
4. FINAL_VERIFY completed จากการรัน final comprehensive verification บน code ล่าสุด
5. commit policy ตาม prompt หลักครบ
6. commit ledger ตรงกับ Git จริง
7. ไม่มี required check ที่ skipped/unverified แล้วถูกนับเป็น PASS
8. blockers ว่าง
9. tracked `blocking_job` ทุกตัว terminal และผลถูก inspect
10. ไม่มี uncertain mutation ที่ยังไม่ได้ reconcile
11. ยืนยัน no push / no deploy / no production mutation
12. acceptance evidence ล่าสุดครบ

จากนั้นทำ terminal lifecycle ตามลำดับ:

### 18.1 Scheduled watchdog cleanup ก่อน

- เรียก `cancel_scheduled_continuation` ขณะที่ goal ยัง active
- ทำ exact recurring Native ChatGPT task ให้ non-runnable
- prefer host delete; ถ้า host ไม่มี delete ใช้ confirmed disable
- record truthful cancellation receipt
- recurring run ที่เคย fire แล้ว **ไม่ใช่ cleanup proof**
- ห้ามสร้าง replacement schedule

### 18.2 Finish durable goal

เมื่อ scheduler cleanup ถูกพิสูจน์แล้ว:

- เรียก `finish_goal(status:completed)`
- ใช้ revision/lease ปัจจุบัน
- summary/evidence ต้องอ้าง acceptance/commit/final verification จริง
- inspect task/request cancellation result ที่ tool คืน
- อ่าน `get_goal` อีกครั้ง

ถือว่าเสร็จจริงเมื่อ:

- completion state = completed
- goal เป็น terminal
- ไม่มี pending scheduled-task cleanup
- ไม่มี blocking task ค้าง

หาก `finish_goal` คืน `pending_native_cleanup`:
- goal ยังไม่เสร็จ
- ทำ cleanup exact watchdog เท่านั้น
- record receipt
- reacquire administrative finalization lease ถ้า contract ต้องใช้
- finish อีกครั้ง
- ห้ามกลับไป implementation ใน cleanup-only path

หลัง terminal success จึงส่ง final report ตาม prompt หลัก

**ห้ามลบหรือหยุด retained PostgreSQL test container/volume ตามข้อ 2.1 ระหว่าง FINALIZE หรือหลัง terminal success** การจบ durable goal ทำความสะอาดเฉพาะ watchdog/tasks ที่ policy อนุญาต ไม่ใช่คำสั่งลบ retained Docker test environment

---

## 19. กรณีผู้ใช้ยกเลิก

หากผู้ใช้สั่งหยุด/ยกเลิก Lucky Wheel goal:

- หยุดสร้างงานใหม่
- checkpoint/capture state ที่จำเป็นเพื่อ audit ก่อน cleanup ถ้าปลอดภัย
- หยุดเฉพาะ tracked tasks ที่ `cancelWithGoal:true`
- ห้ามปิด supporting service ที่ `cancelWithGoal:false`
- **ห้ามลบ/หยุด `pris2026-lucky-wheel-postgres-test-20261003` และห้ามลบ `pris2026-lucky-wheel-postgres-test-data-20261003` เพียงเพราะ goal ถูกยกเลิก** ต้องรอคำสั่งลบ test environment จากผู้ใช้โดยตรง
- cleanup exact Native Scheduled Task ของ goal
- ห้ามเรียกสถานะ `completed`
- ใช้ cancellation/blocked/failed lifecycle ที่ runtime ปัจจุบันรองรับอย่างตรงความหมาย
- เก็บงาน/commit/evidence ที่มีอยู่ตามคำสั่งผู้ใช้และ policy; ห้าม reset/delete โดยพลการ

---

## 20. Non-negotiable continuation invariants

ตลอดงานต้องรักษาข้อเหล่านี้:

1. หนึ่ง objective = stable goalKey เดิม
2. หนึ่ง active goal = worker lease ownership ที่พิสูจน์ได้
3. หนึ่ง goal = Native ChatGPT recurring watchdog ไม่เกินหนึ่งตัว
4. watchdog cadence ปัจจุบัน = 60 นาที; ห้ามอ้างว่าเป็น 30 นาที
5. checkpoint ไม่ใช่เหตุผลให้หยุด
6. background task spawn ไม่ใช่ PASS
7. task terminal ต้อง inspect result
8. stale session ไม่ใช่หลักฐานว่า task ตาย
9. no response ไม่ใช่ approval
10. timeout ไม่ใช่หลักฐานว่า mutation rollback
11. recovery ห้ามทำ duplicate migration/commit/task/external side effect
12. user-decision blocker ห้าม bypass
13. scheduler failure ไม่เท่ากับ work failure
14. current worker ต้องทำ useful work ต่อเท่าที่ปลอดภัย
15. scheduled wake ต้อง claim continuation ก่อน mutation
16. ordinary wake reuse native task เดิม
17. final success ต้อง cleanup watchdog ก่อน finish goal
18. final report ต้องเกิดหลัง `get_goal` ยืนยัน terminal completion
19. ห้ามเปิดเผย lease/secrets/internal IDs
20. ห้าม push/deploy/production mutation ตาม prompt หลัก
21. Lucky Wheel PostgreSQL test container ต้องมีเพียงหนึ่งตัวและ reuse ตัวเดิมตลอดงาน
22. retained PostgreSQL test container/volume ต้องไม่ถูกลบจาก goal completion/cancellation โดยอัตโนมัติ
23. การลบ retained PostgreSQL test environment ต้องเกิดจาก explicit later user command เท่านั้น
24. verification/build/test ที่อาจข้าม session ต้องใช้ goal-bound durable task; session-bound process handle ห้ามเป็น continuation source of truth
25. ownership error ไม่เท่ากับ task failure/success และห้ามใช้เป็นเหตุ blind rerun
26. inaccessible read-only verification ต้องผ่าน liveness reconciliation ก่อน rerun และผล run เดิมห้ามนับเป็น PASS
27. inaccessible mutating operation ต้อง reconcile side effect ก่อนเสมอ ห้าม rerun จนกว่าจะพิสูจน์ว่าปลอดภัย
28. tracked blocking task ต้องไม่ค้างถาวรเพียงเพราะ owner session หาย; clear ได้เฉพาะตามข้อ 8.2 พร้อม evidence
29. ถ้า ownership loop เกิดซ้ำสอง scheduled wakes ต้องเปลี่ยน execution strategy; ห้ามวนสร้าง session-bound task รายชั่วโมง
30. terminal tracked task ต้องถูก consume ก่อนสร้าง next unrelated work และก่อน turn-ending progress reply
31. `activeTaskIds` ต้องสะท้อน task ที่ยัง active หรือ terminal-but-not-yet-consumed เท่านั้น; หลัง RESULT_INSPECTED + disposition ต้อง reconcile ทันที
32. Task PASS + blockers=[] + มี nextAction = ต้อง continue ใน turn/wake เดิม
33. progress report, checkpoint, commit หรือ recovery success ไม่ใช่ yield boundary
34. hourly watchdog เป็น recovery safety net ไม่ใช่ primary pacing mechanism
35. scheduled wake ที่ acquire ได้ต้อง drain terminal task queue ก่อนอ่าน nextAction เก่า
36. scheduled wake ต้องสามารถ advance ข้ามหลาย milestones/Tasks ใน wake เดียว ถ้า host time และ safety อนุญาต
37. worker ห้ามตั้งใจปล่อย local test/build ที่คาดว่าจบเร็วให้รอ watchdog รอบหน้า หากยัง observe ต่อได้
38. ถ้า worker ถูก host terminate ก่อน task terminal ยอมรับว่ามี idle gap ถึง watchdog รอบหน้าได้; ห้ามอ้าง instant continuation
39. เมื่อ task terminal หลัง checkpoint ให้ผล runtime ล่าสุดชนะ stale checkpoint field ที่ยังเขียน running และต้อง reconcile state
40. ทุก yield ต้องผ่าน Yield decision ข้อ 5.8; ถ้าเงื่อนไข yield ไม่ครบต้องทำงานต่อ
41. scheduled wake ทุกครั้งใช้ Short-budget Strategy ข้อ 5.9 โดย default
42. Task ใหญ่ต้องแตกเป็น continuation packets ที่ recover ได้ ไม่ถือทั้ง Task เป็น atomic wake unit
43. scheduled wake ต้อง front-load actual progress และ durable verification; ห้ามใช้ budget ส่วนใหญ่กับ progress/reporting/broad re-analysis
44. durable verification ควรถูก launch ทันทีเมื่อ code packet testable เพื่อให้ processรอดได้ถ้า hostตัด worker
45. ไม่มี event-driven callbackหลัง workerตาย; background task terminal หลัง host cut จะถูก consumeใน manual resume หรือ watchdogรอบถัดไป
46. manual immediate resume ก่อน dueAt เป็น supported path และต้องไม่แก้ scheduled cadence/task identity
47. manual resume ใช้ same goalKey/checkpoint และต้อง drain terminal taskก่อน nextAction
48. lease expiry/stale grace ที่ recoverได้ภายใน <=60 วินาทีต้อง retryใน requestเดิม ไม่โยนไป hourly wake
49. ห้ามสร้าง dummy background task/sleep loop เพียงเพื่อให้ดูเหมือนงานยังทำอยู่
50. current packet checkpoint ต้องระบุสิ่งที่ทำแล้ว/unverified/ห้ามทำซ้ำ/next exact action

---

## 21. Start behavior

หลังอ่าน prompt หลักและไฟล์นี้ครบ:

1. โหลด skill ที่ prompt หลักต้องใช้ตาม Task และโหลด `lnwjud-scheduled-continuation`
2. ตรวจ durable goal ด้วย stable goalKey
3. create/resume goal เดิม
4. ถ้าเป็น goal ใหม่ ให้ตั้ง durable plan mapping ตามไฟล์นี้
5. ถ้าเป็น goal เดิม ให้ใช้ checkpoint ล่าสุดเป็น authoritative continuation state แต่ reconcile runtime task state ก่อนเชื่อ field `running`/nextAction เก่า
6. ก่อนเริ่ม Task work ให้ inspect/create/reuse persistent Local PostgreSQL test container ตามข้อ 2.1 และยืนยันว่า healthy; ห้ามสร้าง container ตัวที่สอง
7. บันทึก non-secret Docker test-environment identity ลง checkpoint/`acceptance.md` และรักษา container เดิมข้าม session/worker
8. ensure exactly one recurring Native ChatGPT watchdog ตาม contract
9. ตรวจ trackedTasks/activeTaskIds:
   - terminal → consume result ก่อน
   - running → reuse/observe
   - ownership-denied → recovery ข้อ 8.1/8.2
   - ห้าม spawn duplicate ก่อน reconciliation
10. ก่อนรัน verification/build/test ใด ๆ ให้เลือก execution tool ตามข้อ 5:
    - งานที่อาจข้าม session/turn หรือเป็น acceptance gate → goal-bound `task_create`
    - ordinary shell/process ใช้เฉพาะงานสั้นที่ terminal result จะถูกอ่านใน turn เดิม
11. ทำ preflight ที่ prompt หลักกำหนดถ้ายังไม่ผ่าน โดยใช้ retained test environment นี้สำหรับ database verification ที่เกี่ยวข้อง
12. เข้า **Active Coordinator Loop ข้อ 5.8**
    - ถ้าเป็น scheduled wake ให้เปิด Short-budget Strategy ข้อ 5.9
    - ถ้าเป็น manual resume ให้ใช้ข้อ 5.11 และทำต่อทันทีโดยไม่รอ dueAt
13. loop ต้องสามารถ:
    - consume terminal task
    - update acceptance/checkpoint
    - mark Task PASS
    - ทำ required commit boundary
    - แตกงานเป็น continuation packet
    - เริ่ม Task/packet ถัดไป
    - spawn/observe durable verification ใหม่
    ใน turn/wake เดียวกันเมื่อปลอดภัย
14. สำหรับ scheduled wake ให้ prioritize packet ที่ให้ acceptance evidence หรือ durable execution ต่อได้ก่อน host cut
15. ทำต่อจน Yield decision เป็นจริง:
    - verified terminal completion หรือ
    - user-decision/external blocker ที่ไม่มี safe useful work หรือ
    - genuinely long live durable task ที่ไม่มี parallel work และ handoff พร้อม หรือ
    - host บังคับ actual turn boundary
16. ห้ามหยุดเพื่อถามว่า “ให้ทำต่อไหม”
17. ห้ามจบ turn หลัง terminal task/Task PASS/packet completion เพียงเพราะ watchdog มีรอบถัดไป
18. ถ้า manual resume ถูกเรียกก่อน watchdog dueAt ให้ทำงานทันทีและคง watchdog เดิมไว้เป็น fallback
19. แม้งานถึง terminal completion ให้คง retained PostgreSQL test container/volume ไว้ตามข้อ 2.1 จนกว่าจะได้รับคำสั่งลบจากผู้ใช้โดยตรง

เป้าหมายของไฟล์นี้ไม่ใช่ทำให้ AI “ดูเหมือนกำลังทำงานตลอดเวลา” แต่ทำให้ทุกช่วง execution มี **ownership, recoverable state, duplicate protection, real background-task evidence และ scheduled recovery path** ที่ตรวจสอบได้จนงาน Lucky Wheel ถึง terminal acceptance จริง
