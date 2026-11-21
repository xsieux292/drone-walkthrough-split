import { WalkthroughContent } from './models';

/**
 * Default Thai content. The host site can pass its own object to <dw-walkthrough [content]>,
 * usually built as { ...DW_DEFAULT_CONTENT, results: { ...DW_DEFAULT_CONTENT.results, scores: [...] } }.
 *
 * Anything with `todo:` is placeholder media that must be replaced (it shows an orange badge).
 * Empty strings / null values are deliberately blank: no data yet.
 */
export const DW_DEFAULT_CONTENT: WalkthroughContent = {
  eyebrow: '', // small badge above the title; empty = hidden
  title: 'ขั้นตอนการเข้าร่วมการแข่งขัน',
  lead: 'ภาพรวมกระบวนการตั้งแต่การสมัครจนถึงการรับผลคะแนน เลื่อนไปทางซ้ายหรือกดลูกศรเพื่อดูขั้นตอนถัดไป และกด ▶ เพื่อเล่นอัตโนมัติ',

  steps: [
    {
      id: 'register',
      number: '1',
      title: 'การสมัครเข้าร่วมการแข่งขัน',
      description: 'ทีมผู้สมัครลงทะเบียนผ่านเว็บไซต์ nt-drone.ntplc.co.th โดยให้ความยินยอมในการจัดเก็บเอกสาร กรอกข้อมูลทีม อาจารย์ที่ปรึกษา และสมาชิก พร้อมตอบคำถามด้านทักษะและประสบการณ์ จากนั้นยืนยันการลงทะเบียน',
      beats: [
        { label: 'เข้าสู่เว็บไซต์และเลือก "สมัครแข่งขัน"', ms: 3200 },
        { label: 'ให้ความยินยอมในการจัดเก็บเอกสาร', ms: 2800 },
        { label: 'กรอกข้อมูลทีมและอาจารย์ที่ปรึกษา', ms: 4000 },
        { label: 'กรอกข้อมูลสมาชิกและตอบคำถามด้านทักษะ', ms: 3800 },
        { label: 'ยืนยันการลงทะเบียน', ms: 3000 },
      ],
    },
    {
      id: 'dataset',
      number: '2',
      title: 'การขอสิทธิ์เข้าถึงชุดข้อมูล',
      description: 'เมื่อผ่านการคัดเลือก ทีมยื่นขอสิทธิ์เข้าถึงชุดข้อมูลบน Hugging Face และดาวน์โหลดชุดข้อมูลภาพรถบรรทุกสำหรับใช้ในการพัฒนาโมเดล',
      beats: [
        { label: 'เปิดหน้าชุดข้อมูลบน Hugging Face', ms: 2800 },
        { label: 'ยอมรับเงื่อนไขการเข้าถึงชุดข้อมูล', ms: 3200 },
        { label: 'ได้รับสิทธิ์และตรวจสอบรายการไฟล์', ms: 3600 },
        { label: 'ดาวน์โหลดชุดข้อมูล', ms: 3600 },
        // To show a real screenshot as a 5th beat: set dataset.media below, then add
        // { label: 'ภาพหน้าจริง', ms: 3400 },
      ],
    },
    {
      id: 'code',
      number: '3',
      title: 'การพัฒนาและฝึกสอนโมเดล',
      description: 'ทีมพัฒนาสคริปต์สำหรับฝึกสอน (fine-tune) โมเดลตรวจจับวัตถุที่ทีมเลือกใช้ด้วยชุดข้อมูลที่ได้รับ และพัฒนาไฟล์ my_agent.py เพื่อให้ระบบควบคุมโดรนเรียกใช้โมเดลระหว่างการบิน',
      beats: [
        { label: 'พัฒนาสคริปต์ฝึกสอน train.py', ms: 5200 },
        { label: 'พัฒนาไฟล์ my_agent.py', ms: 5600 },
        { label: 'นำเข้าชุดข้อมูลสู่โมเดล', ms: 3600 },
        { label: 'ฝึกสอนโมเดลตามจำนวน epoch ที่กำหนด', ms: 6000 },
        { label: 'บันทึกไฟล์ weights ของโมเดล', ms: 3000 },
      ],
    },
    {
      id: 'route',
      number: '4',
      title: 'การวางแผนเส้นทางการบิน',
      description: 'ทีมกำหนดเส้นทางการบินผ่านเว็บไซต์ Route Planner โดยระบบตรวจสอบความสอดคล้องกับกติกาแบบทันที ได้แก่ ขอบเขตสนาม เขตห้ามบิน ระดับความสูง และเวลาบิน จากนั้นบันทึกเป็นไฟล์ mission.kml',
      beats: [
        { label: 'เลือกเครื่องมือกำหนดเส้นทาง', ms: 2400 },
        { label: 'กำหนดจุดอ้างอิงบนแผนที่', ms: 4200 },
        { label: 'กำหนดเส้นทางวงรอบพื้นที่เป้าหมาย', ms: 3200 },
        { label: 'ตรวจสอบความสอดคล้องกับกติกา', ms: 3000 },
        { label: 'บันทึกไฟล์ mission.kml', ms: 2800 },
      ],
    },
    {
      id: 'queue',
      number: '5',
      title: 'การรอคิวและส่งไฟล์ผลงาน',
      description: 'เมื่อถึงช่วงเวลาที่ได้รับการจัดสรร ทีมอัปโหลดไฟล์ tar ซึ่งประกอบด้วยซอร์สโค้ด ไฟล์ weights และ mission.kml ผ่านหน้า dashboard จากนั้นระบบตรวจสอบไฟล์และ build โดยอัตโนมัติ',
      beats: [
        { label: 'รอคิวตามช่วงเวลาที่จัดสรร', ms: 4200 },
        { label: 'ถึงคิวของทีม', ms: 2400 },
        { label: 'อัปโหลดไฟล์ tar ผ่าน dashboard', ms: 3800 },
        { label: 'ระบบตรวจสอบไฟล์และ build', ms: 4200 },
        { label: 'ตัวอย่างหน้า dashboard', ms: 4000 },
      ],
    },
    {
      id: 'results',
      number: '6',
      title: 'การบินจริงและการประกาศผล',
      description: 'โดรนปฏิบัติภารกิจตามโค้ดและเส้นทางของทีม เมื่อเสร็จสิ้น ทีมจะได้รับตารางคะแนนและไฟล์ผลการบินสำหรับการตรวจสอบ',
      beats: [
        { label: 'การบินปฏิบัติภารกิจ', ms: 7000 },
        { label: 'สรุปผลคะแนน', ms: 4200 },
        { label: 'ไฟล์ผลลัพธ์ที่ได้รับ', ms: 4000 },
      ],
    },
  ],

  register: {
    // Screens captured from https://nt-drone.ntplc.co.th on 2026-11-20 (1600×1000, cropped to 1440×826).
    url: 'nt-drone.ntplc.co.th',
    registerUrl: 'nt-drone.ntplc.co.th/register',
    teamName: 'team07',
    media: {
      kind: 'image',
      src: 'register/nt-site-home.jpg',
      alt: 'หน้าแรกเว็บไซต์ NT Drone Competition 2026',
    },
    consentMedia: {
      kind: 'image',
      src: 'register/nt-register-consent.jpg',
      alt: 'หน้าความยินยอมในการเก็บเอกสารสมัคร',
    },
  },

  dataset: {
    owner: '',
    repo: 'nt-drone-competition-dataset',
    license: 'nt-drone restricted competition license',
    files: [
      { name: '.gitattributes', size: '2.5 kB' },
      { name: 'LICENSE', size: '9.42 kB' },
      { name: 'LICENSE.txt', size: '9.42 kB' },
      { name: 'README.md', size: '4.2 kB' },
      { name: 'nt-drone-truck-dataset_v2.zip', size: '' },
    ],
    downloadCommand: 'hf download <org>/nt-drone-competition-dataset --repo-type dataset --local-dir data',
    // Empty: the mock page above is the picture. Put a clean screenshot here (no personal account names)
    // and add the 'ภาพหน้าจริง' beat to show it over the mock.
    media: {
      kind: 'none',
      alt: 'หน้า dataset บน Hugging Face',
    },
  },

  code: {
    files: [
      {
        name: 'train.py',
        lang: 'python',
        code: `from your_model import YourModel   # the detector your team chooses

# fine-tune on the competition truck dataset
model = YourModel(pretrained=True)
model.train(
    data="data/truck_dataset",
    epochs=30,
    batch_size=8,
    lr=1e-4,
    output_dir="runs/truck",
)
model.save("runs/truck/model.pth")   # -> put model.pth in the tar`,
      },
      {
        name: 'my_agent.py',
        lang: 'python',
        code: `class MyDetector(Detector):
    def load(self, weights="model.pth", conf=0.3, **options):
        from your_model import YourModel   # import heavy libraries here
        self.model = YourModel.load(os.path.join(HERE, weights))
        self.conf = conf

    def detect(self, image, hint=None):
        boxes, scores = self.model.predict(image)
        return [Detection("truck", float(s), tuple(map(float, b)))
                for b, s in zip(boxes, scores) if s >= self.conf]`,
      },
    ],
    terminal: ['$ python train.py', 'loading dataset … train 3,848 · valid 481 · test 482', 'model YourModel (pretrained) · device cuda:0 · batch 8'],
    train: {
      model: 'Your Model', // shown on the model block; keep generic (do not reveal a specific architecture)
      epochs: 30,
      metricsAreIllustrative: true,
      weightsName: 'model.pth',
      images: [
        { src: 'dataset/truck_0000.jpg', boxes: [[0.4996, 0.6243, 0.1664, 0.2208]] },
        { src: 'dataset/truck_0200.jpg', boxes: [[0.4723, 0.5687, 0.1148, 0.1986]] },
        { src: 'dataset/truck_0400.jpg', boxes: [[0.4766, 0.566, 0.1203, 0.1819]] },
        { src: 'dataset/truck_1000.jpg', boxes: [[0.4441, 0.6965, 0.232, 0.2986]] },
        { src: 'dataset/truck_1200.jpg', boxes: [[0.4953, 0.5472, 0.1156, 0.1639]] },
        { src: 'dataset/truck_1600.jpg', boxes: [[0.5375, 0.5847, 0.1297, 0.2667]] },
        { src: 'dataset/truck_1800.jpg', boxes: [[0.4926, 0.625, 0.1508, 0.1694]] },
        { src: 'dataset/truck_2400.jpg', boxes: [[0.509, 0.6292, 0.068, 0.2556]] },
        { src: 'dataset/truck_2800.jpg', boxes: [[0.532, 0.5861, 0.1313, 0.1861]] },
        { src: 'dataset/truck_3200.jpg', boxes: [[0.507, 0.5806, 0.1844, 0.3]] },
        { src: 'dataset/truck_3400.jpg', boxes: [[0.4437, 0.616, 0.1328, 0.2208]] },
        { src: 'dataset/truck_4400.jpg', boxes: [[0.5223, 0.5813, 0.1992, 0.2347]] },
      ],
    },
  },

  route: {
    siteName: 'chiangrai-high',
    timeLimitS: 900,
    ceilingM: 110,
    map: { kind: 'image', src: 'route/map.jpg', alt: 'ภาพดาวเทียมสนาม chiangrai-high' },
    attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
  },

  queue: {
    teamName: 'team07',
    slotLabel: '',
    queue: [
      { team: 'team03', status: 'flying' },
      { team: 'team05', status: 'waiting' },
      { team: 'team07', status: 'waiting', you: true },
      { team: 'team09', status: 'waiting' },
      { team: 'team11', status: 'waiting' },
    ],
    tarName: 'team07.tar',
    // From competition_base_demo/manual/manual.tex, section "ไฟล์ใน tar ของคุณ (5 ไฟล์หลัก)".
    tarFiles: [
      { name: 'Dockerfile', note: 'ใช้ตามตัวอย่าง **ไม่ต้องแก้**', emphasis: 'plain' },
      { name: 'requirements.txt', note: 'ไลบรารีของโมเดลที่คุณใช้', emphasis: 'lib' },
      { name: 'my_agent.py', note: '**โค้ดของคุณ (ไฟล์หลักที่แก้)**', emphasis: 'main' },
      { name: 'mission.kml', note: 'ของกรรมการ · แก้ได้เฉพาะโฟลเดอร์ `team`', emphasis: 'rules' },
      { name: '<weights> (ชื่อใดก็ได้)', note: 'ไฟล์น้ำหนักโมเดลของคุณ', emphasis: 'lib' },
      { name: 'ไฟล์ / โฟลเดอร์โค้ดอื่น', note: '**เพิ่มได้ตามต้องการ** (ไม่บังคับ) ชื่อใดก็ได้', emphasis: 'optional' },
    ],
    tarRules: ['`my_agent.py` ต้องมี class ที่สืบทอด `Agent` **หนึ่ง class เท่านั้น**', 'ขนาด tar ไม่เกิน 200 MB · ไฟล์ธรรมดาเท่านั้น (ไม่มี symlink)'],
    buildChecks: ['ตรวจไฟล์ใน tar ครบ', 'ตรวจ mission.kml (กติกาไม่ถูกแก้)', 'docker build', 'ทดสอบ agent เริ่มทำงาน'],
    // Empty on purpose: drop in a screenshot (kind: 'image') or a screen recording (kind: 'video') of the real dashboard.
    dashboardMedia: {
      kind: 'none',
      alt: 'หน้า dashboard จริง',
    },
  },

  results: {
    video: {
      kind: 'video',
      src: 'flight/sample-flight.mp4',
      poster: 'flight/sample-flight-poster.jpg',
      caption: 'มุมกล้องโดรน พร้อมกรอบรถบรรทุกที่โมเดลตรวจเจอ',
      todo: 'คลิปทดสอบในซิมวันที่ 2026-09-29 · เปลี่ยนเป็นคลิปบินจริงสั้นๆ',
    },
    scoresAreSample: true,
    scores: [
      { label: 'การตรวจจับรถบรรทุก', value: 62.4, max: 70, note: 'ความแม่นของกรอบเทียบกับตำแหน่งจริง' },
      { label: 'การบินตามแผน', value: 24, max: 30, note: 'ครบเส้นทาง ภายในเวลา' },
      { label: 'หักคะแนน', value: 0, max: null, note: 'บินออกนอกสนาม / เข้าเขตห้ามบิน' },
    ],
    files: [
      { name: 'detections.mp4', description: 'วิดีโอมุมกล้องพร้อมกรอบที่ตรวจจับ' },
      { name: 'panel.log', description: 'บันทึกการบินและคำสั่งทุกจังหวะ' },
      { name: 'meta.json', description: 'ข้อมูลรอบบิน (ทีม เวลา แผนที่)' },
      { name: 'score.json', description: 'รายละเอียดคะแนนรายข้อ' },
    ],
  },
};
