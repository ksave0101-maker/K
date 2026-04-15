import BranchInvoiceListPlaceholder from '@/components/BranchInvoiceListPlaceholder';

export default function MalaysiaInvoiceListPage() {
  return (
    <BranchInvoiceListPlaceholder
      branchNameEn="Malaysia Branch Invoice List"
      branchNameKo="말레이시아 지점 인보이스 목록"
      subtitleEn="Invoice list page for Malaysia branch"
      subtitleKo="말레이시아 지점 전용 인보이스 목록 페이지"
      accentClass="bg-purple-500"
      createHref="/KR-Malaysia/Admin-Login/invoices/create"
    />
  );
}
