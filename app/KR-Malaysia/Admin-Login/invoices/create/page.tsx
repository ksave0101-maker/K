import BranchInvoiceLanding from '@/components/BranchInvoiceLanding';

export default function MalaysiaInvoiceCreatePage() {
  return (
    <BranchInvoiceLanding
      branchCode="MY"
      branchNameEn="Malaysia Branch"
      branchNameKo="말레이시아 지점"
      subtitleEn="Malaysia invoice creation entry page"
      subtitleKo="말레이시아 지점 인보이스 생성 시작 페이지"
      flagSrc="/flags/my.svg"
      flagAlt="Malaysia flag"
      accentClass="bg-purple-500"
      listHref="/KR-Malaysia/Admin-Login/korea-invoices"
    />
  );
}
