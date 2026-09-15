# Approved Abstracts Round 1 Static Data Design

## Goal

เปิดหน้า `approved-abstracts` และลิงก์ใน Header เพื่อแสดงผลการคัดเลือกบทความวิชาการรอบที่ 1 จากไฟล์ PDF ที่ผู้ใช้ให้มา โดยข้อมูลในตารางต้องตรงกับต้นฉบับ 100% และการค้นหา/กรองต้องทำงานจากข้อมูลภายในเว็บไซต์โดยไม่เรียก API รายชื่อบทคัดย่อ

## Source Of Truth

- ไฟล์อ้างอิง: `C:/Users/JaoNo/Downloads/1.ประกาศผลการคัดเลือกบทความวิชาการ รอบที่ 1.pdf`
- ตารางใน PDF มี 119 รายการจาก 3 รูปแบบการนำเสนอ:
  - Oral Presentation: 31 รายการ
  - Highlighted Poster Presentation: 39 รายการ
  - Poster Presentation: 49 รายการ
- เก็บ 2 แถวที่ PDF ระบุว่า `รอผลประกาศ` และไม่มี Tracking ID ไว้ด้วย ไม่ตัดทิ้ง
- เก็บค่าเลขลำดับ, Tracking ID, ชื่อผลงาน, ผู้วิจัย, หมวดหมู่ และประเภทการนำเสนอตาม PDF โดยตรง ไม่แปลหรือแต่งข้อความข้อมูลผลงาน
- ข้อมูลที่ไม่มีอยู่ใน PDF เช่น affiliation จะไม่ถูกสร้างขึ้นเอง

## Scope

- เปลี่ยน `src/app/[locale]/approved-abstracts/page.tsx` จาก `notFound()` และโค้ดที่ถูก comment ไว้เป็นหน้า client ที่ใช้งานได้
- เพิ่ม static data module สำหรับรายการ Round 1 ทั้ง 119 รายการ
- ลบ API URL, `fetch`, loading/error/retry state และ logic ที่พึ่งพา response จาก `/api/abstracts/accepted`
- คง Search, ตัวกรองประเภทการนำเสนอ, หมวดหมู่ และรอบ โดยใช้ `filterAcceptedAbstracts` กับข้อมูล local
- รองรับประเภท `oral`, `highlighted-poster` และ `poster` ให้แสดงและกรองแยกกันได้
- ค่าเริ่มต้นเป็น Round 1; Round 2 ยังเลือกได้แต่แสดงสถานะว่ายังไม่มีข้อมูล เพราะแหล่งข้อมูลที่ได้รับมีเฉพาะ Round 1
- เปิดเมนู Accepted Abstracts ใน `src/data/navigation.ts` โดยลบ temporary commented navigation block และใช้โครงสร้างเมนูเดิมที่ Header รองรับ
- ลบ comment ที่เป็นโค้ดปิดใช้งาน/temporary ในหน้าและส่วน Header/navigation ที่เกี่ยวข้อง โดยไม่เปลี่ยน behavior อื่นของ Header

## Approaches Considered

1. แยกข้อมูลเป็น `src/data/approvedRound1Abstracts.ts` และ import เข้า page — เลือกแนวทางนี้ เพราะข้อมูลขนาดใหญ่ไม่ปะปนกับ rendering และตรวจสอบจำนวน/ความครบถ้วนได้ด้วย test
2. ฝังข้อมูลทั้ง 119 แถวใน `page.tsx` — ทำได้เร็วแต่ทำให้ component ใหญ่และแก้ข้อมูลภายหลังยาก
3. ใช้ `approvedPosterAbstracts.ts` เดิม — โครงสร้างและข้อมูลตัวอย่างไม่ตรงกับ PDF จึงเสี่ยงต่อข้อมูลไม่ครบและประเภทการนำเสนอหาย

## Data Model

ใช้ shape ที่เข้ากันได้กับ `AcceptedAbstract` เพื่อ reuse filter helper โดยเพิ่มชนิด presentation ที่จำเป็นต่อ PDF:

- `id`: เลขลำดับที่ไม่ซ้ำภายใน dataset โดยสร้าง key ที่คงที่จากประเภทและลำดับ
- `trackingId`: ค่า Tracking ID ตาม PDF หรือ `null` สำหรับแถว `รอผลประกาศ`
- `title`: ชื่อผลงานตาม PDF
- `presentationType`: `oral | highlighted-poster | poster`
- `categoryId`/`categoryName`: category ID คงที่ภายใน static dataset และชื่อหมวดหมู่ตาม PDF
- `submitterName`: ผู้วิจัยตาม PDF
- `affiliation`: `null` เพราะ PDF ไม่มีคอลัมน์สถาบันในข้อมูลที่จะแสดง
- `round`: `1` ทุกแถว

การเพิ่ม `highlighted-poster` ต้องปรับ filter type union, ป้ายตัวกรอง, ป้ายผลลัพธ์ และข้อความแปลภาษาให้สอดคล้องกันทั้งไทยและอังกฤษ โดยคงข้อความข้อมูลผลงานจาก PDF เป็นต้นฉบับ

## User Experience

- หน้าแสดง hero และ layout เดิมของหน้า Accepted Abstracts
- ค่าเริ่มต้นแสดงรายการทั้งหมดของ Round 1 พร้อมจำนวนผลลัพธ์ `119`
- Search ค้นจาก Tracking ID, ชื่อผลงาน, ผู้วิจัย, หมวดหมู่, ประเภท และคำว่า Round 1 ได้
- ตัวกรองประเภทแสดง All, Oral, Highlighted Poster และ Poster
- ตัวกรองหมวดหมู่สร้างจาก static dataset และไม่พึ่งข้อมูลจาก server
- แถวที่ไม่มี Tracking ID แสดงข้อความ `ยังไม่ระบุรหัส`/`Not assigned` ตาม locale แต่ค่าข้อมูลยังคงสถานะ `รอผลประกาศ` ตาม PDF ในส่วนชื่อ/รายละเอียดที่เกี่ยวข้อง
- ไม่มีปุ่ม Retry หรือ loading state เพราะไม่มี network request

## Verification And Acceptance Criteria

- static dataset มี 119 แถวพอดี และจำนวนต่อประเภทเป็น 31/39/49
- ทุกแถวมี `round: 1`; มี Tracking ID ที่ไม่ซ้ำ 117 ค่า และมี 2 แถวที่ไม่มี Tracking ID ตาม PDF
- มีเลขลำดับและข้อมูลครบตั้งแต่ Oral 1–31, Highlighted Poster 1–39 และ Poster 1–49
- ไม่เหลือการเรียก `/api/abstracts/accepted`, `NEXT_PUBLIC_API_URL` หรือ fetch logic ในหน้า
- ทดสอบ filter helper สำหรับทั้ง 3 ประเภทและ Round 1
- ตรวจหน้าไทย/อังกฤษ, desktop/mobile, การค้นหา, ตัวกรอง, reset และสถานะ Round 2
- รัน `npm test`, `npm run lint`, `npm run build` และ `git diff --check`
- ตรวจ diff ว่าไม่มีการเปลี่ยนไฟล์หรือพฤติกรรมที่อยู่นอก scope
