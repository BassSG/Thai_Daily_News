# Thai Daily News 2.1

แอปอ่านข่าวไทยและต่างประเทศบน Android และคอมพิวเตอร์ ใช้ Google Apps Script เดิมรับ RSS ตามรอบเวลา แสดงข่าวจากฐานข้อมูลที่เตรียมไว้ และใช้ OpenRouter เดิมเมื่อเลือกสรุปเพิ่มเติม

เว็บ: https://basssg.github.io/Thai_Daily_News/

Android: https://github.com/BassSG/Thai_Daily_News/releases/latest

## เริ่มใช้งาน

1. Android: ดาวน์โหลด `Thai-Daily-News.apk` จาก Releases เปิดไฟล์และอนุญาตติดตั้งจากแหล่งที่คุณเลือก หากระบบถาม รุ่น 2.1 ติดตั้งทับรุ่น 2.0 ได้ด้วยกุญแจลงนามเดิม
2. เปิดแอป ไปที่ตั้งค่า แล้วเลือกเปิดการแจ้งเตือนและอนุญาตใน Android เลือกหมวด ข่าวสำคัญ และช่วงพักกลางคืนได้
3. เพิ่มวิดเจ็ตจากหน้าตั้งค่าในแอป หรือกดค้างบนหน้าจอหลัก → วิดเจ็ต → Thai Daily News มี 2×2, 4×2 และ 4×4 แต่ละชิ้นเลือกหมวด ข่าวล่าสุด/ข่าวสำคัญ/บันทึกไว้ และธีมได้ ปรับขนาดบนหน้าจอหลักต่อได้
4. คอมพิวเตอร์: เปิดเว็บด้วย Chrome/Edge แล้วติดตั้งจากปุ่มในแอป หรือเมนูเบราว์เซอร์ → ติดตั้งเว็บไซต์เป็นแอป
5. การแจ้งเตือนเว็บต้องเปิดจากเบราว์เซอร์ที่รองรับ Web Push และอนุญาตการแจ้งเตือนก่อน

Android ใช้งานได้ตั้งแต่ Android 8 ขึ้นไป การตรวจข่าวเบื้องหลังเริ่มจากรอบประมาณ 15 นาทีตาม JobScheduler และอาจช้าลงตามโหมดประหยัดแบตเตอรี่/การจัดการแอปของผู้ผลิต การ force-stop แอปจะหยุดงานเบื้องหลังจนกว่าจะเปิดแอปอีกครั้ง วิดเจ็ตมีปุ่มอัปเดตและแสดงเวลาข้อมูลล่าสุด

## ระบบข่าว

- รับ RSS 13 ฟีด จาก InfoQuest, มติชน, ข่าวสด, THE STANDARD, Bangkok Post, BBC, Al Jazeera และ Google News RSS เสริม แยกหมวดการเมือง สังคม อาชญากรรม เศรษฐกิจ ต่างประเทศ และเทคโนโลยี
- รูปข่าวรับจาก Media RSS, enclosure และรูปในข้อความย่อของฟีด หากแหล่งตรงที่รองรับไม่มีรูปในฟีด จะอ่านเฉพาะ Open Graph/Twitter image metadata จากหน้าข่าว สูงสุด 8 หน้าต่อรอบและพักลองซ้ำ 6 ชั่วโมง ไม่ดึงเนื้อหาเต็มมาแสดง ไม่ใช้ API ค้นหารูปแบบเสียเงิน ไม่ใช้รูปสต็อกแทนข่าว
- แสดงรูปใหญ่ในข่าวเด่น ภาพย่อในรายการ และภาพพร้อมเครดิตในหน้ารายละเอียด โหลดภาพย่อเมื่อใกล้หน้าจอ เก็บเฉพาะ URL ภาพใน GAS; ภาพจริงโหลดจากสำนักข่าว หากไม่มีรูปหรือโหลดไม่ได้ยังอ่านข่าวแบบข้อความได้
- Google News RSS เป็นช่องทางเสริมที่ไม่มี SLA ที่ยืนยันสำหรับแอปนี้ สถานะแต่ละแหล่งแสดงในหน้าตั้งค่า
- ตัวรับข่าวตรวจทุก 5 นาที แต่ละฟีดมีรอบ 5–15 นาที เก็บ metadata ล่าสุดไม่เกิน 72 ชั่วโมง/360 ข่าว และลดจำนวนอัตโนมัติตามพื้นที่ Script Properties
- ข้อมูลเก็บเป็น gzip/base64 แบบแบ่งส่วนและสลับชุดหลังเขียนสำเร็จ ข้อผิดพลาดของแหล่งหนึ่งไม่ลบข่าวที่เก็บไว้
- ไม่เรียก Brave ในเส้นทางรับข่าว เปิดอ่าน ค้นหา หรือรีเฟรชหน้าอ่าน
- แสดงหัวข้อ/ข้อความย่อและเครดิตสำนักข่าว เนื้อหาเต็มเปิดที่ต้นฉบับ ไม่มีการดึงทั้งเว็บไซต์ผ่าน public proxy
- สรุป/แปลภาษาไทยผ่าน OpenRouter ใช้ `OPENROUTER_API_KEY` และ `ANALYZE_MODEL_PRI` ใน Script Properties เดิม จำกัดคำขอสรุปใหม่รวม 10 ครั้งต่อวัน และเก็บผลเพื่ออ่านซ้ำ แสดงขอบเขตว่าสรุปจากหัวข้อ/ข้อความย่อ
- Desktop Web Push ใช้ VAPID และข้อความ push แบบไม่มี payload; service worker พยายามโหลดข่าวล่าสุดเพื่อประกอบการแจ้งเตือน หากโหลดไม่ได้แสดงข้อความทั่วไปที่ไม่แต่งรายละเอียด
- Android มี cache ในเครื่อง, native notifications, native AppWidgets, native share และ background JobScheduler ส่วนหน้าอ่านใช้ web UI ที่บรรจุใน APK และเรียก GAS ผ่าน HTTPS ฝั่ง Android

## พัฒนาและตรวจสอบ

```sh
npm ci
npm run build
npm test
npm run preview
```

`npm run build` สร้างไอคอน, GAS HTML, crypto bundle และสำเนา web assets สำหรับ Android จาก source หลัก ตัวทดสอบ Node ตรวจวันข่าว, URL, dedup, ลำดับความใหม่, ตัวกรองแจ้งเตือน และลายเซ็น ES256

Android ใช้ Java 17, Gradle 8.13, AGP 8.11.1 และ compile/target SDK 36 Workflow `Android application` สร้าง release APK ที่เซ็นด้วยกุญแจประจำแอป พร้อม lint และ smoke test บน Android emulator ตรวจ API จริง หน้าอ่าน รายละเอียด บันทึก การตั้งค่า วิดเจ็ตสามขนาด และแจ้งเตือนทดสอบ

## ปรับ GAS

ตั้งค่า `.clasp.json` ส่วนตัวให้ชี้ script เดิมและ `rootDir: "gas"` แล้วใช้ `clasp push` สร้าง version และอัปเดต deployment เดิมให้ตรงกัน หน้า GitHub และ native Android ใช้ deployment URL เดียวที่อยู่ใน `config.js` และ `NewsRepository.java`

ฟังก์ชันติดตั้ง/ตัวรับข่าวภายในลงท้าย `_` เพื่อปิดการเรียกจาก `google.script.run` ทริกเกอร์เรียก `refreshNewsScheduled_` ไม่ต้องรันติดตั้งซ้ำในการแก้ UI ปกติ

ไฟล์ `.private/`, `.clasp.json`, และ `gas/PrivateBootstrap.js` ไม่เข้า Git กุญแจลงนาม APK เก็บในเครื่องเจ้าของและ GitHub Secrets ห้ามเปลี่ยนกุญแจในรุ่นถัดไปหากต้องการติดตั้งอัปเดตทับ การติดตั้งครั้งแรกใช้ bootstrap token ส่วนตัวแบบใช้ครั้งเดียว หลังติดตั้งต้องแทนที่ PrivateBootstrap ด้วย implementation ที่ปิดใช้งานแล้วและ deploy version ใหม่

## ภาพลักษณ์

โลโก้ใหม่สร้างด้วย built-in ImageGen สำหรับแอปนี้ ไฟล์ต้นฉบับ `assets/logo-master.png` และไอคอนแพลตฟอร์มสร้างจากไฟล์เดียวกัน โทน Midnight Navy/Champagne Gold และ Ivory

โลโก้รุ่นใหม่ใช้สัญลักษณ์แผ่นข่าวทรงเรขาคณิตสี Ivory สองแผ่นและจุด Champagne บนพื้น Midnight Navy ไฟล์ต้นฉบับสร้างใหม่ด้วย ImageGen และย่อขนาดสำหรับแต่ละแพลตฟอร์ม

Prompt: Contemporary premium mobile news application icon. One bold minimal abstract symbol: two offset ivory geometric editorial panes with a small champagne square, on solid midnight navy. Precise modern geometry, confident negative space, flat vector-like finish, recognizable at tiny sizes, centered inside adaptive icon safe area. No letters, no newspaper illustration, no RSS arcs, no paper plane, no gradients, no metallic effects, no words or watermark.
