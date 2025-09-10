import { OrganizationFlipbook } from '@/components/flipbook/OrganizationFlipbook';
import { FlipbookAccessGuard } from '@/components/flipbook/FlipbookAccessGuard';

export default function FlipbookOrganizacao() {
  return (
    <FlipbookAccessGuard flipbookId="organizacao">
      <div className="w-full h-screen overflow-hidden bg-black">
        <OrganizationFlipbook />
      </div>
    </FlipbookAccessGuard>
  );
}