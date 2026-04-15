import BranchInvoiceListPlaceholder from '@/components/BranchInvoiceListPlaceholder';

export default function BruneiInvoiceListPage() {
  return (
    <BranchInvoiceListPlaceholder
      branchNameEn="Brunei Branch Invoice List"
      branchNameKo="브루나이 지점 인보이스 목록"
      subtitleEn="Invoice list page for Brunei branch"
      subtitleKo="브루나이 지점 전용 인보이스 목록 페이지"
      accentClass="bg-yellow-500"
      createHref="/KR-Brunei/Admin-Login/invoices/create"
    />
  );
}
