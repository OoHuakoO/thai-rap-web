# THAI-RAP Full-Stack Spec (FE + BE)
> อ้างอิง: 7 รูปหน้าจอจริง + Story Doc + แบบ 50 ข้อ + ระบบ THAI-RAP Restaurant Survival Diagnostic System
> Version: 1.1 | ใช้ให้ AI dev ได้ทันที

## ภาพรวมระบบ

**THAI-RAP Restaurant Survival + Digital Portfolio + Export Product + OKR System**

ระบบดิจิทัลสำหรับบริหารจัดการและติดตามการพัฒนาผู้ประกอบการร้านอาหารไทยภาคตะวันออก ภายใต้แนวคิด "ทำร้านให้รอด → ทำร้านให้โต → ทำสินค้าให้ไปตลาด → ทำธุรกิจให้ขยายได้"

กระบวนการหลัก: **เช็ค → วิเคราะห์ → พัฒนา → พิสูจน์ → รายงาน**

---

## PART A — OVERVIEW

### A1. Tech Stack

| Layer | เลือกใช้ |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts (Radar, Bar, Donut) |
| State | Zustand + React Query (TanStack) |
| Backend | Node.js + Express (หรือ Next.js API Routes) |
| Database | PostgreSQL + Prisma ORM |
| File Storage | S3-compatible (AWS S3 / MinIO) |
| Auth | NextAuth.js (JWT + Role-based) |
| Export | pdf-lib (PDF) + ExcelJS (XLSX) |
| Hosting | Vercel (FE) + Railway / Render (BE + DB) |

### A2. Design Tokens

```css
--color-primary:       #F17128;   /* orange — CTA, active, buttons */
--color-primary-light: #FFF0E5;   /* light orange bg */
--color-accent:        #6B3FA0;   /* purple — headings, T0 round, pills */
--color-success:       #27AE60;
--color-danger:        #E74C3C;
--color-warning:       #F58544;
--color-info:          #2980B9;
--zone-red:            #E74C3C;
--zone-survival:       #F58544;   /* 40-59 Survival Zone */
--zone-improve:        #3498DB;
--zone-growth:         #27AE60;
--zone-model:          #8E44AD;
--sidebar-bg:          #58595B;
--sidebar-text:        #FFFFFF;
--color-bg:            #F5F6FA;
--color-card:          #FFFFFF;
--color-border:        #E0E0E0;
--font-th:             'Sarabun', sans-serif;
--radius-card:         12px;
--shadow-card:         0 2px 8px rgba(0,0,0,0.08);
```

### A3. Routes & Pages

| Route | หน้า | Image ref |
|---|---|---|
| `/` | Dashboard ภาพรวม | Image 2 |
| `/stores` | ข้อมูลร้านอาหาร | Image 4 |
| `/assessment/[storeId]/[round]` | แบบประเมินร้าน | Image 1 |
| `/analytics` | วิเคราะห์ศักยภาพ | Image 6 |
| `/field-audit/[storeId]` | Field Audit ลงพื้นที่ | — |
| `/portfolio/[storeId]` | Digital Portfolio 8 มิติ | — |
| `/export-products/[storeId]` | ผลิตภัณฑ์ส่งออก | — |
| `/pitching` | คะแนน Pitching | Image 7 |
| `/ranking` | Ranking คัดเลือก | — |
| `/okr` | OKR/KR Dashboard | — |
| `/reports` | รายงานและส่งออก | Image 3 |
| `/users` | ผู้ใช้งานและสิทธิ์ | Image 5 |

---

## PART B — GLOBAL LAYOUT

### B1. Top Bar (ทุกหน้า)

```tsx
<TopBar>
  <PartnerLogos>
    {/* 8 org logos: center-aligned, height 40px each */}
    {/* มหาวิทยาลัย, nfi, FoodInnopolis, NSTDA, FIN, etc. */}
  </PartnerLogos>
  <RightSection>
    <NotificationBell count={3} />
    <UserDropdown
      avatar={url}
      name="นางสาวศิริวรรณ จันทร์ดี"
      role="ผู้ดูแลระบบ (Admin)"
    />
  </RightSection>
</TopBar>
```

**Height:** 64px | Background: white | Shadow: bottom border 1px

### B2. Sidebar (ทุกหน้า)

```tsx
<Sidebar collapsible defaultOpen={true}>
  <Logo src="/thai-rap-logo.svg" />
  <IconGrid icons={[...4 category icons]} />

  <NavItem icon={HomeIcon}      label="ภาพรวมโครงการ"     href="/"                />
  <NavItem icon={StoreIcon}     label="ข้อมูลร้านอาหาร"    href="/stores"          />
  <NavItem icon={ClipboardIcon} label="แบบประเมินร้าน"     href="/assessment"      />
  <NavItem icon={ChartIcon}     label="วิเคราะห์ศักยภาพ"  href="/analytics"       />
  <NavItem icon={SearchIcon}    label="Field Audit"         href="/field-audit"     />
  <NavItem icon={FolderIcon}    label="Digital Portfolio"   href="/portfolio"       />
  <NavItem icon={BoxIcon}       label="ผลิตภัณฑ์ส่งออก"    href="/export-products" />
  <NavItem icon={TrophyIcon}    label="คะแนนพิชชิ่ง"       href="/pitching"        />
  <NavItem icon={MedalIcon}     label="Ranking"             href="/ranking"         />
  <NavItem icon={TargetIcon}    label="OKR Dashboard"       href="/okr"             />
  <NavItem icon={FileIcon}      label="รายงานและส่งออก"    href="/reports"         />
  <NavItem icon={UsersIcon}     label="ผู้ใช้งานและสิทธิ์" href="/users"           />

  <SidebarFooter>
    <ManualLink href="/manual" />
    <CollapseButton />
  </SidebarFooter>
</Sidebar>
```

**Width:** 220px open / 64px collapsed
**Active state:** orange bg (#F17128), white text, rounded-r-lg

### B3. Page Header (ทุกหน้า)

```tsx
<PageHeader>
  <H1 color="purple">หน่วยบริหารเครือข่าย การพัฒนาผู้ประกอบการธุรกิจอาหาร ในภูมิภาค ภาคตะวันออก</H1>
  <H2>ภายใต้โครงการการสร้างผู้ประกอบการร้านอาหารไทยมืออาชีพ</H2>
  <Meta>• ประจำปีงบประมาณ พ.ศ. 2569</Meta>
  <University>มหาวิทยาลัยราชภัฏราไพพรรณี จังหวัดจันทบุรี</University>
</PageHeader>
```

---

## PART C — PAGE SPECS

---

### C1. Dashboard ภาพรวมโครงการ (Image 2)

#### C1.1 KPI Cards Row (6 cards)

```tsx
interface DashboardKPI {
  totalStores: number;        // 312 ร้าน / เป้าหมาย 400
  t0Completed: number;        // 289 ร้าน (92.63%)
  t1Completed: number;        // 176 ร้าน (56.41%)
  selectedStores: number;     // 48 ร้าน (15.38%)
  avgScore: number;           // 72.34 คะแนน
  improvementRate: string;    // "+18.57%" สีส้ม
}
```

**Card layout:** icon circle (orange/purple) + big number + subtitle + progress bar หรือ %

| Card | Icon color | Value | Sub |
|---|---|---|---|
| จำนวนร้านเข้าร่วม | orange | 312 | เป้าหมาย 400 ร้าน |
| ประเมินแล้ว T0 | orange | 289 | 92.63% |
| ประเมินแล้ว T1 | orange | 176 | 56.41% |
| ร้านผ่านเข้ารอบ | purple | 48 | 15.38% |
| คะแนนเฉลี่ยโครงการ | purple star | 72.34 | จาก 100 คะแนน |
| อัตราพัฒนา (T1-T0) | green | +18.57% | เพิ่มขึ้น |

#### C1.2 Three-column section

**Left — Donut Chart: กระจายตัวของร้านตามจังหวัด**

```tsx
<DonutChart
  title="การกระจายตัวของร้านอาหารตามจังหวัด (ภาคตะวันออก)"
  data={[
    { label: 'จันทบุรี', value: 98, pct: 31.4, color: '#F17128' },
    { label: 'ชลบุรี',   value: 82, pct: 26.3, color: '#F58544' },
    { label: 'ระยอง',    value: 61, pct: 19.6, color: '#8E44AD' },
    { label: 'ตราด',     value: 38, pct: 12.2, color: '#3498DB' },
    { label: 'ฉะเชิงเทรา', value: 33, pct: 10.6, color: '#F58544' },
  ]}
  centerLabel="312 ร้าน"
  note="ข้อมูล ณ วันที่ 20 พฤษภาคม 2569"
/>
```

**Center — Top 20 Table**

```
อันดับ | ชื่อร้าน | จังหวัด | ประเภทอาหาร | คะแนน T1
1. บ้านริมน้ำ จันทบุรี | จันทบุรี | อาหารไทย | 92.45
2. ครัวทะเลสด        | ชลบุรี  | อาหารทะเล | 91.12
...
```

`[ดูรายชื่อทั้งหมด 20 ร้าน →]` link

**Right — Incubation Progress Stepper**

```tsx
<StepProgress
  steps={[
    { label: 'คัดกรองเบื้องต้น', count: 312, pct: '100%' },
    { label: 'ประเมิน T0',       count: 289, pct: '92.63%' },
    { label: 'พัฒนาศักยภาพ',    count: 212, pct: '67.95%' },
    { label: 'ประเมิน T1',       count: 176, pct: '56.41%' },
    { label: 'ผ่านเข้ารอบ',      count: 48,  pct: '15.38%' },
  ]}
/>
```

#### C1.3 Bottom Three-column section

**Left — Grouped Bar Chart: เปรียบเทียบผลคะแนนเฉลี่ย (T0 vs T1) รายจังหวัด**

```tsx
// 5 จังหวัด, 2 bars each (T0=purple, T1=orange)
// จันทบุรี: T0=62.10, T1=75.80
// ชลบุรี:   T0=63.54, T1=76.92
// ระยอง:    T0=61.33, T1=73.89
// ตราด:     T0=60.28, T1=72.11
// ฉะเชิงเทรา: T0=59.41, T1=70.44
```

**Center — กิจกรรมล่าสุด / ติดตามเร่งด่วน**

```tsx
interface ActivityItem {
  type: 'warning' | 'event' | 'announcement';
  title: string;
  description: string;
  date: string;
  urgent: boolean;
}
```

Items:
- ⚠️ ร้านอาหาร 36 ร้าน ยังไม่ประเมิน T1
- 📅 กิจกรรมอบรมหลักสูตรการจัดการต้นทุน
- 📢 อัปเดตเกณฑ์การประเมินโครงการ ปี 2569

**Right — เอกสาร/รายงาน และสถานะการส่งออก**

ตาราง: ชื่อรายงาน | รูปแบบ | วันที่สร้าง | สถานะ | จัดการ

---

### C2. ข้อมูลร้านอาหาร — Restaurant Profiles (Image 4)

#### C2.1 Filter + Action Bar

```tsx
<FilterBar>
  <SearchInput placeholder="ค้นหาชื่อร้าน, เจ้าของ, เบอร์โทร..." />
  <ProvinceSelect />
  <StoreTypeSelect />
  <StatusSelect />
  <AddStoreButton />   {/* orange, right-aligned */}
</FilterBar>
```

#### C2.2 Store Table (left ~60%)

**Columns:** thumbnail | ชื่อร้าน | จังหวัด | ประเภท | สถานะ | คะแนนล่าสุด | ผู้ประเมิน | การจัดการ

**Status badges:**
```
ประเมิน T1 แล้ว  → purple pill
ประเมิน T0 แล้ว  → orange pill
ผ่านเข้ารอบ      → green pill
ลงทะเบียนแล้ว   → gray pill
```

**Row actions:** 👁 ดู | ✏️ แก้ไข | ⋮ เพิ่มเติม

**Pagination:** แสดง 1-8 จาก 167 ร้าน + page controls + rows-per-page select

**Active row:** orange left border highlight

#### C2.3 Store Quick View Panel (right ~40%, slide-in on row click)

```tsx
<StoreQuickView>
  <Header>
    <StoreThumbnail />
    <StoreName>บ้านริมน้ำ จันทบุรี</StoreName>
    <StatusBadge>ประเมิน T1 แล้ว</StatusBadge>
    <LocationTag>จันทบุรี | อาหารไทย</LocationTag>
  </Header>

  <DocumentSection title="เอกสารที่อัปโหลด">
    {/* PDF, XLS, DOCX thumbnails + labels */}
    {/* สำเนาประกาศ.pdf | ใบอนุญาต.xlsx | แบบฟอร์มข้อมูลร้าน.docx */}
  </DocumentSection>

  <FoodPhotos photos={photos} showCount="+12 ดูทั้งหมด" />

  <OwnerInfo>
    <Field label="เจ้าของร้าน">คุณสมชาย ร่มเย็น</Field>
    <Field label="เบอร์โทร">081-234-5678</Field>
    <Field label="อีเมล">banrimnam.cbt@gmail.com</Field>
    <Field label="ที่อยู่">12/3 หมู่ 2 อ.เมืองจันทบุรี...</Field>
    <SocialLinks platforms={['facebook','line','google-maps']} />
    <Field label="ยอดขายเฉลี่ย/เดือน">120,000–150,000 บาท</Field>
  </OwnerInfo>

  <ProblemGoalSection>
    <Field label="ปัญหาสำคัญ">การบริหารต้นทุนวัตถุดิบสูง, การตลาดออนไลน์ยังน้อย</Field>
    <Field label="เป้าหมายการพัฒนา">เพิ่มยอดขาย 20% ภาย 6 เดือน...</Field>
  </ProblemGoalSection>

  <ProjectTimeline>
    <Step done label="ลงทะเบียนร้านอาหาร" date="12 มิ.ย. 2569" />
    <Step done label="ประเมิน T0" date="18 มิ.ย. 2569" />
    <Step done label="ประเมิน T1" date="20 พ.ค. 2569" />
    <Step pending label="รอประกาศผลการคัดเลือก" />
  </ProjectTimeline>
</StoreQuickView>
```

#### C2.4 Bottom Summary Bar

```
จำนวนร้านทั้งหมด: 312 (เป้าหมาย 400, 78%)
ร้านที่ประเมินแล้ว T0: 289 (92.63%)
ร้านที่ประเมินแล้ว T1: 176 (56.41%)
ร้านที่ผ่านเข้ารอบ: 48 (15.38%)
[Map: กระจายตัวรายจังหวัด]
```

---

### C3. แบบประเมินร้าน — Restaurant Assessment (Image 1)

#### C3.1 Filter Bar

```tsx
<AssessmentFilterBar>
  <RestaurantSelect
    value="บ้านริมน้ำ จันทบุรี"
    avatar={true}
    searchable={true}
  />
  <ProvinceSelect value="จันทบุรี" />
  <RoundRadioGroup
    options={['T0','T1','T2','T3','T4']}
    active="T0"
    activeStyle="purple-filled"
  />
  <ProgressBar
    label="ความคืบหน้าการประเมิน"
    value={62}
    color="orange"
  />
  <SaveDraftButton icon={<FloppyIcon />} variant="outline" />
  <SaveNextButton icon={<ArrowIcon />} variant="orange-filled">
    บันทึกและถัดไป
  </SaveNextButton>
</AssessmentFilterBar>
```

#### C3.2 Left Panel — 8 มิติ

```tsx
interface Dimension {
  id: number;
  name: string;
  nameEn: string;
  questionCount: number;
  weight: number;   // 5-20%
  score: number;    // 0-100 (คำนวณจาก raw 0-4)
  color: string;
  icon: string;
}

const DIMENSIONS: Dimension[] = [
  { id:1, name:'คุณภาพอาหารและนวัตกรรมเมนู',        nameEn:'Food Quality & Menu Innovation',        questionCount:7, weight:12, color:'blue'   },
  { id:2, name:'ความปลอดภัยอาหารและมาตรฐาน',        nameEn:'Food Safety & Standards',               questionCount:7, weight:15, color:'orange' },
  { id:3, name:'แบรนด์และโมเดลธุรกิจ',              nameEn:'Brand & Business Model',                questionCount:6, weight:10, color:'purple' },
  { id:4, name:'การตลาดและฐานลูกค้า',               nameEn:'Marketing & Customer Base',             questionCount:7, weight:13, color:'red'    },
  { id:5, name:'การเงิน ต้นทุน และกำไร',            nameEn:'Finance, Cost & Profit',                questionCount:7, weight:20, color:'green'  },
  { id:6, name:'ระบบปฏิบัติการร้านและการบริการ',    nameEn:'Restaurant Operations & Service',       questionCount:7, weight:18, color:'teal'   },
  { id:7, name:'เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน', nameEn:'Network, Ingredients & Supply Chain', questionCount:5, weight:5,  color:'yellow' },
  { id:8, name:'ความพร้อมเติบโตและเข้าร่วมโครงการ', nameEn:'Growth Readiness & Program Participation', questionCount:4, weight:7, color:'olive' },
];
```

**Each item:**
```
[colored icon circle] [name]              [score%]
                      [progress bar]
                      น้ำหนัก: X%
```

**Active item:** orange left border + orange bg tint

**Footer:**
```
คะแนนรวมปัจจุบัน (ถ่วงน้ำหนัก): 46.25 / 100
[ดูสรุปพร้อมพัฒนาหน้อย →]
```

#### C3.3 Center Panel — Assessment Detail Form

**Section header:**
```tsx
<SectionHeader>
  <IconBadge color="orange">{dimension.id}</IconBadge>
  <Title>{dimension.name} / {dimension.nameEn}</Title>
  <Description>ประเมินกลยุทธ์ทางการตลาด...</Description>
  <ScoreDisplay>
    <Label>น้ำหนัก: {dimension.weight}%</Label>
    <Label>คะแนนมิตินี้ปัจจุบัน:</Label>
    <BigScore color="orange">{dimensionScore.toFixed(2)} / 100</BigScore>
  </ScoreDisplay>
</SectionHeader>
```

**50 คำถามแบบประเมินจริง (คะแนน 0–4 ต่อข้อ):**

```typescript
// มิติที่ 1: คุณภาพอาหารและนวัตกรรมเมนู (ข้อ 1-7, weight 12%)
const Q1 = [
  { no: 1,  text: 'ร้านมีเมนูหลักที่ขายดีและลูกค้าจดจำได้ชัดเจน' },
  { no: 2,  text: 'รสชาติอาหารมีความสม่ำเสมอ' },
  { no: 3,  text: 'มีสูตรมาตรฐานหรือวิธีทำที่บันทึกไว้' },
  { no: 4,  text: 'วัตถุดิบหลักมีคุณภาพและควบคุมความสดได้' },
  { no: 5,  text: 'เมนูมีจุดเด่นหรืออัตลักษณ์เฉพาะของร้าน' },
  { no: 6,  text: 'มีการรับฟังความคิดเห็นลูกค้าเพื่อนำมาปรับเมนู' },
  { no: 7,  text: 'มีโอกาสพัฒนาเมนู Signature หรือเมนูใหม่เพื่อเพิ่มยอดขาย' },
]
// มิติที่ 2: ความปลอดภัยอาหารและมาตรฐาน (ข้อ 8-14, weight 15%)
const Q2 = [
  { no: 8,  text: 'พื้นที่ครัวสะอาด เป็นระเบียบ และแยกโซนเหมาะสม' },
  { no: 9,  text: 'มีการจัดเก็บวัตถุดิบสด แห้ง และปรุงสุกอย่างถูกสุขลักษณะ' },
  { no: 10, text: 'เจ้าของร้านหรือพนักงานมีความรู้พื้นฐานด้านสุขอนามัยอาหาร' },
  { no: 11, text: 'มีการควบคุมวันหมดอายุของวัตถุดิบ' },
  { no: 12, text: 'อุปกรณ์ครัว ภาชนะ และพื้นที่บริการสะอาดพร้อมใช้งาน' },
  { no: 13, text: 'ร้านมีใบอนุญาตหรือเอกสารที่เกี่ยวข้องกับการจำหน่ายอาหาร' },
  { no: 14, text: 'มีแนวทางป้องกันความเสี่ยง เช่น อาหารเสีย ปนเปื้อน หรือข้อร้องเรียนด้านสุขภาพ' },
]
// มิติที่ 3: แบรนด์และโมเดลธุรกิจ (ข้อ 15-20, weight 10%)
const Q3 = [
  { no: 15, text: 'ร้านมีชื่อ แบรนด์ หรือภาพจำที่ชัดเจน' },
  { no: 16, text: 'ร้านอธิบายได้ว่าลูกค้ามากินร้านนี้เพราะอะไร' },
  { no: 17, text: 'กลุ่มลูกค้าเป้าหมายของร้านมีความชัดเจน' },
  { no: 18, text: 'ร้านมีเรื่องเล่าที่เชื่อมโยงกับอาหาร ท้องถิ่น หรือเจ้าของร้าน' },
  { no: 19, text: 'รูปแบบรายได้ของร้านชัดเจน เช่น หน้าร้าน เดลิเวอรี Catering หรือออกบูธ' },
  { no: 20, text: 'ร้านมีแนวคิดในการต่อยอด เช่น สินค้าพร้อมขาย แพ็กเกจจิ้ง หรือแฟรนไชส์' },
]
// มิติที่ 4: การตลาดและฐานลูกค้า (ข้อ 21-27, weight 13%)
const Q4 = [
  { no: 21, text: 'ร้านมีช่องทางออนไลน์ เช่น Facebook, TikTok, LINE OA หรือ Google Maps' },
  { no: 22, text: 'ข้อมูลร้านออนไลน์ถูกต้อง เช่น เวลาเปิด-ปิด เบอร์โทร พิกัด และเมนู' },
  { no: 23, text: 'มีภาพอาหารหรือคอนเทนต์ที่ช่วยกระตุ้นยอดขาย' },
  { no: 24, text: 'ร้านมีฐานลูกค้าประจำหรือมีวิธีทำให้ลูกค้ากลับมาซื้อซ้ำ' },
  { no: 25, text: 'มีการทำโปรโมชันหรือกิจกรรมการตลาดอย่างเหมาะสม' },
  { no: 26, text: 'ร้านรู้ว่าช่องทางใดสร้างยอดขายดีที่สุด' },
  { no: 27, text: 'ร้านมีโอกาสขยายตลาดใหม่ เช่น เดลิเวอรี ออกงาน หน่วยงาน โรงแรม หรือการท่องเที่ยว' },
]
// มิติที่ 5: การเงิน ต้นทุน และกำไร (ข้อ 28-34, weight 20%)
const Q5 = [
  { no: 28, text: 'ร้านรู้ต้นทุนวัตถุดิบของเมนูหลัก' },
  { no: 29, text: 'ร้านตั้งราคาขายโดยอิงต้นทุนและกำไร' },
  { no: 30, text: 'ร้านแยกเงินร้านกับเงินส่วนตัวออกจากกัน' },
  { no: 31, text: 'มีการบันทึกรายรับ-รายจ่ายอย่างสม่ำเสมอ' },
  { no: 32, text: 'ร้านรู้ยอดขายเฉลี่ยต่อวันและต่อเดือน' },
  { no: 33, text: 'ร้านรู้ว่าเมนูใดกำไรดี และเมนูใดควรปรับราคา' },
  { no: 34, text: 'ร้านมีเงินหมุนเวียนเพียงพอสำหรับวัตถุดิบ ค่าแรง ค่าเช่า และค่าใช้จ่ายจำเป็น' },
]
// มิติที่ 6: ระบบปฏิบัติการร้านและการบริการ (ข้อ 35-41, weight 18%)
const Q6 = [
  { no: 35, text: 'ร้านมีขั้นตอนการเปิดร้าน-ปิดร้านที่ชัดเจน' },
  { no: 36, text: 'มีการแบ่งหน้าที่ของเจ้าของร้าน พนักงานครัว และพนักงานบริการ' },
  { no: 37, text: 'เวลาการออกอาหารเหมาะสม ไม่ทำให้ลูกค้ารอนานเกินไป' },
  { no: 38, text: 'มีมาตรฐานการบริการ เช่น ต้อนรับ รับออเดอร์ เสิร์ฟอาหาร และรับชำระเงิน' },
  { no: 39, text: 'มีระบบจัดการสต็อกวัตถุดิบเพื่อลดของเสีย' },
  { no: 40, text: 'ร้านรับมือช่วงลูกค้าเยอะได้โดยคุณภาพไม่ตก' },
  { no: 41, text: 'มีระบบจัดการข้อร้องเรียนของลูกค้า' },
]
// มิติที่ 7: เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน (ข้อ 42-46, weight 5%)
const Q7 = [
  { no: 42, text: 'ร้านมีแหล่งวัตถุดิบประจำที่เชื่อถือได้' },
  { no: 43, text: 'มีการใช้วัตถุดิบท้องถิ่นหรือวัตถุดิบเด่นของพื้นที่' },
  { no: 44, text: 'ร้านมีซัพพลายเออร์สำรอง หากวัตถุดิบหลักขาดตลาด' },
  { no: 45, text: 'มีความร่วมมือกับชุมชน กลุ่มเกษตรกร หรือผู้ผลิตท้องถิ่น' },
  { no: 46, text: 'ร้านมีความเชื่อมโยงกับหน่วยงาน ภาคี หรือเครือข่ายธุรกิจในพื้นที่' },
]
// มิติที่ 8: ความพร้อมเติบโตและเข้าร่วมโครงการ (ข้อ 47-50, weight 7%)
const Q8 = [
  { no: 47, text: 'เจ้าของร้านมีความตั้งใจและเปิดรับการเปลี่ยนแปลง' },
  { no: 48, text: 'ร้านพร้อมให้ทีมโครงการลงพื้นที่ ตรวจประเมิน และให้คำปรึกษาแบบ 1-on-1' },
  { no: 49, text: 'ร้านสามารถจัดเตรียมข้อมูลสำคัญ เช่น รูปเมนู รูปร้าน ยอดขาย ต้นทุน และปัญหาหลัก' },
  { no: 50, text: 'ร้านมีเป้าหมายการพัฒนาภายใน 3-6 เดือน เช่น เพิ่มยอดขาย ลดต้นทุน ปรับเมนู ทำแบรนด์ หรือขยายช่องทางขาย' },
]
```

**Assessment Table columns:**
```
ข้อที่ | คำถามประเมิน | คะแนน (0-4) | Display (0-100) | หลักฐาน/ไฟล์ | บันทึกผู้ประเมิน | ข้อเสนอแนะเพิ่มเติม | สถานะ
```

**คะแนน cell:** Select dropdown 0–100 (step 10) หรือ number input
> หมายเหตุ: ใน story doc คะแนน = 0–4, แต่ UI แสดงเป็น 0–100 หลัง convert
> Formula: `displayScore = rawScore * 25` (0→0, 1→25, 2→50, 3→75, 4→100)

**หลักฐาน/ไฟล์ cell:**
```tsx
<FileCell>
  {files.map(f => (
    <FileChip key={f.id}>
      <FileIcon type={f.type} />   {/* PDF=red, XLSX=green, DOCX=blue */}
      <FileName>{f.name}</FileName>
      <FileSize>{f.size}</FileSize>
      <DownloadBtn />
      <DeleteBtn />
    </FileChip>
  ))}
  <UploadBtn accept=".pdf,.xlsx,.docx,image/*" />
</FileCell>
```

**สถานะ badge:**
| Status | Color | Label |
|---|---|---|
| กำลังประเมิน | orange outline | กำลังประเมิน |
| เสร็จสิ้น | green filled | เสร็จสิ้น |
| ต้องแก้ | red filled | ต้องแก้ |
| ยังไม่ได้ประเมิน | gray | ยังไม่ได้ประเมิน |

**Form Footer:**
```
บันทึกก่อน: 20 พ.ค. 2569 14:35 โดย นางสาวศิริวรรณ จันทร์ดี
คะแนนรวมมิตินี้ (จากหนัก X%): [score] / 100
```

#### C3.4 Right Panel — Summary Sidebar

```tsx
<SummarySidebar>
  <RestaurantCard
    thumbnail={url}
    name="บ้านริมน้ำ จันทบุรี"
    province="จันทบุรี"
    badge="ประเมิน T1 แล้ว"
    link="[ดูรายงานอย่างละเอียด →]"
  />

  <ScoreGrid>
    <ScoreCard label="คะแนนมิตินี้ (สีส้ม)" value="60.00/100" color="orange" />
    <ScoreCard label="คะแนนรวมปัจจุบัน"    value="46.25/100" color="purple" />
    <ScoreCard label="อันดับที่ในจังหวัด"   value="12/35 ร้าน" color="blue" />
    <ScoreCard label="อันดับที่ทั้งหมด"     value="68/312 ร้าน" color="green" />
  </ScoreGrid>

  <RedFlagSection title="Red Flags (ต้องเร่งแก้ไข)" count={2}>
    <Flag>• การบริหารและต้นทุน (คะแนน &lt; 30/100)</Flag>
    <Flag>• การวัดผลทางการตลาด (คะแนน &lt; 20/100)</Flag>
  </RedFlagSection>

  <ImprovementSection title="จุดที่ต้องเร่งพัฒนา" count={3}>
    <Item>• การบริหารจัดการ</Item>
    <Item>• การวัดผลทางการตลาด</Item>
    <Item>• การบริการด้านทุนจัดซื้อ</Item>
  </ImprovementSection>

  <RadarChart
    title="เปรียบเทียบ 8 มิติ (คะแนนถ่วงน้ำหนัก)"
    series={[
      { name: 'ร้านนี้',          color: '#3498DB', data: [...8 values] },
      { name: 'ค่าเฉลี่ยจังหวัด', color: '#F17128', dashed: true, data: [...8 values] },
    ]}
    axes={DIMENSIONS.map(d => d.name)}
  />
</SummarySidebar>
```

#### C3.5 History Timeline (Bottom)

```tsx
<HistoryTimeline>
  {[
    { label: 'รอบอนุมัติ T1', date: '20 พ.ค. 2569 14:35', by: 'ศิริวรรณ', status: 'active', action: 'กำลังประเมิน' },
    { label: 'ร่างครั้งที่ 2', date: '15 พ.ค. 2569 10:22', by: 'ศิริวรรณ', action: 'บันทึกร่าง' },
    { label: 'ร่างครั้งที่ 1', date: '12 มิ.ย. 2569 16:40', by: 'ศิริวรรณ', action: 'บันทึกร่าง' },
    { label: 'รอบอนุมัติ T0', date: '12 มิ.ย. 2569 11:15', by: 'ศิริวรรณ', action: 'เสร็จสิ้น' },
  ]}
  <NoteEditor placeholder="บันทึกเพิ่มเติมของผู้ประเมิน..." editIcon />
</HistoryTimeline>
```

---

### C4. วิเคราะห์ศักยภาพ — Performance Analytics (Image 6)

#### C4.1 Filter Bar

```tsx
<AnalyticsFilterBar>
  <StoreSelect value="บ้านริมน้ำ จันทบุรี" />
  <CompareSelect label="เปรียบเทียบ" value="T0 vs T1" />
  <ProvinceSelect value="จันทบุรี" />
  <ExportButton>ส่งออก (Export)</ExportButton>
  <LastUpdated>อัปเดตล่าสุด: 18 พ.ค. 2569 10:30 น.</LastUpdated>
  <RefreshButton />
</AnalyticsFilterBar>
```

#### C4.2 KPI Row (6 cards)

| Card | Value | Sub |
|---|---|---|
| คะแนนรวม T0 | 289 คะแนน | จาก 100 คะแนน |
| คะแนนรวม T1 | 312 คะแนน | จาก 100 คะแนน |
| อัตราพัฒนา T1-T0 | +23 / +7.96% | สีเขียว |
| อันดับในโครงการ | 48 จาก 312 ร้าน | Top 15.38% |
| โซนปัจจุบัน | โซน 2 | Survival Zone badge |
| Incubation Readiness | 72.34/100 | พร้อมเข้าสู่การบ่มเพาะ |

#### C4.3 Three Charts Row

**Left — Radar Chart: ภาพรวมศักยภาพ 8 มิติ**
```tsx
<RadarChart
  axes={['1.คุณภาพอาหารและนวัตกรรมเมนู','2.ความปลอดภัยอาหารและมาตรฐาน','3.แบรนด์และโมเดลธุรกิจ',
         '4.การตลาดและฐานลูกค้า','5.การเงินต้นทุนและกำไร','6.ระบบปฏิบัติการร้านและการบริการ',
         '7.เครือข่ายวัตถุดิบและห่วงโซ่อุปทาน','8.ความพร้อมเติบโต']}
  series={[
    { name:'T0 (เริ่มต้น)', color:'#8E44AD', dashed:true },
    { name:'T1 (ปัจจุบัน)', color:'#F17128' },
  ]}
  scale={[0,20,40,60,80,100]}
/>
```

**Center — Grouped Bar Chart: เปรียบเทียบคะแนนรายมิติ (T0 vs T1)**
```
8 groups, 2 bars each
T0 values: 72, 61, 78, 65, 70, 62, 68, 55
T1 values: 82, 70, 78, 74, 71, 69, 58, 56
```

**Right — Line Chart: แนวโน้มพัฒนาการ (T0-T4 Trend)**
```tsx
<TrendChart
  xAxis={['T0','T1','T2 (ประมาณ)','T3 (ประมาณ)','T4 (ประมาณ)']}
  series={[
    { name:'คะแนน', data:[289, 312, 340, 370, 400], color:'#F17128' },
  ]}
/>
```

#### C4.4 Bottom Row

**Left — AI System Analysis Section**
```tsx
<AIAnalysis>
  <Icon><AIChipIcon /></Icon>
  <Title>วิเคราะห์ด้วยระบบอัจฉริยะ (AI / System Analysis)</Title>
  <Paragraph>
    คะแนนพัฒนาขึ้น 7.96% จาก T0 → T1 โดยเฉพาะด้านการจัดการองค์กร (+10)
    และผลิตภัณฑ์และเมนู (+13) ด้านการบริโภคน้อยที่สุด 5 รายการ...
  </Paragraph>
  <Conclusion color="orange">
    คำแนะนำเพิ่มเติม: หากสามารถยกระดับด้านการเงินและนวัตกรรมได้อีก 15%
    จะมีโอกาสอยู่ใน Top 25%
  </Conclusion>
  <LinkButton>ดูการวิเคราะห์เต็มรูปแบบ →</LinkButton>
</AIAnalysis>
```

**Center — Mentor Recommendations**
```tsx
<MentorSection>
  <Title>คำแนะนำจากเมนเตอร์ (Mentor Recommendations)</Title>
  <RecommendationList>
    <Item>• พัฒนา SOP และมาตรฐานการบริการ เพื่อให้บริการสม่ำเสมอคุณภาพ</Item>
    <Item>• เพิ่มสถานะการตลาดออนไลน์ผ่านทาง Facebook Ads, LINE OA...</Item>
    <Item>• จัดทำ Signature Dish และเล่าเรื่องราว (Storytelling)...</Item>
    <Item>• ใช้เทคโนโลยี POS และระบบออนไลน์...</Item>
  </RecommendationList>
  <LinkButton>ดูคำแนะนำทั้งหมด →</LinkButton>
</MentorSection>
```

**Right — Summary Sidebar**
```tsx
<AnalyticsSidebar>
  <StrengthsCard>
    <Item>ผลิตภัณฑ์และเมนู: 78/100</Item>
    <Item>การจัดการองค์กร: 82/100</Item>
    <Item>การตลาด: 75/100</Item>
  </StrengthsCard>

  <WeaknessesCard>
    <Item>นวัตกรรมและเทคโนโลยี: 58/100</Item>
    <Item>การเงิน: 62/100</Item>
    <Item>การบริหารทรัพยากรบุคคล: 68/100</Item>
  </WeaknessesCard>

  <RedFlagsCard>
    <Flag label="กระแสเงินสดหมุนเวียนต่ำ" link="ดูรายละเอียด" />
    <Flag label="ต้นทุนวัตถุดิบเพิ่มต่อเนื่อง" link="ดูรายละเอียด" />
    <Flag label="การตลาดออนไลน์ยังไม่ผ่านเกณฑ์" link="ดูรายละเอียด" />
  </RedFlagsCard>

  <IncubationStatus>
    <Title>สถานะการคัดเลือก (Incubation Status)</Title>
    <Status>อยู่ระหว่างการคัดเลือก</Status>
    <Detail>ขั้นตอน: ประเมินรอบที่ 2</Detail>
    <RadialProgress value={72} label="โอกาสได้รับคัดเลือก 72%" />
  </IncubationStatus>

  <TargetCard>
    <Title>เป้าหมาย (T4 Target)</Title>
    <Item>คะแนนรวม 400 คะแนน</Item>
    <Item>Incubation Readiness 90/100</Item>
    <Item>โอกาสติด Top 10% ของโครงการ</Item>
  </TargetCard>
</AnalyticsSidebar>
```

#### C4.5 Action Plans Row (Bottom)

```tsx
<ActionPlansRow>
  <ActionPlanCard phase="7" label="แผน 7 วัน (Quick Win)" color="orange">
    <ProgressBar value={60} />
    <Item>1. พัฒนาและเพิ่มยอดขายรายงาน Facebook</Item>
    <Item>2. ล้างต้นทุนวัตถุดิบ 5 รายการ</Item>
    <Item>3. อบรมมาตรฐานการบริการพื้นฐาน</Item>
    <LinkButton>ดูรายละเอียด →</LinkButton>
  </ActionPlanCard>

  <ActionPlanCard phase="30" label="แผน 30 วัน (Short Term)" color="purple">
    <ProgressBar value={35} />
    <Item>1. จัดทำโปรแกรม Set Menu ประจำเดือน</Item>
    <Item>2. วิเคราะห์และปรับสมดุลต้นทุนทำไปที่ใช้</Item>
    <Item>3. ใช้ระบบ POS และระบบขายของขาย</Item>
    <LinkButton>ดูรายละเอียด →</LinkButton>
  </ActionPlanCard>

  <ActionPlanCard phase="90" label="แผน 90 วัน (Long Term)" color="blue">
    <ProgressBar value={10} />
    <Item>1. พัฒนา Signature และโครงสร้างผลิตภัณฑ์</Item>
    <Item>2. ทดลองขายจากบริการออนไลน์บน Delivery Platform</Item>
    <Item>3. เตรียมพร้อมสร้างบริษัทอาหารฐานทรัพยากรสุขภาพ</Item>
    <LinkButton>ดูรายละเอียด →</LinkButton>
  </ActionPlanCard>
</ActionPlansRow>
```

---

### C5. คะแนนพิชชิ่ง — Pitching Scores (Image 7)

#### C5.1 Filter Bar

```tsx
<PitchingFilterBar>
  <RoundSelect label="รอบคัดเลือก" value="รอบคัดเลือก ภาคตะวันออก 2569" />
  <StoreSelect label="ร้านอาหาร" value="บ้านริมน้ำ จันทบุรี" />
  <JudgeSelect label="กรรมการ" value="ดร.กฤษฎา วงษ์สมบัติ" />
  <SearchInput placeholder="ค้นหาร้านอาหาร..." />
  <AddScoreButton>+ เพิ่มผลการประเมิน</AddScoreButton>
</PitchingFilterBar>
```

#### C5.2 Main 3-column Layout

**Left — Store Info + Scoring Form**

```tsx
<PitchingForm>
  <StoreInfo>
    <Thumbnail />
    <StoreName>บ้านริมน้ำ จันทบุรี</StoreName>
    <StatusBadge>ผ่านเข้ารอบ T1 แล้ว</StatusBadge>
    <Province>จังหวัด จันทบุรี | อาหารไทย</Province>
    <Owner>ผู้สมัคร: คุณสมชาย น้ำรสสุข</Owner>
    <Phone>เบอร์โทร: 081-234-5678</Phone>
  </StoreInfo>

  <ScoreSection>
    <SectionTitle>กรอกคะแนน (เต็ม 20 คะแนนต่อหัวข้อ)</SectionTitle>
    {[
      { no:1, label:'ความชัดเจนของปัญหาและโอกาสทางธุรกิจ', max:20, score:17 },
      { no:2, label:'ความน่าสนใจของเมนู / สินค้า',           max:20, score:18 },
      { no:3, label:'ความเป็นไปได้ของแผนตลาด',               max:20, score:16 },
      { no:4, label:'ความเข้าใจต้นทุนและกำไร',               max:20, score:15 },
      { no:5, label:'ความพร้อมของเจ้าของร้าน',               max:20, score:17 },
    ].map(item => (
      <ScoreRow key={item.no}>
        <Label>{item.no}. {item.label}</Label>
        <Slider min={0} max={20} value={item.score} />
        <ScoreDisplay>{item.score} / {item.max}</ScoreDisplay>
      </ScoreRow>
    ))}
    <TotalScore color="orange">83 / 100</TotalScore>
  </ScoreSection>
</PitchingForm>
```

**Center — Summary + Analysis**

```tsx
<PitchingSummary>
  <ScoreCards>
    <Card label="คะแนนเฉลี่ย (ราษฎร์นี้)" value="83.0/100" color="orange" />
    <Card label="อันดับ" value="2/23 อันดับ" color="purple" />
  </ScoreCards>

  <IncubationChance value={78.3} label="โอกาสเข้าบ่มเพาะ (Incubation Chance)" />
  <SelectionStatus>ผ่านเข้า T1 แนะนำต่อยอด</SelectionStatus>
  <JudgeNote>ศักยภาพโดยรวมดี มีความพร้อมสำหรับการพัฒนา แนะนำร้านควรเสริมด้านการตลาดออนไลน์...</JudgeNote>

  <StrengthsCard>
    <Item check>เมนูมีเอกลักษณ์และน่าสนใจ</Item>
    <Item check>ควบคุมต้นทุนได้ดี</Item>
    <Item check>เจ้าของร้านมีมุ่งมั่นสูง</Item>
  </StrengthsCard>

  <ConcernsCard>
    <Item warn>แผนการตลาดยังไม่โดดเด่น</Item>
    <Item warn>ช่องทางออนไลน์ยังไม่สมบูรณ์แบบ</Item>
  </ConcernsCard>

  <JudgeSignature>
    <Avatar />
    <Name>ดร.กฤษฎา วงษ์สมบัติ</Name>
    <Role>กรรมการด้านการตลาด</Role>
  </JudgeSignature>
</PitchingSummary>
```

**Right — Leaderboard**

```tsx
<PitchingLeaderboard title="อันดับคะแนนสูงสุด (Top 10)">
  {top10.map((store, i) => (
    <LeaderboardRow key={store.id} rank={i+1}>
      <Thumbnail />
      <StoreName>{store.name}</StoreName>
      <Score>{store.score}</Score>
      <Trend direction={store.trend} />  {/* ↑ หรือ ↓ */}
    </LeaderboardRow>
  ))}
  <LinkButton>อันดับต้นทั้งหมด →</LinkButton>
</PitchingLeaderboard>
```

#### C5.3 Bottom Row

**Left — Judge-by-Judge Table**

| # | กรรมการ | คะแนนรวม | วันที่ประเมิน | หมายเหตุ | สถานะ |
|---|---|---|---|---|---|
| 1 | ดร.กฤษฎา วงษ์สมบัติ | 83 | 20 พ.ค. | ด้านการตลาด | ผ่านเข้ารอบ T1 |
| 2 | ผศ.ดร.เมฆนนา พรหมคำ | 80 | 20 พ.ค. | ดูเพิ่มเติม | ผ่านเข้ารอบ T1 |
| 3 | อาจารย์วิรัตน์ สัสมนตร์ | 78 | 18 พ.ค. | ช่องทางออนไลน์ | รอประกาศ |
| 4 | คุณทุตยุค จันทร์เรือง | — | — | — | ยังไม่ประเมิน |

**Center — Score Distribution Bar Chart (5 criteria)**

```
5 bars (หัวข้อ 1–5), แสดงค่าเฉลี่ยจากกรรมการทั้งหมด
17.1 | 17.8 | 15.8 | 15.0 | 16.6
```

**Right — Donut: การกระจายคะแนนรวม (ผู้เข้ารอบ 23 ร้าน)**

```
90-100: 3 ร้าน (13%)
80-89:  8 ร้าน (34.8%)
70-79:  7 ร้าน (30.4%)
60-69:  4 ร้าน (17.4%)
<60:    1 ร้าน (4.4%)
```

---

### C6. Field Audit — ลงพื้นที่ตรวจร้าน

#### C6.1 Filter Bar

```tsx
<FieldAuditFilterBar>
  <StoreSelect value="บ้านริมน้ำ จันทบุรี" />
  <RoundSelect options={['T0','T1','T2','T3','T4']} />
  <AuditorInfo name="ศิริวรรณ จันทร์ดี" />
  <SaveButton />
</FieldAuditFilterBar>
```

#### C6.2 Checklist Items

รายการตรวจ (แต่ละ item: label + result + note + file upload):

```typescript
const FIELD_AUDIT_ITEMS = [
  { id: 'kitchen_photo',    label: 'ภาพครัว' },
  { id: 'storage_zone',     label: 'โซนจัดเก็บวัตถุดิบ' },
  { id: 'food_permit',      label: 'ใบอนุญาตร้านอาหาร' },
  { id: 'sop_open_close',   label: 'SOP เปิด-ปิดร้าน' },
  { id: 'stock_system',     label: 'ระบบสต็อก' },
  { id: 'costing_sheet',    label: 'Costing Sheet' },
  { id: 'food_safety_plan', label: 'Food Safety Action Plan' },
  { id: 'standard_menu',    label: 'หลักฐานเมนูมาตรฐาน' },
  { id: 'sales_channels',   label: 'หลักฐานช่องทางขาย' },
  { id: 'before_after',     label: 'รูปภาพก่อน-หลังการปรับปรุง' },
]
```

**Result options per item:**
```
ผ่าน        → green badge (มีหลักฐานครบและทำได้จริง)
รอตรวจ      → amber badge (ต้องส่งหลักฐานเพิ่มเติม)
ไม่ผ่าน    → red badge (ต้องแก้ไขและติดตามซ้ำ)
```

#### C6.3 Summary Panel

```tsx
<FieldAuditSummary>
  <PassCount /> <PendingCount /> <FailCount />
  <RedFlagsDetected />
  <AuditorNote placeholder="บันทึกสรุปการลงพื้นที่..." />
  <SubmitButton>บันทึกผล Field Audit</SubmitButton>
</FieldAuditSummary>
```

---

### C7. Digital Portfolio — แฟ้มผลงาน 8 มิติ

#### C7.1 Portfolio Overview (8 dimension cards)

แต่ละการ์ด: icon + ชื่อมิติ + สถานะ (Complete/Pending) + % completeness + คลิกเพื่อแก้ไข

#### C7.2 Portfolio Detail per Dimension

```tsx
<PortfolioDetail dimension={dim}>
  <SummaryField label="สรุปผลงาน" />
  <ResultsField label="หลักฐาน / ผลลัพธ์" />
  <FileUploadSection label="ลิงก์ไฟล์ / รูปภาพ / เอกสาร" />
  <MentorNoteField label="หมายเหตุ Mentor" readOnly />
  <StatusToggle options={['Pending','Complete']} />
</PortfolioDetail>
```

**8 มิติ + หลักฐานที่ควรมี:**

| มิติ | หลักฐานที่ควรมี |
|---|---|
| 1. อาหารและเมนู | เมนู Signature, สูตรมาตรฐาน, รูปอาหาร, ผลทดสอบรสชาติ |
| 2. Food Safety | Food Safety Action Plan, รูปครัว, ใบอนุญาต, Checklist สุขอนามัย |
| 3. แบรนด์ | Brand Story, CI, Key Visual, Business Model Canvas |
| 4. การตลาด | ช่องทางออนไลน์, แผนคอนเทนต์, Customer Persona, CRM |
| 5. การเงิน | Costing Sheet, ราคาขาย, ยอดขายก่อน-หลัง, บัญชีรายรับรายจ่าย |
| 6. ระบบร้าน | SOP เปิด-ปิดร้าน, SOP ครัว, SOP บริการ, ระบบสต็อก |
| 7. Supply Chain | ซัพพลายเออร์, วัตถุดิบท้องถิ่น, ภาคีชุมชน, คู่ค้า |
| 8. การเติบโต | Pitch Deck, Scaling Plan, ช่องทางขายใหม่, Roadmap 90 วัน |

---

### C8. Export Products — ผลิตภัณฑ์ส่งออก

#### C8.1 Product Info Form

```tsx
<ExportProductForm>
  <Field label="ชื่อสินค้า" />
  <Field label="กลุ่มสินค้า / ประเภทสินค้า" />
  <Field label="จุดขาย" />
  <Field label="วัตถุดิบหลัก / วัตถุดิบเด่นภาคตะวันออก" />
  <Field label="อายุสินค้า / รูปแบบสินค้า" />
  <MultiSelect label="ตลาดเป้าหมาย / ประเทศเป้าหมาย" />
  <MultiSelect label="ช่องทางจำหน่ายที่ต้องการ" />
</ExportProductForm>
```

#### C8.2 Export Readiness Checklist

หมวดการประเมิน + checkbox + หมายเหตุ + upload หลักฐาน:

| หมวด | สิ่งที่ตรวจ |
|---|---|
| สูตรและกระบวนการผลิต | สูตรมาตรฐาน ขั้นตอนผลิต กำลังการผลิต |
| Shelf-life | อายุสินค้า การทดสอบความคงตัว การเก็บรักษา |
| บรรจุภัณฑ์ | ความแข็งแรง น้ำหนัก ขนาด การขนส่ง |
| ฉลาก | ฉลากไทย-อังกฤษ, Nutrition Facts, วันผลิต-หมดอายุ |
| มาตรฐาน | อย., GMP, HACCP, Halal หรือมาตรฐานที่เกี่ยวข้อง |
| เอกสารส่งออก | Barcode, HS Code, Commercial Invoice, Packing List |
| ตลาดเป้าหมาย | ประเทศเป้าหมาย ลูกค้าเป้าหมาย ช่องทางขาย คู่ค้า |
| การทดสอบตลาด | Pilot Sale, Consumer Acceptance, Feedback |

#### C8.3 Export Readiness Score

```
คะแนน    | ระดับ
0–39     | Not Ready
40–59    | Early Stage
60–74    | Ready with Conditions
75–84    | Market Ready
85–100   | Export Ready
```

---

### C9. Ranking — คัดเลือกร้าน

#### C9.1 Ranking Table

**Columns:** อันดับ | ชื่อร้าน | จังหวัด | T1 Score | พัฒนาการ | Pitching | Mindset | Evidence | **Incubation Readiness** | สถานะ

**สูตร Incubation Readiness Score:**
```
= (T1 Score × 0.40) + (Improvement Score × 0.25)
+ (Pitching Score × 0.20) + (Mindset Score × 0.10)
+ (Evidence Score × 0.05)
```

**Status badges:**

| เงื่อนไข | สถานะ |
|---|---|
| อันดับ 1–20, ไม่มี Red Flag รุนแรง | ผ่านเข้า Incubation — green |
| อันดับ 1–20, มี Red Flag รุนแรง | ผ่านแบบมีเงื่อนไข — amber |
| อันดับ 21–30 | สำรอง — blue |
| ต่ำกว่าอันดับ 30 | ยังไม่ผ่าน — red |

#### C9.2 Summary KPI Row

```
คัดเลือกแล้ว: 20/50 | ผ่านแบบมีเงื่อนไข: 3 | สำรอง: 10 | ยังไม่ผ่าน: 17
```

---

### C10. OKR Dashboard — ติดตามผลโครงการ

#### C10.1 Objectives Overview (7 O-cards)

แต่ละ card: Objective label + overall % progress + KR list + progress bars

**OKR Structure:**

| Objective | ตัวอย่าง KR |
|---|---|
| O1 สร้างเครือข่ายผู้ประกอบการอาหารภาคตะวันออก | ผู้เข้าอบรม 1,200 คน / จบ 1,000 ราย |
| O2 ปั้นธุรกิจต้นแบบที่โตได้จริง | ธุรกิจต้นแบบ 10 กิจการ / รายได้เพิ่มขึ้น |
| O3 เปลี่ยนวัตถุดิบท้องถิ่นเป็นนวัตกรรมอาหาร | นวัตกรรม 15 รายการ / ใช้วัตถุดิบภาคตะวันออก 70% |
| O4 ระบบบริหารโครงการด้วยข้อมูลดิจิทัล | Single Database 100% / Portfolio 100% |
| O5 ขายเก่งขึ้น แบรนด์ชัดขึ้น | Signature Menu / Food Safety Plan / Brand Kit |
| O6 สร้างการมองเห็นตลาด | คอนเทนต์ 100 ชิ้น / Impressions 1,000,000 |
| O7 สร้างกลไกเครือข่ายและทุนมนุษย์ | Mentor Pool 24 คน / Peer Mentor 5 ราย |

#### C10.2 OKR–Store Data Linkage

ข้อมูลรายร้านที่เชื่อมกับ KR อัตโนมัติ:

```typescript
const OKR_TRIGGERS: Record<string, string[]> = {
  'portfolio_complete_8_dims':   ['O2', 'O4'],
  'has_pitch_deck':             ['O2'],
  'has_scaling_plan':           ['O2'],
  'revenue_increased':          ['O2', 'O3'],
  'has_innovation_product':     ['O3'],
  'uses_local_ingredients':     ['O3'],
  'has_brand_kit':              ['O5'],
  'has_food_safety_plan':       ['O5'],
  'has_new_sales_channel':      ['O2', 'O6'],
  'has_brand_content':          ['O6'],
  'is_peer_mentor':             ['O7'],
}
```

---

### C11. รายงานและส่งออก — Reports & Export (Image 3)

#### C6.1 Filter + Action Bar

```tsx
<ReportsFilterBar>
  <TypeSelect label="ประเภทรายงาน" value="ทั้งหมด" />
  <ProvinceSelect value="ทั้งหมด" />
  <RoundSelect value="ทั้งหมด" />
  <DateRangePicker start="01/04/2569" end="30/04/2569" />
  <CreateReportButton>+ สร้างรายงานใหม่</CreateReportButton>
</ReportsFilterBar>
```

#### C6.2 Summary KPI Row

```
รายงานทั้งหมด: 128 รายการ
สร้างวันนี้: 12 รายการ (+20% จากเมื่อวาน)
ดาวน์โหลดวันนี้: 46 รายการ (+15%)
กำหนดส่งออกรายสัปดาห์: 8 งาน (กำลังดำเนินการอยู่ 2 งาน)
```

#### C6.3 Report Templates Grid

8 template cards (2×4):

```tsx
const REPORT_TEMPLATES = [
  { name:'รายงานสรุปภาพรวมโครงการ', formats:['PDF','XLSX'], lastUsed:'29 เม.ย. 2569' },
  { name:'รายงานข้อมูลร้านอาหาร',   formats:['PDF','XLSX'], lastUsed:'30 เม.ย. 2569' },
  { name:'รายงานผลการประเมิน T0/T1', formats:['PDF','XLSX'], lastUsed:'28 เม.ย. 2569' },
  { name:'รายงาน Red Flag',          formats:['PDF','XLSX'], lastUsed:'27 เม.ย. 2569' },
  { name:'รายงานคะแนนพิชชิ่ง',      formats:['PDF','XLSX'], lastUsed:'27 เม.ย. 2569' },
  { name:'รายงาน Top 20',           formats:['PDF','XLSX'], lastUsed:'30 เม.ย. 2569' },
  { name:'รายงาน IDP',              formats:['PDF','XLSX'], lastUsed:'29 เม.ย. 2569' },
  { name:'รายงานรายจังหวัด',         formats:['PDF','XLSX'], lastUsed:'29 เม.ย. 2569' },
];
```

Each card: icon + name + format badges (PDF/XLSX) + "ใช้ล่าสุด: date" + click to create

#### C6.4 Generated Reports Table

**Columns:** checkbox | ชื่อรายงาน | ประเภท | รูปแบบ | วันที่สร้าง | ผู้สร้าง | สถานะ | ดาวน์โหลด | ⋮

**Status badges:**
- เสร็จสมบูรณ์ → green
- กำลังดำเนินงาน → amber (with spinner)
- ล้มเหลว → red

**Pagination:** แสดง 1-8 จาก 128 รายการ

#### C6.5 Activity Log (Bottom)

| เวลา | กิจกรรม | รายงาน | รูปแบบ | ผู้ดำเนินการ | สถานะ | ดาวน์โหลด |
|---|---|---|---|---|---|---|

#### C6.6 Right Drawer — Export Settings

```tsx
<ExportDrawer>
  <Title>การตั้งค่าส่งออกรายงาน</Title>

  <Field label="รายงานที่เลือก">
    รายงานสรุปภาพรวมโครงการ
    <LinkButton>เปลี่ยนรายงาน</LinkButton>
  </Field>

  <RadioGroup label="รูปแบบไฟล์">
    <Radio value="pdf">PDF</Radio>
    <Radio value="xlsx">Excel (XLSX)</Radio>
    <Radio value="csv">CSV</Radio>
  </RadioGroup>

  <CheckboxGroup label="ตัวเลือกเนื้อหา">
    <Checkbox checked>รวมตารางข้อมูล</Checkbox>
    <Checkbox checked>รวมกราฟและแผนภูมิ</Checkbox>
    <Checkbox checked>รวมสรุปสำหรับผู้บริหาร</Checkbox>
    <Checkbox>วิเคราะห์และอธิบายรายจังหวัด</Checkbox>
  </CheckboxGroup>

  <Field label="ขอบเขตข้อมูล">
    <ProvinceSelect />
    <DateRangePicker />
    <StoreGroupSelect />
  </Field>

  <ActionButtons>
    <Button variant="orange">ส่งออก PDF</Button>
    <Button variant="orange-outline">ส่งออก Excel</Button>
    <Button variant="outline">ส่งออก CSV</Button>
  </ActionButtons>
</ExportDrawer>
```

---

### C12. ผู้ใช้งานและสิทธิ์ — Users & Roles (Image 5)

#### C7.1 Filter Bar

```tsx
<UsersFilterBar>
  <SearchInput placeholder="ค้นหาชื่อ, อีเมล, โทรศัพท์ หรือบทบาท..." />
  <RoleSelect value="บทบาททั้งหมด" />
  <DepartmentSelect value="หน่วยงานทั้งหมด" />
  <StatusSelect value="สถานะทั้งหมด" />
  <AddUserButton>+ เพิ่มผู้ใช้งาน</AddUserButton>
</UsersFilterBar>
```

#### C7.2 Summary Cards Row

```
ผู้ใช้งานทั้งหมด: 312 คน (เพิ่มขึ้น 18 คน จากเดือนก่อน)
ผู้ใช้งานที่ใช้งานอยู่: 289 คน (92.63%)
รอเปิดใช้งาน: 16 คน (5.13%)
บทบาททั้งหมด: 6 บทบาท (กำหนดสิทธิ์ครบ 100%)
```

#### C7.3 Users Table

**Columns:** avatar+ชื่อ-นามสกุล | บทบาท | หน่วยงาน | อีเมล | โทรศัพท์ | สถานะ | เข้าสู่ระบบล่าสุด | การจัดการ

**Role badges:**
```
Admin / PMO      → gray-dark
Assessor         → blue
Mentor / Coach   → green
ผู้ประกอบการ      → orange
กรรมการ Pitching → purple
M&E Team         → teal
```

**Status:**
- ใช้งานอยู่ → green dot
- รอเปิดใช้งาน → amber
- ถูกระงับ → red

**Active row highlight:** orange left border

#### C7.4 Roles Summary Cards

```tsx
const ROLES = [
  { role:'Admin / PMO',        count:12,  desc:'ผู้ดูแลระบบ กำหนดสิทธิ์และนโยบาย' },
  { role:'Assessor',           count:68,  desc:'ผู้ประเมินร้าน ให้คะแนนรายข้อ' },
  { role:'Mentor / Coach',     count:45,  desc:'ที่ปรึกษา ทำแผน IDP และติดตามผล' },
  { role:'ผู้ประกอบการ',        count:132, desc:'เจ้าของ/ผู้จัดการร้านอาหาร' },
  { role:'กรรมการ Pitching',   count:23,  desc:'กรรมการให้คะแนนนำเสนอธุรกิจ' },
  { role:'M&E Team',           count:32,  desc:'ติดตามและประเมินผลโครงการ' },
];
```

#### C7.5 Permissions Matrix (Bottom)

Full CRUD matrix table:

**Rows (modules):** ข้อมูลร้านอาหาร | แบบประเมินร้าน | คะแนนพิชชิ่ง | รายงานและส่งออก | ผู้ใช้งานและสิทธิ์

**Columns per role:** ดู | เพิ่ม | แก้ไข | อนุมัติ | ส่งออก

**Cell values:** ✓ (green) | ✗ (gray) | ◌ (orange = partial)

#### C7.6 Right Panel — User Detail

```tsx
<UserDetailPanel>
  <UserHeader>
    <Avatar size="lg" />
    <Name>นางสาวศิริวรรณ จันทร์ดี</Name>
    <RoleBadge>Admin / PMO</RoleBadge>
    <EditButton />
  </UserHeader>

  <InfoSection>
    <Field label="หน่วยงาน">มหาวิทยาลัยราชภัฏราไพพรรณี</Field>
    <Field label="อีเมล">siriwan.j@rbru.ac.th</Field>
    <Field label="โทรศัพท์">081-234-5678</Field>
  </InfoSection>

  <StatusSection>
    <StatusDot color="green" /> ใช้งานอยู่
    <Field>เข้าสู่ระบบล่าสุด: 20 พ.ค. 2569 09:32</Field>
    <Field>วันที่เข้าร่วม: 10 มี.ค. 2569</Field>
  </StatusSection>

  <AssignedProvinces provinces={['จันทบุรี','ตราด','ระยอง']} />
  <AssignedStores count={12} thumbnails={[...]} />

  <PermissionsSection title="สิทธิ์การเข้าถึง (Permissions)">
    <Toggle label="จัดการผู้ใช้งานและสิทธิ์"  checked={true} />
    <Toggle label="จัดการข้อมูล"               checked={true} />
    <Toggle label="ดูรายงานและสถิติ"            checked={true} />
    <Toggle label="ส่งออกข้อมูล"               checked={true} />
    <Toggle label="ตั้งค่าระบบ"                checked={true} />
  </PermissionsSection>
</UserDetailPanel>
```

---

## PART D — SHARED COMPONENTS

```tsx
// Scores & Zones
<ZoneBadge zone="Red|Survival|Improve|Growth|Model" />
<ScoreCard label value trend color />
<RadialProgress value label />
<ProgressBar value color label />

// Assessment
<ScoreSelect value={0|1|2|3|4} onChange />   // raw 0-4
<ScoreDisplay raw={number} />                 // แสดง 0-100 หลัง * 25
<FileChip file={EvidenceFile} onDelete />
<FileUploadZone accept onUpload />
<StatusBadge status type="assessment|store|report|user" />
<RedFlagChip type severity />

// Charts
<RadarChart8Dim series axes scale />
<DonutChart data centerLabel />
<GroupedBarChart groups bars />
<TrendLineChart xAxis series />
<LeaderboardItem rank name score trend />

// Layout
<FilterBar children />
<PageHeader title subtitle meta />
<SplitLayout left center right leftWidth centerWidth rightWidth />
<SlidePanel open onClose position="right" width={400} />
<DataTable columns data pagination sortable />
<Pagination total current onChange rowsPerPage />

// Forms
<DateRangePicker start end onChange />
<SearchInput placeholder onSearch />
<MultiSelect options value onChange />
<Slider min max value step onChange />
```

---

## PART E — BACKEND SPEC

### E1. Database Schema (PostgreSQL + Prisma)

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  phone        String?
  role         Role
  department   String?
  status       UserStatus
  avatar       String?
  lastLogin    DateTime?
  createdAt    DateTime @default(now())
  provinces    String[] // assigned provinces
  stores       Store[]  @relation("AssignedAssessor")
  assessments  Assessment[]
  pitchScores  PitchingScore[]
  idps         IDP[]
}

enum Role {
  ADMIN
  ASSESSOR
  MENTOR
  ENTREPRENEUR
  JUDGE
  ME_TEAM
}

enum UserStatus {
  ACTIVE
  PENDING
  SUSPENDED
}

model Store {
  id              String      @id @default(cuid())
  name            String
  province        String
  storeType       String
  ownerName       String
  phone           String
  email           String?
  address         String
  socialLinks     Json        // { facebook, line, google_maps, tiktok }
  avgRevenue      Float?
  mainProblems    String?
  goals           String?
  photos          String[]
  status          StoreStatus
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  assessments     Assessment[]
  pitchScores     PitchingScore[]
  idps            IDP[]
  fieldAudits     FieldAudit[]
  portfolio       Portfolio[]
}

enum StoreStatus {
  REGISTERED          // สมัครและมีข้อมูลในระบบ
  T0_COMPLETED        // ประเมินก่อนค่ายแล้ว
  CAMP_COMPLETED      // เข้าค่ายแล้ว
  T1_COMPLETED        // ประเมินหลังค่ายแล้ว
  PITCHING_COMPLETED  // นำเสนอ Pitching แล้ว
  SELECTED            // ผ่านเข้า Incubation
  CONDITIONAL_SELECTED // ผ่านแบบมีเงื่อนไข
  WAITING_LIST        // รายชื่อสำรอง
  NOT_SELECTED        // ยังไม่ผ่าน
  FIELD_AUDITED       // ลงพื้นที่ตรวจแล้ว
  IDP_CREATED         // มีแผนพัฒนารายกิจการแล้ว
  TRAINING            // อยู่ระหว่างอบรม
  INCUBATION          // เข้าสู่กระบวนการบ่มเพาะ
  ACCELERATOR         // เข้าสู่กระบวนการเร่งการเติบโต
  MODEL               // เป็นธุรกิจต้นแบบ
  COMPLETED           // ติดตามผลครบแล้ว
}

model Question {
  id            Int      @id
  dimensionId   Int
  questionNo    Int      // 1-50
  questionText  String
  maxScore      Int      @default(4)
  dimension     Dimension @relation(fields:[dimensionId], references:[id])
  scores        Score[]
}

model Dimension {
  id            Int      @id
  name          String
  nameEn        String
  weight        Int      // 5-20
  questionCount Int
  questions     Question[]
}

model Assessment {
  id            String   @id @default(cuid())
  storeId       String
  round         Round
  assessorId    String
  status        AssessmentStatus
  totalScore    Float?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  submittedAt   DateTime?

  store         Store    @relation(fields:[storeId], references:[id])
  assessor      User     @relation(fields:[assessorId], references:[id])
  scores        Score[]
  redFlags      RedFlag[]

  @@unique([storeId, round])
}

enum Round { T0 T1 T2 T3 T4 }
enum AssessmentStatus { DRAFT IN_PROGRESS SUBMITTED APPROVED }

model Score {
  id            String   @id @default(cuid())
  assessmentId  String
  questionId    Int
  rawScore      Int?     // 0-4
  displayScore  Int?     // rawScore * 25
  note          String?
  suggestion    String?
  status        ScoreStatus

  assessment    Assessment @relation(fields:[assessmentId], references:[id])
  question      Question   @relation(fields:[questionId], references:[id])
  evidences     Evidence[]
}

enum ScoreStatus { PENDING SCORED FLAGGED }

model Evidence {
  id          String   @id @default(cuid())
  scoreId     String
  filename    String
  fileType    String
  fileSize    Int
  url         String
  uploadedAt  DateTime @default(now())
  score       Score    @relation(fields:[scoreId], references:[id])
}

model RedFlag {
  id              String   @id @default(cuid())
  assessmentId    String
  type            RedFlagType
  severity        Severity
  triggerQuestions Int[]
  recommendation  String?
  resolved        Boolean  @default(false)
  assessment      Assessment @relation(fields:[assessmentId], references:[id])
}

enum RedFlagType {
  FOOD_SAFETY FINANCIAL OPERATION MARKET LEGAL
  OWNER_READINESS EVIDENCE GROWTH
}
enum Severity { WARNING CRITICAL }

model PitchingScore {
  id                  String   @id @default(cuid())
  storeId             String
  judgeId             String
  round               String
  businessClarity     Int      // 0-20
  productAppeal       Int
  marketPlan          Int
  financialUnderstanding Int
  ownerReadiness      Int
  total               Int      // auto-calc
  comment             String?
  strengths           String[]
  concerns            String[]
  createdAt           DateTime @default(now())
  store               Store    @relation(fields:[storeId], references:[id])
  judge               User     @relation(fields:[judgeId], references:[id])
}

model IDP {
  id          String   @id @default(cuid())
  storeId     String
  mentorId    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  plans       IDPPlan[]
  logs        MentoringLog[]
  store       Store    @relation(fields:[storeId], references:[id])
  mentor      User     @relation(fields:[mentorId], references:[id])
}

model IDPPlan {
  id          String   @id @default(cuid())
  idpId       String
  phase       Phase    // D7 D30 D90
  issue       String
  actionPlan  String
  responsible String
  dueDate     DateTime
  progress    Int      @default(0)
  status      PlanStatus
  idp         IDP      @relation(fields:[idpId], references:[id])
}

enum Phase { D7 D30 D90 }
enum PlanStatus { PENDING IN_PROGRESS DONE }

model MentoringLog {
  id        String   @id @default(cuid())
  idpId     String
  date      DateTime
  note      String
  outcome   String?
  idp       IDP      @relation(fields:[idpId], references:[id])
}

model FieldAudit {
  id        String   @id @default(cuid())
  storeId   String
  round     Round
  auditorId String
  items     Json     // array of { id, label, result, note, files[] }
  createdAt DateTime @default(now())
  store     Store    @relation(fields:[storeId], references:[id])
}

model Portfolio {
  id          String   @id @default(cuid())
  storeId     String
  dimensionId Int
  summary     String?
  results     String?
  files       Json     // array of PortfolioFile
  mentorNote  String?
  status      PortfolioStatus
  updatedAt   DateTime @updatedAt
  store       Store    @relation(fields:[storeId], references:[id])

  @@unique([storeId, dimensionId])
}

enum PortfolioStatus { PENDING COMPLETE }

model Product {
  id                String   @id @default(cuid())
  storeId           String
  name              String
  category          String?
  productType       String?
  sellingPoints     String?
  mainIngredients   String?
  localIngredients  String?
  shelfLife         String?
  productForm       String?
  targetMarkets     String[]
  targetCountries   String[]
  salesChannels     String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  store             Store    @relation(fields:[storeId], references:[id])
  exportReadiness   ExportReadiness?
}

model ExportReadiness {
  id          String   @id @default(cuid())
  productId   String   @unique
  items       Json     // array of { id, category, label, result, note, files[] }
  totalScore  Float?
  level       ExportReadinessLevel?
  actionPlan  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  product     Product  @relation(fields:[productId], references:[id])
}

enum ExportReadinessLevel { NOT_READY EARLY_STAGE READY_WITH_CONDITIONS MARKET_READY EXPORT_READY }

model OKR {
  id          String   @id @default(cuid())
  objectiveNo Int      // 1-7
  objective   String
  createdAt   DateTime @default(now())
  krs         KR[]
}

model KR {
  id          String   @id @default(cuid())
  okrId       String
  krText      String
  target      Float
  current     Float    @default(0)
  unit        String?
  updatedAt   DateTime @updatedAt
  okr         OKR      @relation(fields:[okrId], references:[id])
}

model Report {
  id          String   @id @default(cuid())
  name        String
  type        String
  format      String   // PDF | XLSX | CSV
  province    String?
  dateFrom    DateTime?
  dateTo      DateTime?
  status      ReportStatus
  fileUrl     String?
  createdBy   String
  createdAt   DateTime @default(now())
}

enum ReportStatus { PENDING GENERATING DONE FAILED }
```

### E2. API Endpoints

#### Auth
```
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
```

#### Stores
```
GET    /api/stores                    ?province=&type=&status=&search=&page=&limit=
POST   /api/stores
GET    /api/stores/:id
PUT    /api/stores/:id
DELETE /api/stores/:id
GET    /api/stores/:id/summary        (quick view panel data)
POST   /api/stores/:id/photos         (upload)
DELETE /api/stores/:id/photos/:photoId
```

#### Assessment
```
GET    /api/assessment/:storeId/:round
POST   /api/assessment/:storeId/:round/draft
POST   /api/assessment/:storeId/:round/submit
GET    /api/assessment/:storeId/:round/scores
PUT    /api/assessment/:storeId/:round/scores/:questionNo
GET    /api/assessment/:storeId/:round/red-flags
POST   /api/assessment/:storeId/:round/scores/:questionNo/files
DELETE /api/assessment/files/:fileId
GET    /api/assessment/:storeId/history    (all rounds)
```

#### Analytics
```
GET    /api/analytics/:storeId         ?compare=T0vsT1&province=
GET    /api/analytics/:storeId/radar
GET    /api/analytics/:storeId/trend
GET    /api/analytics/:storeId/strengths-weaknesses
GET    /api/analytics/:storeId/action-plans
GET    /api/analytics/province-compare  ?provinces[]=จันทบุรี&...
```

#### Pitching
```
GET    /api/pitching                   ?round=&store=&judge=
POST   /api/pitching
GET    /api/pitching/:storeId
PUT    /api/pitching/:id
GET    /api/pitching/leaderboard       ?round=&limit=20
GET    /api/pitching/distribution      (score range breakdown)
```

#### IDP / Mentoring
```
GET    /api/idp/:storeId
POST   /api/idp/:storeId
PUT    /api/idp/:storeId/plans/:planId
POST   /api/idp/:storeId/logs
GET    /api/idp/:storeId/logs
```

#### Field Audit
```
GET    /api/field-audit/:storeId/:round
PUT    /api/field-audit/:storeId/:round
POST   /api/field-audit/:storeId/:round/files
```

#### Portfolio
```
GET    /api/portfolio/:storeId
PUT    /api/portfolio/:storeId/:dimensionId
POST   /api/portfolio/:storeId/:dimensionId/files
DELETE /api/portfolio/files/:fileId
```

#### Users & Roles
```
GET    /api/users                      ?role=&department=&status=&search=
POST   /api/users
GET    /api/users/:id
PUT    /api/users/:id
DELETE /api/users/:id
PUT    /api/users/:id/status
PUT    /api/users/:id/permissions
GET    /api/roles
GET    /api/permissions-matrix
```

#### Dashboard
```
GET    /api/dashboard/kpis
GET    /api/dashboard/province-distribution
GET    /api/dashboard/top20
GET    /api/dashboard/incubation-progress
GET    /api/dashboard/province-comparison
GET    /api/dashboard/activities
GET    /api/dashboard/reports-status
```

#### Reports
```
GET    /api/reports                    ?type=&province=&round=&from=&to=&page=
POST   /api/reports                    (create/queue report)
GET    /api/reports/:id
DELETE /api/reports/:id
GET    /api/reports/:id/download
GET    /api/reports/templates
GET    /api/reports/activity-log
```

#### Field Audit
```
GET    /api/field-audit/:storeId/:round
PUT    /api/field-audit/:storeId/:round
POST   /api/field-audit/:storeId/:round/files
DELETE /api/field-audit/files/:fileId
```

#### Portfolio
```
GET    /api/portfolio/:storeId
GET    /api/portfolio/:storeId/:dimensionId
PUT    /api/portfolio/:storeId/:dimensionId
POST   /api/portfolio/:storeId/:dimensionId/files
DELETE /api/portfolio/files/:fileId
GET    /api/portfolio/:storeId/completeness   (% per dimension + overall)
```

#### Export Products
```
GET    /api/export-products/:storeId
POST   /api/export-products/:storeId
PUT    /api/export-products/:storeId/:productId
GET    /api/export-products/:storeId/:productId/readiness
PUT    /api/export-products/:storeId/:productId/readiness
POST   /api/export-products/:storeId/:productId/readiness/files
DELETE /api/export-products/:storeId/:productId
```

#### Ranking
```
GET    /api/ranking                    ?round=T1
GET    /api/ranking/incubation-score   (Readiness Score calculation)
GET    /api/ranking/top20              (Top 20 Incubation candidates)
PUT    /api/ranking/:storeId/status    (Admin override status)
```

#### OKR
```
GET    /api/okr
GET    /api/okr/:okrId/krs
PUT    /api/okr/krs/:krId
GET    /api/okr/dashboard              (all O1-O7 with current progress)
GET    /api/okr/store-triggers         (which stores contribute to which KR)
```

### E3. Business Logic

#### Red Flag Auto-Detection
```typescript
export function detectRedFlags(scores: Score[]): RedFlag[] {
  const flags: RedFlag[] = [];
  const get = (no: number) => scores.find(s => s.questionId === no)?.rawScore ?? null;
  const avg = (nos: number[]) => nos.map(get).filter(v => v !== null).reduce((a,b) => a+b, 0) / nos.length;

  if (avg([8,9,10,11,12,13,14]) < 2)
    flags.push({ type:'FOOD_SAFETY', severity:'CRITICAL', triggerQuestions:[8,9,10,11,12,13,14] });

  if ([28,29,30,31].some(no => { const s=get(no); return s!==null && s<=1; }))
    flags.push({ type:'FINANCIAL', severity:'CRITICAL', triggerQuestions:[28,29,30,31] });

  if ([35,36,39,41].some(no => { const s=get(no); return s!==null && s<=1; }))
    flags.push({ type:'OPERATION', severity:'WARNING', triggerQuestions:[35,36,39,41] });

  if ([21,22].some(no => { const s=get(no); return s!==null && s<=1; }))
    flags.push({ type:'MARKET', severity:'WARNING', triggerQuestions:[21,22] });

  if (get(13) === 0)
    flags.push({ type:'LEGAL', severity:'CRITICAL', triggerQuestions:[13] });

  if ([47,48].some(no => { const s=get(no); return s!==null && s<2; }))
    flags.push({ type:'OWNER_READINESS', severity:'WARNING', triggerQuestions:[47,48] });

  if ((get(49) ?? 99) < 2)
    flags.push({ type:'EVIDENCE', severity:'WARNING', triggerQuestions:[49] });

  if ((get(50) ?? 99) < 2)
    flags.push({ type:'GROWTH', severity:'WARNING', triggerQuestions:[50] });

  return flags;
}
```

#### Score Calculation
```typescript
const DIMENSIONS = [
  { id:1, name:'คุณภาพอาหารและนวัตกรรมเมนู',        nameEn:'Food Quality & Menu Innovation',           weight:12, questionNos:[1,2,3,4,5,6,7] },
  { id:2, name:'ความปลอดภัยอาหารและมาตรฐาน',        nameEn:'Food Safety & Standards',                  weight:15, questionNos:[8,9,10,11,12,13,14] },
  { id:3, name:'แบรนด์และโมเดลธุรกิจ',              nameEn:'Brand & Business Model',                   weight:10, questionNos:[15,16,17,18,19,20] },
  { id:4, name:'การตลาดและฐานลูกค้า',               nameEn:'Marketing & Customer Base',                weight:13, questionNos:[21,22,23,24,25,26,27] },
  { id:5, name:'การเงิน ต้นทุน และกำไร',            nameEn:'Finance, Cost & Profit',                   weight:20, questionNos:[28,29,30,31,32,33,34] },
  { id:6, name:'ระบบปฏิบัติการร้านและการบริการ',    nameEn:'Restaurant Operations & Service',          weight:18, questionNos:[35,36,37,38,39,40,41] },
  { id:7, name:'เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน', nameEn:'Network, Ingredients & Supply Chain',  weight:5,  questionNos:[42,43,44,45,46] },
  { id:8, name:'ความพร้อมเติบโตและเข้าร่วมโครงการ', nameEn:'Growth Readiness & Program Participation', weight:7,  questionNos:[47,48,49,50] },
];

export function calcDimensionScore(dimensionId: number, scores: Score[]): number {
  const dim = DIMENSIONS.find(d => d.id === dimensionId)!;
  const dimScores = scores.filter(s => dim.questionNos.includes(s.questionId));
  const answered = dimScores.filter(s => s.rawScore !== null);
  if (!answered.length) return 0;
  const maxPossible = answered.length * 4;
  const total = answered.reduce((sum, s) => sum + (s.rawScore ?? 0), 0);
  return (total / maxPossible) * 100;
}

export function calcTotalScore(dimensionScores: { id:number; score:number }[]): number {
  return dimensionScores.reduce((sum, ds) => {
    const dim = DIMENSIONS.find(d => d.id === ds.id)!;
    return sum + (ds.score * dim.weight / 100);
  }, 0);
}

export function calcIncubationReadiness(store: {
  t1Score: number;
  improvementScore: number;
  pitchingScore: number;
  mindsetScore: number;
  evidenceScore: number;
}): number {
  return (
    store.t1Score * 0.40 +
    store.improvementScore * 0.25 +
    store.pitchingScore * 0.20 +
    store.mindsetScore * 0.10 +
    store.evidenceScore * 0.05
  );
}

export function getZone(score: number): string {
  if (score < 40) return 'Red Zone';
  if (score < 60) return 'Survival Zone';
  if (score < 75) return 'Improve Zone';
  if (score < 85) return 'Growth Zone';
  return 'Model Zone';
}
```

### E4. File Storage

```
S3 Bucket Structure:
thai-rap/
├── stores/
│   └── {storeId}/
│       ├── photos/
│       └── documents/
├── assessments/
│   └── {assessmentId}/
│       └── evidence/
│           └── q{questionNo}/
├── portfolio/
│   └── {storeId}/
│       └── dim{dimensionId}/
└── reports/
    └── {reportId}.pdf|xlsx|csv
```

Upload flow:
1. Client → POST `/api/upload/presign` → get presigned S3 URL
2. Client → PUT directly to S3
3. Client → POST `/api/upload/confirm` with `{ key, entityType, entityId }`
4. Server saves record to DB

### E5. Report Generation Queue

```typescript
// ใช้ Bull Queue หรือ Inngest
export async function queueReport(params: ReportParams) {
  const report = await db.report.create({
    data: { ...params, status: 'PENDING' }
  });
  await reportQueue.add('generate', { reportId: report.id }, {
    attempts: 3,
    backoff: { type:'exponential', delay:5000 }
  });
  return report;
}

// Worker
reportQueue.process('generate', async (job) => {
  const { reportId } = job.data;
  await db.report.update({ where:{ id:reportId }, data:{ status:'GENERATING' } });
  try {
    const fileUrl = await generateReport(reportId);
    await db.report.update({ where:{ id:reportId }, data:{ status:'DONE', fileUrl } });
  } catch (e) {
    await db.report.update({ where:{ id:reportId }, data:{ status:'FAILED' } });
  }
});
```

### E6. Auth & Permissions Middleware

```typescript
// Role-based middleware
export const requireRole = (...roles: Role[]) => 
  (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error:'Forbidden' });
    }
    next();
  };

// Scope middleware (Assessor sees only assigned stores)
export const scopeToAssigned = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user.role === 'ADMIN') return next();
  req.storeFilter = { assignedUsers: { some: { id: req.user.id } } };
  next();
};
```

---

## PART F — RESPONSIVE & A11Y

| Breakpoint | Layout |
|---|---|
| ≥1440px | Full 3-column, sidebar open |
| 1024–1439px | Sidebar icon-only (64px), right panel collapses |
| 768–1023px | Sidebar = drawer overlay, 2-column |
| <768px | Single column, bottom tab bar |

**Accessibility:**
- ทุก interactive element ต้องมี `aria-label`
- Keyboard nav: Tab/Arrow keys ใน tables, Escape ปิด modals
- Chart ต้องมี `<table>` hidden fallback สำหรับ screen reader
- Color ไม่ใช้เป็น indicator เดียว — มี icon/text เสมอ
- Alert/Red Flag ใช้ `role="alert"` + `aria-live="assertive"`
- Score inputs ใช้ `role="radiogroup"` + keyboard accessible

---

## PART G — ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL="postgresql://..."

# Auth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://thai-rap.app"
JWT_EXPIRES_IN="7d"

# S3
AWS_REGION="ap-southeast-1"
AWS_S3_BUCKET="thai-rap-storage"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Report Queue
REDIS_URL="redis://..."

# App
NEXT_PUBLIC_APP_URL="https://thai-rap.app"
NODE_ENV="production"
```
