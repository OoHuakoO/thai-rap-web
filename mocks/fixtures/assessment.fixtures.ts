import type {
  Dimension,
  Question,
  Assessment,
  AssessmentSummary,
  EvidenceFile,
  Round,
} from '@/features/assessment/types/assessment.types'

export const dimensionSeed: Dimension[] = [
  { id: 1, name: 'คุณภาพอาหารและนวัตกรรมเมนู', nameEn: 'Food Quality & Menu Innovation', weight: 12, questionCount: 7 },
  { id: 2, name: 'ความปลอดภัยอาหารและมาตรฐาน', nameEn: 'Food Safety & Standards', weight: 15, questionCount: 7 },
  { id: 3, name: 'แบรนด์และโมเดลธุรกิจ', nameEn: 'Brand & Business Model', weight: 10, questionCount: 6 },
  { id: 4, name: 'การตลาดและฐานลูกค้า', nameEn: 'Marketing & Customer Base', weight: 13, questionCount: 7 },
  { id: 5, name: 'การเงิน ต้นทุน และกำไร', nameEn: 'Finance, Cost & Profit', weight: 20, questionCount: 7 },
  { id: 6, name: 'ระบบปฏิบัติการร้านและการบริการ', nameEn: 'Operations & Service', weight: 18, questionCount: 7 },
  { id: 7, name: 'เครือข่าย วัตถุดิบ และห่วงโซ่อุปทาน', nameEn: 'Network, Ingredients & Supply Chain', weight: 5, questionCount: 5 },
  { id: 8, name: 'ความพร้อมเติบโตและเข้าร่วมโครงการ', nameEn: 'Growth Readiness & Program Participation', weight: 7, questionCount: 4 },
]

const QUESTION_TEXTS: [number, number, string][] = [
  [1, 1, 'ร้านมีเมนูหลักที่ขายดีและลูกค้าจดจำได้ชัดเจน'],
  [2, 1, 'รสชาติอาหารมีความสม่ำเสมอ'],
  [3, 1, 'มีสูตรมาตรฐานหรือวิธีทำที่บันทึกไว้'],
  [4, 1, 'วัตถุดิบหลักมีคุณภาพและควบคุมความสดได้'],
  [5, 1, 'เมนูมีจุดเด่นหรืออัตลักษณ์เฉพาะของร้าน'],
  [6, 1, 'มีการรับฟังความคิดเห็นลูกค้าเพื่อนำมาปรับเมนู'],
  [7, 1, 'มีโอกาสพัฒนาเมนู Signature หรือเมนูใหม่เพื่อเพิ่มยอดขาย'],
  [8, 2, 'พื้นที่ครัวสะอาด เป็นระเบียบ และแยกโซนเหมาะสม'],
  [9, 2, 'มีการจัดเก็บวัตถุดิบสด แห้ง และปรุงสุกอย่างถูกสุขลักษณะ'],
  [10, 2, 'เจ้าของร้านหรือพนักงานมีความรู้พื้นฐานด้านสุขอนามัยอาหาร'],
  [11, 2, 'มีการควบคุมวันหมดอายุของวัตถุดิบ'],
  [12, 2, 'อุปกรณ์ครัว ภาชนะ และพื้นที่บริการสะอาดพร้อมใช้งาน'],
  [13, 2, 'ร้านมีใบอนุญาตหรือเอกสารที่เกี่ยวข้องกับการจำหน่ายอาหาร'],
  [14, 2, 'มีแนวทางป้องกันความเสี่ยง เช่น อาหารเสีย ปนเปื้อน หรือข้อร้องเรียนด้านสุขภาพ'],
  [15, 3, 'ร้านมีชื่อ แบรนด์ หรือภาพจำที่ชัดเจน'],
  [16, 3, 'ร้านอธิบายได้ว่าลูกค้ามากินร้านนี้เพราะอะไร'],
  [17, 3, 'กลุ่มลูกค้าเป้าหมายของร้านมีความชัดเจน'],
  [18, 3, 'ร้านมีเรื่องเล่าที่เชื่อมโยงกับอาหาร ท้องถิ่น หรือเจ้าของร้าน'],
  [19, 3, 'รูปแบบรายได้ของร้านชัดเจน เช่น หน้าร้าน เดลิเวอรี Catering หรือออกบูธ'],
  [20, 3, 'ร้านมีแนวคิดในการต่อยอด เช่น สินค้าพร้อมขาย แพ็กเกจจิ้ง หรือแฟรนไชส์'],
  [21, 4, 'ร้านมีช่องทางออนไลน์ เช่น Facebook, TikTok, LINE OA หรือ Google Maps'],
  [22, 4, 'ข้อมูลร้านออนไลน์ถูกต้อง เช่น เวลาเปิด–ปิด เบอร์โทร พิกัด และเมนู'],
  [23, 4, 'มีภาพอาหารหรือคอนเทนต์ที่ช่วยกระตุ้นยอดขาย'],
  [24, 4, 'ร้านมีฐานลูกค้าประจำหรือมีวิธีทำให้ลูกค้ากลับมาซื้อซ้ำ'],
  [25, 4, 'มีการทำโปรโมชันหรือกิจกรรมการตลาดอย่างเหมาะสม'],
  [26, 4, 'ร้านรู้ว่าช่องทางใดสร้างยอดขายดีที่สุด'],
  [27, 4, 'ร้านมีโอกาสขยายตลาดใหม่ เช่น เดลิเวอรี ออกงาน หน่วยงาน โรงแรม หรือการท่องเที่ยว'],
  [28, 5, 'ร้านรู้ต้นทุนวัตถุดิบของเมนูหลัก'],
  [29, 5, 'ร้านตั้งราคาขายโดยอิงต้นทุนและกำไร'],
  [30, 5, 'ร้านแยกเงินร้านกับเงินส่วนตัวออกจากกัน'],
  [31, 5, 'มีการบันทึกรายรับ–รายจ่ายอย่างสม่ำเสมอ'],
  [32, 5, 'ร้านรู้ยอดขายเฉลี่ยต่อวันและต่อเดือน'],
  [33, 5, 'ร้านรู้ว่าเมนูใดกำไรดี และเมนูใดควรปรับราคา'],
  [34, 5, 'ร้านมีเงินหมุนเวียนเพียงพอสำหรับวัตถุดิบ ค่าแรง ค่าเช่า และค่าใช้จ่ายจำเป็น'],
  [35, 6, 'ร้านมีขั้นตอนการเปิดร้าน–ปิดร้านที่ชัดเจน'],
  [36, 6, 'มีการแบ่งหน้าที่ของเจ้าของร้าน พนักงานครัว และพนักงานบริการ'],
  [37, 6, 'เวลาการออกอาหารเหมาะสม ไม่ทำให้ลูกค้ารอนานเกินไป'],
  [38, 6, 'มีมาตรฐานการบริการ เช่น ต้อนรับ รับออเดอร์ เสิร์ฟอาหาร และรับชำระเงิน'],
  [39, 6, 'มีระบบจัดการสต็อกวัตถุดิบเพื่อลดของเสีย'],
  [40, 6, 'ร้านรับมือช่วงลูกค้าเยอะได้โดยคุณภาพไม่ตก'],
  [41, 6, 'มีระบบจัดการข้อร้องเรียนของลูกค้า'],
  [42, 7, 'ร้านมีแหล่งวัตถุดิบประจำที่เชื่อถือได้'],
  [43, 7, 'มีการใช้วัตถุดิบท้องถิ่นหรือวัตถุดิบเด่นของพื้นที่'],
  [44, 7, 'ร้านมีซัพพลายเออร์สำรอง หากวัตถุดิบหลักขาดตลาด'],
  [45, 7, 'มีความร่วมมือกับชุมชน กลุ่มเกษตรกร หรือผู้ผลิตท้องถิ่น'],
  [46, 7, 'ร้านมีความเชื่อมโยงกับหน่วยงาน ภาคี หรือเครือข่ายธุรกิจในพื้นที่'],
  [47, 8, 'เจ้าของร้านมีความตั้งใจและเปิดรับการเปลี่ยนแปลง'],
  [48, 8, 'ร้านพร้อมให้ทีมโครงการลงพื้นที่ ตรวจประเมิน และให้คำปรึกษาแบบ 1-on-1'],
  [49, 8, 'ร้านสามารถจัดเตรียมข้อมูลสำคัญ เช่น รูปเมนู รูปร้าน ยอดขาย ต้นทุน และปัญหาหลัก'],
  [50, 8, 'ร้านมีเป้าหมายการพัฒนาภายใน 3–6 เดือน เช่น เพิ่มยอดขาย ลดต้นทุน ปรับเมนู ทำแบรนด์ หรือขยายช่องทางขาย'],
]

export const questionSeed: Question[] = QUESTION_TEXTS.map(([id, dimensionId, questionText]) => ({
  id,
  dimensionId,
  questionNo: id,
  questionText,
  maxScore: 4,
}))

let assessments: Assessment[] = []
let idCounter = 0

function summarize(a: Assessment): AssessmentSummary {
  return {
    id: a.id,
    storeId: a.storeId,
    round: a.round,
    assessorId: a.assessorId,
    status: a.status,
    totalScore: a.totalScore,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    submittedAt: a.submittedAt,
  }
}

export const assessmentDb = {
  reset: () => {
    assessments = []
    idCounter = 0
  },

  findByStoreAndRound: (storeId: string, round: Round): Assessment | null =>
    assessments.find((a) => a.storeId === storeId && a.round === round) ?? null,

  findAllByStore: (storeId: string): AssessmentSummary[] =>
    assessments.filter((a) => a.storeId === storeId).map(summarize),

  findAllByRound: (round: Round): Assessment[] => assessments.filter((a) => a.round === round),

  findById: (id: string): Assessment | null => assessments.find((a) => a.id === id) ?? null,

  create: (storeId: string, round: Round, assessorId: string): Assessment => {
    idCounter += 1
    const now = new Date().toISOString()
    const assessment: Assessment = {
      id: `mock-assessment-${idCounter}`,
      storeId,
      round,
      assessorId,
      status: 'DRAFT',
      totalScore: null,
      zone: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
      submittedAt: null,
      questions: questionSeed.map((q) => ({
        questionId: q.id,
        questionNo: q.questionNo,
        dimensionId: q.dimensionId,
        questionText: q.questionText,
        maxScore: q.maxScore,
        rawScore: null,
        note: null,
        suggestion: null,
        evidence: [],
      })),
      redFlags: [],
    }
    assessments = [...assessments, assessment]
    return assessment
  },

  updateScore: (
    assessmentId: string,
    questionId: number,
    data: { rawScore: number; note?: string; suggestion?: string }
  ): Assessment | null => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return null
    assessment.questions = assessment.questions.map((q) =>
      q.questionId === questionId
        ? {
            ...q,
            rawScore: data.rawScore,
            note: data.note ?? q.note,
            suggestion: data.suggestion ?? q.suggestion,
          }
        : q
    )
    assessment.updatedAt = new Date().toISOString()
    return assessment
  },

  addEvidence: (
    assessmentId: string,
    questionId: number,
    file: { filename: string; fileType: string; fileSize: number }
  ): EvidenceFile | null => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return null
    const question = assessment.questions.find((q) => q.questionId === questionId)
    if (!question || question.rawScore === null) return null
    idCounter += 1
    const evidence: EvidenceFile = {
      id: `mock-evidence-${idCounter}`,
      ...file,
      url: `/uploads/evidence/${assessmentId}/mock-evidence-${idCounter}`,
      uploadedAt: new Date().toISOString(),
    }
    question.evidence = [...question.evidence, evidence]
    assessment.updatedAt = new Date().toISOString()
    return evidence
  },

  removeEvidence: (assessmentId: string, evidenceId: string): boolean => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return false
    let removed = false
    assessment.questions = assessment.questions.map((q) => {
      if (q.evidence.some((e) => e.id === evidenceId)) {
        removed = true
        return { ...q, evidence: q.evidence.filter((e) => e.id !== evidenceId) }
      }
      return q
    })
    if (removed) assessment.updatedAt = new Date().toISOString()
    return removed
  },

  updateNotes: (assessmentId: string, notes: string): Assessment | null => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return null
    assessment.notes = notes
    assessment.updatedAt = new Date().toISOString()
    return assessment
  },

  submit: (assessmentId: string): Assessment | null => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return null

    const dimensionScores = new Map<number, number>()
    for (const dim of dimensionSeed) {
      const dimQuestions = assessment.questions.filter((q) => q.dimensionId === dim.id)
      const sum = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0)
      dimensionScores.set(dim.id, (sum / (dim.questionCount * 4)) * 100)
    }
    const totalScore = dimensionSeed.reduce(
      (sum, dim) => sum + ((dimensionScores.get(dim.id) ?? 0) * dim.weight) / 100,
      0
    )

    assessment.status = 'SUBMITTED'
    assessment.totalScore = totalScore
    assessment.submittedAt = new Date().toISOString()
    assessment.updatedAt = assessment.submittedAt
    return assessment
  },

  remove: (assessmentId: string): boolean => {
    const prev = assessments.length
    assessments = assessments.filter((a) => a.id !== assessmentId)
    return assessments.length < prev
  },
}

export function getDimensionAverages(round: Round): Map<number, number> {
  const submitted = assessments.filter((a) => a.round === round && a.status === 'SUBMITTED')
  const averages = new Map<number, number>()
  for (const dim of dimensionSeed) {
    if (submitted.length === 0) {
      averages.set(dim.id, 0)
      continue
    }
    const pctSum = submitted.reduce((sum, a) => {
      const dimQuestions = a.questions.filter((q) => q.dimensionId === dim.id)
      const raw = dimQuestions.reduce((acc, q) => acc + (q.rawScore ?? 0), 0)
      return sum + (raw / (dim.questionCount * 4)) * 100
    }, 0)
    averages.set(dim.id, Math.round((pctSum / submitted.length) * 10) / 10)
  }
  return averages
}
