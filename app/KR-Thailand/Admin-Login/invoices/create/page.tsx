import BranchInvoiceLanding from '@/components/BranchInvoiceLanding';

export default function ThailandInvoiceCreatePage() {
  return (
    <BranchInvoiceLanding
      branchCode="TH"
      branchNameEn="Thailand Branch"
      branchNameKo="태국 지점"
      subtitleEn="Thailand invoice creation entry page"
      subtitleKo="태국 지점 인보이스 생성 시작 페이지"
      flagSrc="/flags/th.svg"
      flagAlt="Thailand flag"
      accentClass="bg-blue-500"
      formHref="/KR-Thailand/Admin-Login/invoice"
      listHref="/KR-Thailand/Admin-Login/korea-invoices"
    />
  );
}
