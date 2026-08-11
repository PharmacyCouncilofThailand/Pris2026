# Welcome Messages Inline Title Design

## Goal

ให้หัวข้อใหญ่ของหน้า `welcome-messages` แสดง `title1` และ `title2` ต่อกันเป็นบรรทัดเดียวบน desktop ตามภาพอ้างอิง โดยยังรองรับการตัดบรรทัดเมื่อพื้นที่หน้าจอมือถือไม่เพียงพอ

## Scope

- เปิดใช้ `inlineTitle` ที่มีอยู่แล้วใน `PageHero` เฉพาะหน้า `src/app/[locale]/welcome-messages/page.tsx`
- ปรับคลาส layout ของ `PageHero` เมื่อ `inlineTitle` เป็นจริงให้ wrap ได้บนหน้าจอเล็ก และไม่ wrap ตั้งแต่ breakpoint `md`
- ไม่เปลี่ยนข้อความแปลภาษา โครงสร้างข้อมูล speaker หรือ animation อื่นของหน้า
- คงการแก้ไขเดิมของผู้ใช้ใน `src/app/[locale]/layout.tsx` และ `src/app/globals.css`

## Approaches Considered

1. ใช้ prop `inlineTitle` ที่มีอยู่แล้ว และเพิ่ม responsive wrapping — เป็นการเปลี่ยนแปลงเล็กที่สุดและใช้ abstraction เดิม
2. รวม `title1`/`title2` เป็นข้อความเดียวในไฟล์แปลภาษา — กระทบ animation และความยืดหยุ่นของ title โดยไม่จำเป็น
3. บังคับ `white-space: nowrap` ด้วย CSS — ทำให้หัวข้อมีโอกาสล้นจอบนมือถือ

เลือกแนวทางที่ 1

## Behavior

- Desktop (`md` ขึ้นไป): title parts อยู่ใน flex row เดียวและไม่ wrap
- Mobile: title parts อยู่ใน flex row ที่ wrap ได้ จึงยังอ่านได้โดยไม่เกิด horizontal overflow
- ทุก locale ใช้ behavior เดียวกัน โดยข้อความภาษาไทยยังอยู่ภายใต้ typography baseline เดิม

## Verification

- ตรวจ diff และ `git diff --check`
- รัน ESLint สำหรับไฟล์ที่แก้ไข
- รัน production build ของ Next.js เพื่อยืนยัน TypeScript และการ compile
