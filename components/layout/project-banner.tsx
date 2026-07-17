import { getCurrentFiscalYearBE } from '@/utils/get-fiscal-year'

export function ProjectBanner() {
  return (
    <div className="relative overflow-hidden border-b bg-gradient-to-br from-cream-soft to-cream-light px-4 py-4 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-10 top-1/2 h-[60px] w-[120px] -translate-y-1/2 bg-[radial-gradient(circle,rgba(241,113,40,0.18)_1.5px,transparent_1.5px)] [background-size:10px_10px]"
      />
      <p className="text-xl font-extrabold leading-normal text-purple-banner sm:text-2xl">
        หน่วยบริหารเครือข่าย การพัฒนาผู้ประกอบการธุรกิจอาหาร ในภูมิภาค ภาคตะวันออก
      </p>
      <p className="mt-1 text-base font-semibold text-charcoal">
        ภายใต้โครงการการสร้างผู้ประกอบการร้านอาหารไทยมืออาชีพ
      </p>
      <div className="mx-auto mt-3 flex max-w-md items-center gap-2">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-orange" />
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        <span className="whitespace-nowrap text-sm font-semibold text-orange-dark">
          ประจำปีงบประมาณ พ.ศ. {getCurrentFiscalYearBE()}
        </span>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-orange" />
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        มหาวิทยาลัยราชภัฏรำไพพรรณี จังหวัดจันทบุรี
      </p>
    </div>
  )
}
