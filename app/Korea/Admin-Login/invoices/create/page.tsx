import BranchInvoiceLanding from '@/components/BranchInvoiceLanding';

export default function KoreaInvoiceCreatePage() {
  return (
    <BranchInvoiceLanding
      branchCode="KR"
      branchNameEn="Korea HQ"
      branchNameKo="한국 본사"
      subtitleEn="Headquarters invoice creation entry page"
      subtitleKo="본사 인보이스 생성 시작 페이지"
      flagSrc="/flags/kr.svg"
      flagAlt="South Korea flag"
      accentClass="bg-orange-500"
      listHref="/Korea/Admin-Login/invoices/list"
    />
  );
}
