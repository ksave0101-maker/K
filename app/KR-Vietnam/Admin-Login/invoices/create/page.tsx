import BranchInvoiceLanding from '@/components/BranchInvoiceLanding';

export default function VietnamInvoiceCreatePage() {
  return (
    <BranchInvoiceLanding
      branchCode="VN"
      branchNameEn="Vietnam Branch"
      branchNameKo="베트남 지점"
      subtitleEn="Vietnam invoice creation entry page"
      subtitleKo="베트남 지점 인보이스 생성 시작 페이지"
      flagSrc="/flags/vn.svg"
      flagAlt="Vietnam flag"
      accentClass="bg-green-500"
      listHref="/KR-Vietnam/Admin-Login/korea-invoices"
    />
  );
}
