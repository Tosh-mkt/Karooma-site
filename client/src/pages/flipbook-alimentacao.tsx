import { AlimentacaoFlipbook } from '@/components/flipbook/AlimentacaoFlipbook';
import { FlipbookAccessGuard } from '@/components/flipbook/FlipbookAccessGuard';

export default function FlipbookAlimentacao() {
  return (
    <FlipbookAccessGuard flipbookId="alimentacao">
      <div className="w-full h-screen overflow-hidden bg-black">
        <AlimentacaoFlipbook />
      </div>
    </FlipbookAccessGuard>
  );
}