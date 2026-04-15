import BranchInvoiceListPlaceholder from '@/components/BranchInvoiceListPlaceholder';

export default function VietnamInvoiceListPage() {
  return (
    <BranchInvoiceListPlaceholder
      branchNameEn="Vietnam Branch Invoice List"
      branchNameKo="베트남 지점 인보이스 목록"
      subtitleEn="Invoice list page for Vietnam branch"
      subtitleKo="베트남 지점 전용 인보이스 목록 페이지"
      accentClass="bg-green-500"
      createHref="/KR-Vietnam/Admin-Login/invoices/create"
    />
  );
}
