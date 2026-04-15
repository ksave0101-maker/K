import BranchInvoiceLanding from '@/components/BranchInvoiceLanding';

export default function BruneiInvoiceCreatePage() {
  return (
    <BranchInvoiceLanding
      branchCode="BN"
      branchNameEn="Brunei Branch"
      branchNameKo="브루나이 지점"
      subtitleEn="Brunei invoice creation entry page"
      subtitleKo="브루나이 지점 인보이스 생성 시작 페이지"
      flagSrc="/flags/bn.svg"
      flagAlt="Brunei flag"
      accentClass="bg-yellow-500"
      listHref="/KR-Brunei/Admin-Login/korea-invoices"
    />
  );
}
