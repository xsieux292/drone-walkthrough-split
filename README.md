# Walkthrough 3.3 · web animation (Angular)

เว็บอนิเมชันอธิบายขั้นตอน 3.3.1–3.3.6 ทำเป็น Angular component `<dw-walkthrough>` เอาไปใส่ในเว็บหลักได้
เลื่อนผ่านทีละส่วน (scroll) หรือกดทีละจังหวะ (slides) ได้

**เว็บจริง:** https://drone-walkthrough-split.vercel.app/ · แบบสไลด์: https://drone-walkthrough-split.vercel.app/?mode=slides

> **เวอร์ชันนี้ = เวอร์ชันแยกโค้ด** — แต่ละขั้นมีโฟลเดอร์ของตัวเอง ไฟล์ `step-*.ts` มีแค่ไทม์ไลน์
> ส่วนหน้าตาแต่ละชิ้นแยกอยู่ใน `parts/` (แก้ชิ้นไหนก็เปิดไฟล์ชิ้นนั้น)
> เวอร์ชันรวมโค้ด (ขั้นละ 3 ไฟล์) อยู่ที่ `../walkthrough_web/` — ทั้งสองเวอร์ชันหน้าตาและการทำงานเหมือนกัน

## ลองเปิดดู

```bash
cd walkthrough_web_split
```

```bash
npm start
```

แล้วเปิด

- http://localhost:4301/ — โหมดเลื่อน (scroll)
- http://localhost:4301/?mode=slides — โหมดสไลด์ (กดทีละจังหวะ, มีปุ่มเต็มจอ)

(เวอร์ชันนี้ใช้พอร์ต 4301 เวอร์ชันรวมใช้ 4300 เปิดพร้อมกันได้)

clone มาใหม่ ต้อง `npm install` ก่อนครั้งแรก (ต้องใช้ Node 20.19+ / 22+ ตาม Angular 22)

ปุ่มลัด: `←` `→` ทีละจังหวะ · ปุ่ม ▶ เล่น/หยุดอัตโนมัติ · คลิกหัวข้อ 3.3.x ด้านบนเพื่อกระโดด

## โครงสร้างไฟล์ (เวอร์ชันแยก)

```
projects/drone-walkthrough/
├── assets/                       ภาพ / วิดีโอที่ใช้ (copy ไปที่ assets/drone-walkthrough/)
│   ├── register/                 ภาพหน้าเว็บ nt-drone.ntplc.co.th (cap จากเว็บจริง)
│   ├── dataset/                  ภาพจาก dataset + กล่อง label (ใช้ในฉากเทรน)
│   ├── route/map.jpg             แผนที่ดาวเทียมของ route planner
│   └── flight/                   คลิปบินตัวอย่าง (ต้องเปลี่ยน)
└── src/lib/
    ├── content.default.ts        ★ ข้อความ ตัวเลข ภาพ ชื่อจังหวะ และเวลาของแต่ละจังหวะ
    ├── models.ts                 ชนิดข้อมูลของ content
    ├── config.ts                 provideDroneWalkthrough() (assetBase, ป้าย "ต้องเปลี่ยน")
    ├── walkthrough.ts/.html/.scss  ตัวหลัก: นาฬิกา, โหมด scroll/slides, ปุ่มควบคุม
    ├── shared/                   ชิ้นที่ใช้ร่วมกัน: stage, media-slot, browser-frame, cursor, tar-contents
    ├── util/                     sequencer (ตัวจับเวลา), highlight (สีโค้ด), cursor-script
    └── steps/
        ├── step-base.ts          คลาสแม่ของทุกขั้น (settle / animate)
        ├── _step-common.scss     mixin + keyframes ที่ทุกขั้นใช้
        ├── 01-register/          3.3.1 สมัคร / ตอบคำถาม
        │   ├── step-register.*       ไทม์ไลน์ + วางตำแหน่ง (ภาพเว็บ 2 หน้า, ชั้นมืด)
        │   └── parts/register-form.* การ์ดฟอร์มสมัคร (หน้า ทีม / สมาชิก / สำเร็จ)
        ├── 02-dataset/           3.3.2 รับสิทธิ์ dataset
        │   ├── step-dataset.*
        │   └── parts/hf-page.* · download-terminal.ts
        ├── 03-code/              3.3.3 เขียนโค้ด + fine-tune
        │   ├── step-code.ts
        │   └── parts/code-editor.* (ฉาก IDE) · train-viz.* (ฉากเทรน RF-DETR)
        ├── 04-route/             3.3.4 วางแผนการบิน
        │   ├── step-route.* · route-geometry.ts (พิกัดทั้งหมดบนแผนที่)
        │   └── parts/planner-map.* · planner-side.*
        ├── 05-queue/             3.3.5 รอคิว + ส่ง tar
        │   ├── step-queue.*
        │   └── parts/dashboard-nav.ts · queue-board.* · tar-upload.*
        └── 06-results/           3.3.6 บินจริง คะแนน ไฟล์
            ├── step-results.*
            └── parts/score-table.ts · result-files.ts
```

แต่ละขั้น:

| ไฟล์ | มีอะไร |
|---|---|
| `step-*.ts` | **ไทม์ไลน์อย่างเดียว**: หัวไฟล์อธิบายจังหวะ · `AT` / `CARD` / `DROP` = ตำแหน่งที่เมาส์ชี้ · `T` = เวลา (ms) · `settle()` = สภาพหลังจบแต่ละจังหวะ · `animate()` = อนิเมชันของแต่ละจังหวะ |
| `step-*.html / .scss` | วางชิ้นต่าง ๆ บนเวที 960×600 (ชิ้นไหนอยู่ตรงไหน) |
| `parts/*` | ชิ้นภาพแต่ละชิ้น **ไม่มีตัวจับเวลา** รับค่าจาก step ผ่าน `input()` อย่างเดียว หัวไฟล์ `.ts` บอกว่าแต่ละ input ทำอะไร |

## อยากแก้อะไร → แก้ที่ไหน

| อยากแก้ | ไฟล์ |
|---|---|
| ข้อความ, ชื่อจังหวะ, เวลาแต่ละจังหวะ (autoplay) | `content.default.ts` → `steps[].beats` |
| เปลี่ยนภาพเป็นวิดีโอ | `content.default.ts` → ช่อง `media` ของขั้นนั้น ตั้ง `kind: 'video'`, `src`, `poster` |
| เอาป้ายส้ม "ต้องเปลี่ยน" ออก | ลบ `todo` ในช่อง media นั้น หรือ `provideDroneWalkthrough({ showTodoBadges: false })` |
| ความเร็วอนิเมชันในจังหวะ | `step-*.ts` → `const T` |
| ตำแหน่งที่เมาส์คลิก | `step-*.ts` → `AT`, `BUTTON`, `DROP` (ต้องตรงกับตำแหน่งในไฟล์ `parts/` ของชิ้นนั้น) · ปุ่มบันทึกของ 3.3.4: `route-geometry.ts` → `SAVE_BUTTON` |
| เส้นทาง / วงโคจร / เขตห้ามบินบนแผนที่ | `04-route/route-geometry.ts` (`ROUTE`, `ORBIT`, `NO_FLY`, ...) |
| หน้าตาชิ้นใดชิ้นหนึ่ง (ฟอร์ม, หน้า HF, IDE, แผนที่, คิว, ตารางคะแนน ...) | `steps/0X-*/parts/<ชิ้นนั้น>.*` |
| ป้ายบนชิปลอย ๆ ในฉากโค้ด | `03-code/parts/code-editor.html` (ค้นคำว่า chip) |
| ชื่อชั้นในกล่อง RF-DETR / เส้นกราฟจำลอง | `03-code/parts/train-viz.html` / `train-viz.ts` (`lossAt`, `mapAt`) |
| ไฟล์ใน tar (แผนภาพ) | `content.default.ts` → `queue.tarFiles`, `queue.tarRules` · หน้าตา: `shared/tar-contents.*` |
| ตารางคะแนน / ไฟล์ที่ได้รับ | `content.default.ts` → `results.scores`, `results.files` |
| สีธีม / ฟอนต์ | ตัวแปร CSS บน `<dw-walkthrough>`: `--dw-accent`, `--dw-bg`, `--dw-fg`, `--dw-font`, ... |

## ของที่ยังต้องเปลี่ยน / ยังว่าง

| ส่วน | สถานะ |
|---|---|
| 3.3.1 ภาพหน้าเว็บ NT | cap จากเว็บจริงแล้ว (หน้าแรก + หน้ายินยอม) ถ้ามีวิดีโออัดหน้าจอ ใส่แทนได้ |
| 3.3.2 ชื่อ owner ของ dataset บน Hugging Face | ว่าง (แสดงเป็นแถบเทา) |
| 3.3.2 ภาพหน้า Hugging Face จริง | ว่าง (จังหวะที่ 5 ปิดไว้ใน content) |
| 3.3.3 กราฟ loss / mAP | ภาพจำลอง มีข้อความบอกบนจอ |
| 3.3.5 เวลาคิว | ว่าง |
| 3.3.5 ภาพ / วิดีโอหน้า dashboard จริง | กล่องว่าง |
| 3.3.6 คลิปบิน, คะแนน, ไฟล์ | ตัวอย่าง (มีป้าย "ต้องเปลี่ยน" / "ตัวอย่าง") |

## เอาไปใส่เว็บหลัก (สรุป)

1. build library: `npx ng build drone-walkthrough` → ได้ `dist/drone-walkthrough` (หรือ copy โฟลเดอร์ `src/lib` ไปใช้ตรง ๆ)
2. ใน `angular.json` ของเว็บหลัก เพิ่ม assets:
   `{ "glob": "**/*", "input": "<path>/drone-walkthrough/assets", "output": "assets/drone-walkthrough" }`
3. ใน `app.config.ts`: `provideDroneWalkthrough({ assetBase: 'assets/drone-walkthrough/', showTodoBadges: true })`
4. ในหน้า: `<dw-walkthrough mode="scroll" />` หรือ `mode="slides"`
   inputs อื่น: `content`, `autoplay`, `autoAdvance`, `showIntro`, `keyboard`, `startStep` · output: `(stepChange)`
5. ฟอนต์: IBM Plex Sans Thai + JetBrains Mono (Google Fonts) ดูตัวอย่างใน `projects/demo/src/index.html`

## Deploy (Vercel)

ขึ้นแล้วที่ https://drone-walkthrough-split.vercel.app/ (โปรเจกต์ Vercel `drone-walkthrough-split`)
โฟลเดอร์ `deploy/drone-walkthrough-split/` = สำเนาไฟล์ที่ build แล้ว + `.vercel/` (ผูกกับโปรเจกต์ไว้) อย่าลบ `.vercel/`
(โฟลเดอร์นี้ไม่ขึ้น git · clone ใหม่แล้ว deploy ครั้งแรก ให้รัน `npx vercel link` ในโฟลเดอร์นั้นแล้วเลือกโปรเจกต์ `drone-walkthrough-split` ก่อน ไม่งั้นจะได้โปรเจกต์ใหม่)

deploy ใหม่หลังแก้โค้ด (รันในโฟลเดอร์โปรเจกต์ หรือจากที่อื่นด้วย `npm --prefix <path> run deploy` · script `deploy` อยู่ใน package.json: build → copy ไป deploy/ → vercel --prod):

```bash
npm run deploy
```
