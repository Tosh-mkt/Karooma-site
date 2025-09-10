import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Eye, Copy } from 'lucide-react';
import { getAllFlipbookThemes, getThemeClasses } from '@shared/flipbook-themes';
import { useToast } from '@/hooks/use-toast';

export default function FlipbookThemesAdmin() {
  const themes = getAllFlipbookThemes();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: `Cor ${text} copiada para a área de transferência`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-fredoka text-3xl text-gray-800 mb-2 flex items-center gap-2">
          <Palette className="w-8 h-8 text-purple-600" />
          Temas dos Flipbooks
        </h1>
        <p className="text-gray-600 font-poppins">
          Configuração de cores para cada tema dos flipbooks Karooma.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} onCopyColor={copyToClipboard} />
        ))}
      </div>

      {/* Preview Section */}
      <div className="mt-12">
        <h2 className="font-fredoka text-2xl text-gray-800 mb-6">
          Preview dos Gradientes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <GradientPreview key={theme.id} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme, onCopyColor }: { 
  theme: any; 
  onCopyColor: (color: string) => void; 
}) {
  const colorPairs = [
    { name: 'Primary', value: theme.colors.primary },
    { name: 'Secondary', value: theme.colors.secondary },
    { name: 'Text', value: theme.colors.text },
    { name: 'Light Tone', value: theme.colors.lightTone },
    { name: 'Dark Tone', value: theme.colors.darkTone },
    { name: 'Accent', value: theme.colors.accent },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader 
        className="text-white relative"
        style={{ 
          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
        }}
      >
        <CardTitle className="font-fredoka text-xl">
          {theme.name}
        </CardTitle>
        <Badge variant="secondary" className="w-fit bg-white/20 text-white border-white/30">
          {theme.id}
        </Badge>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Cores do Tema</h4>
            <div className="grid grid-cols-2 gap-3">
              {colorPairs.map((color) => (
                <ColorSwatch
                  key={color.name}
                  name={color.name}
                  value={color.value}
                  onCopy={onCopyColor}
                />
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Gradiente Tailwind</h4>
            <div 
              className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm font-mono cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => onCopyColor(theme.colors.gradient)}
            >
              <span className="text-gray-600">{theme.colors.gradient}</span>
              <Copy className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorSwatch({ name, value, onCopy }: { 
  name: string; 
  value: string; 
  onCopy: (color: string) => void; 
}) {
  return (
    <div 
      className="group cursor-pointer"
      onClick={() => onCopy(value)}
    >
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border-2 border-gray-200 flex-shrink-0 shadow-sm"
          style={{ backgroundColor: value }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-gray-700 truncate">{name}</p>
          <p className="text-xs text-gray-500 font-mono group-hover:text-gray-700 transition-colors">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function GradientPreview({ theme }: { theme: any }) {
  return (
    <div className="space-y-2">
      <div 
        className={`h-24 rounded-lg bg-gradient-to-br ${theme.colors.gradient} shadow-lg flex items-center justify-center`}
      >
        <h3 className="font-fredoka text-white text-lg drop-shadow-md">
          {theme.name}
        </h3>
      </div>
      <p className="text-sm text-gray-600 text-center font-poppins">
        {theme.colors.gradient}
      </p>
    </div>
  );
}