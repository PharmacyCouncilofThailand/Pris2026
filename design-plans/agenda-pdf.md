# PRIS Agenda PDF — แผนปรับรูปแบบเอกสาร

Written against: 1dffd07 (main)
Status: Implemented and verified locally on 2026-10-21

## Evidence chain

- Surface: /th/agenda และ /en/agenda ผ่านปุ่ม printAgendaPdf
- Owner: src/app/[locale]/agenda/page.tsx และ src/app/globals.css:426 เป็นต้นไป
- ปุ่มเรียก window.print(); print article อ่าน scheduleData ทั้งสองวัน โดยไม่ขึ้นกับตัวกรองหน้าเว็บ
- Print CSS ระบุ Arial 10pt แม้ root layout ติดตั้ง Noto Sans Thai และ Outfit ไว้แล้ว
- ทุก event ใช้ break-inside: avoid แต่ข้อมูลมี description ยาวหลายรายการนำเสนอ ต้องทดสอบการไหลข้ามหน้า ไม่ถือว่าพบการตัดจริงจนกว่าจะ render
- DESIGN.md เน้น ticket จึงไม่ใช้กฎรูปทรงหรือสีเฉพาะ ticket มาบังคับ Agenda
- Design sources: font variables ใน src/app/layout.tsx, locale-th ใน globals.css, น้ำเงิน #1d4ed8 และ slate ใน print styles เดิม
- Explicit exceptions: None documented สำหรับ Agenda print
- Verification: Chromium production PDF checked for both locales; 21 A4 pages each, embedded fonts, all titles and description paragraphs retained. Firefox/Safari not tested.

## Design decision

ออกแบบเป็นเอกสารกำหนดการประชุม A4 แนวตั้งที่ใช้ค้นเวลา ห้อง และหัวข้อได้เร็ว พื้นขาว ข้อความ slate เข้ม ใช้น้ำเงินเดิมเป็นสีเน้น เส้นแบ่งบาง ไม่มีภาพพื้นหลังใหญ่หรือเงา รักษาข้อมูลครบทั้งสองวันและภาษาตามหน้าที่เปิด

ค่าขนาดด้านล่างเป็นข้อเสนอสำหรับงานพิมพ์ ต้องปรับจาก PDF จริง ไม่ใช่กฎที่มีอยู่แล้ว

- A4, margin 15mm, เนื้อหากว้างประมาณ 180mm
- ไทย: var(--font-noto-sans-thai); อังกฤษ: var(--font-outfit) พร้อม Thai fallback
- ชื่อเอกสาร 24–26pt / 700, ชื่อวัน 15–16pt / 600, ชื่อกิจกรรม 11.5–12pt / 600
- เนื้อหา 10.5–11pt / 400, ข้อมูลรองไม่ต่ำกว่า 9.5pt, line-height 1.5–1.6; ไม่ขยาย tracking ภาษาไทย
- เวลาอยู่คอลัมน์ซ้ายกว้างประมาณ 30mm ใช้ตัวเลข tabular; เนื้อหาอยู่ขวา ห้องและ track มีป้ายข้อความชัดเจน
- ส่วนหัวมีโลโก้จริง PRIS แบบย่อ ชื่องาน และวันที่จากข้อมูลจริง ไม่มีหน้าปกแยกที่เสียพื้นที่
- แต่ละวันเริ่มหน้าใหม่ แต่ไม่บังคับหนึ่งวันให้จบในหน้าเดียว
- แต่ละกิจกรรม: เวลา / ห้อง / หัวข้อ / ผู้จัด / วิทยากรและบทบาท / รายละเอียด โดยใช้ helper ที่เว็บใช้เมื่อความหมายตรงกัน
- กิจกรรมพร้อมกันต้องแสดงเวลาและห้องครบ ไม่จัดเรียงใหม่จนทำให้ group หรือ session แม่-ลูกเปลี่ยนความหมาย

## Reuse

- scheduleData ใน src/data/scheduleData.ts เป็นข้อมูลต้นทางเดียว ไม่ทำสำเนาข้อมูลสำหรับ PDF
- font variables และ locale typography ใน src/app/layout.tsx และ globals.css
- formatAgendaTime, getAgendaDescription, groupAgendaSpeakers ใน src/lib/agendaPresentation.ts; ตรวจผลกับข้อมูลจริงก่อนนำมาใช้
- โลโก้ /assets/Img/logo/Logo-Final .png จาก Header ตรวจความคมชัดที่ขนาดพิมพ์
- แยก markup เป็น src/components/sections/AgendaPrintDocument.tsx หากจำเป็น เพื่อแยกเจ้าของงานพิมพ์ออกจากหน้า interactive ไม่สร้างระบบ design ใหม่ทั้งเว็บ

## Changes

1. src/app/[locale]/agenda/page.tsx และ AgendaPrintDocument.tsx
   - จัดโครงสร้างเอกสารตามแบบข้างต้นและใช้ภาษาเดียวกับ locale
   - รอ document.fonts.ready และโลโก้พร้อมก่อน window.print() จากปุ่ม ไม่เพิ่มบริการ PDF ฝั่ง server
   - คงการพิมพ์ครบสองวันและข้อมูลทุกรายการ ไม่ผูกกับ filter โดยไม่ได้รับคำสั่งใหม่
2. src/app/globals.css
   - ใช้ฟอนต์จริงจากเว็บแทน Arial และกำหนดหน่วย pt/mm สำหรับ print
   - จำกัดกฎซ่อนหน้าเว็บให้อยู่ในบริบท Agenda เพื่อไม่กระทบการพิมพ์ route อื่น
   - ให้เอกสารไหลตามหน้าโดยไม่กำหนดความสูงตายตัวหรือ overflow ที่ตัดเนื้อหา
   - เก็บหัวกิจกรรมไว้กับข้อความเริ่มต้น กิจกรรมสั้นอยู่ด้วยกัน รายละเอียดที่ยาวเกินหน้าอนุญาตให้แบ่งตามย่อหน้าหรือรายการ
   - ไม่ใช้ break-inside: avoid กับ event ยาวทั้งก้อน; ไม่ใช้การย่อฟอนต์เพื่อบังคับจำนวนหน้า
   - เอกสารอ่านได้ทั้งเมื่อเปิด/ปิด background graphics และพิมพ์ขาวดำ
3. messages/th.json และ messages/en.json
   - เพิ่มเฉพาะ label ที่จำเป็น เช่น เวลา ห้อง ผู้จัด วิทยากร และกำหนดการต่อ
   - คงความหมายปุ่ม Print / Save as PDF; เอกสารยังผ่าน print dialog ของเบราว์เซอร์
4. ส่วนหัวต่อหน้าและเลขหน้า
   - ทดลองกับ print engine เป้าหมายก่อนเลือกเทคนิค repeated header/footer
   - เป้าหมายคือระบุ PRIS 2026 และบริบทวันในหน้าต่อ โดยไม่ทับเนื้อหา
   - ไม่รับรองเลขหน้าแบบกำหนดเองข้ามเบราว์เซอร์จาก CSS อย่างเดียว ถ้าทำไม่ได้ในแนวทางเดิมให้รายงานข้อจำกัด ไม่เพิ่ม dependency หรือ backend เอง

## Scope

- Inherit: PDF/print ของ /th/agenda และ /en/agenda
- Verify: หน้าเว็บ Agenda ปกติยังแสดงเดิม, browser print ของ route อื่นไม่หายจาก CSS
- Exclude: แก้เนื้อหากำหนดการ, ticket, registration, เปลี่ยน public/assets/documents/program_agenda.pdf, deploy/push, ระบบดาวน์โหลด PDF ใหม่

## Validation

- Export PDF จริงทั้ง TH/EN ด้วย A4 100%; ใช้ Chrome/Edge เป็นเป้าหมายหลัก ตรวจ Firefox/Safari เท่าที่มีจริงและรายงานส่วนที่ไม่ได้ทดสอบ
- ตรวจทุกหน้าด้วยภาพ render: ฟอนต์ไทย/สระวรรณยุกต์ไม่แตก, ไม่มีข้อความทับ/ล้น/ขาด, หัวข้อไม่โดดเดี่ยว, ไม่มีหน้าว่างจากองค์ประกอบเว็บที่ซ่อน
- ตรวจช่วงรายละเอียดนำเสนอที่ยาวที่สุด, หลายวิทยากร, ห้องพร้อมกัน และกิจกรรมที่ไม่มีผู้พูด
- Extract text จาก PDF เทียบรายการ event กับ scheduleData เพื่อยืนยันไม่มีข้อมูลหาย; ตรวจ embedded fonts และ text selection
- เปิด/ปิด print backgrounds และลองขาวดำ ยังค้นเวลา ห้อง และหัวข้อได้
- ตรวจ flow กดปุ่มจริง รวมทั้งพิมพ์ก่อนฟอนต์พร้อม และ Ctrl/Cmd+P หลังหน้าโหลดครบ
- จำนวนหน้าให้ตามข้อมูลและความอ่านง่าย ไม่ตั้งเป้าจำนวนหน้าก่อนเห็นผล
- npm test, npm run lint, npm run build; บันทึกปัญหา environment แยกจาก regression ของงานนี้
- ส่งตัวอย่าง PDF ไทยและอังกฤษให้ดูพร้อมผลตรวจ ก่อนพิจารณาเผยแพร่

## Stop conditions

- หากจำเป็นต้องตัดข้อมูล ลดขนาดเนื้อหาต่ำกว่าเกณฑ์ หรือเปลี่ยนไปสร้าง PDF ฝั่ง server ให้เสนอข้อแลกเปลี่ยนก่อนขยายขอบเขต
- หากพบกำหนดการต้นทางผิดหรือขัดกัน ให้รายงาน ไม่แก้ข้อมูลเอง

## Design documentation

หลังแบบผ่านการยอมรับและตรวจ PDF แล้ว ค่อยบันทึกกติกา Agenda print ที่ยืนยันจริงไว้ใน DESIGN.md แยกจากกฎ ticket


## Implementation verification (2026-10-21)

- [x] Separate AgendaPrintDocument, shared font variables, chronological time column, localized room/station labels
- [x] Compact repeated day header, native A4 page numbers, normal prose pagination
- [x] Await fonts and logo before print; preserve Thai research details when English translation is absent
- [x] Full lint and production build passed; seven focused print regression tests passed
- [x] Full suite: 101/104 passed; three unchanged agendaPresentation.test.ts fixtures reference absent IDs 1031, 1008, 202
- [x] Both PDFs: 21 A4 pages; every one of 58 titles and every description paragraph found in extracted PDF text; no text boxes beyond printable bounds
- [x] Visual review of all Thai and English pages; embedded fonts verified with pdffonts; mobile remains unchanged
- [x] Independent source review found no issues; Impeccable detector returned []
- [x] .gitignore excludes local Graft/Graphify graphs, PDF outputs, screenshots, browser reports, temporary files and existing environment files

Final layout uses one flowing table cell per day with a compact repeated date/column header. Full masthead appears only at the beginning of each day. Events are block articles so Chrome can paginate long descriptions without moving an entire table row to a fresh page. The original full name and role strings remain intact; helpers group standard roles. Print geometry is 14mm top / 15mm sides / 16mm bottom, 31mm time column, 10.5pt body.

Browser QA uses Chromium. Custom margin-box page numbers may differ in Firefox/Safari; these browsers were not available for verification. PDFs are generated by the existing native browser print flow, not a new server endpoint. The new async print handler was exercised with window.print intercepted (one call); PDF files were rendered with Chromium's print engine. The OS print dialog itself was not automated.

INTENT: เดิม PDF ใช้ Arial และจัดข้อมูลต่อกัน; งานนี้ต้องอ่านง่ายและข้อมูลครบ; แผนกำหนดให้ใช้ฟอนต์ PRIS, A4, แยกเวลาและให้รายละเอียดไหลข้ามหน้า
TWINS: searched src/app CSS for global visibility:hidden / Arial print overrides - no other matching print owners found
AUTH: user said "ถ้าเสร็จแล้ว Git pushได้เลย comment= ปรับปรุงAgenda PDF Export"
