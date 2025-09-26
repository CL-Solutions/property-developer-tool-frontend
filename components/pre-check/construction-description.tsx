'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wand2, Copy, RefreshCw, FileText } from 'lucide-react';

interface ConstructionDescriptionProps {
  selectedTrades: string[];
  propertyType: 'single' | 'mfh';
  livingArea?: number;
  rooms?: number;
  bathrooms?: number;
  description: string;
  onDescriptionChange: (description: string) => void;
}

const tradeDescriptions: Record<string, string> = {
  demolition: 'Vollständige Entkernung aller nicht tragenden Wände und Altinstallationen',
  electrical: 'Kompletterneuerung der Elektroinstallation nach DIN 18015, inklusive FI-Schutzschalter und moderne Verteileranlage',
  plumbing: 'Erneuerung sämtlicher Wasserleitungen und Abflüsse, Installation moderner Armaturen',
  painting: 'Professionelle Malerarbeiten mit hochwertiger Wandfarbe, Q3 Spachtelung',
  flooring: 'Verlegung von hochwertigem Vinyl-/Laminatboden (Klasse 32) im Wohnbereich',
  carpentry: 'Einbau neuer Innentüren mit Edelstahlbeschlägen, maßgefertigte Einbauschränke',
  hvac: 'Modernisierung der Heizungsanlage, Installation energieeffizienter Heizkörper',
  windows: 'Einbau dreifachverglaster Fenster mit Wärmeschutzverglasung',
  kitchen: 'Einbau einer modernen Einbauküche mit Markengeräten (Bosch/Siemens)',
  bathroom: 'Komplette Badsanierung mit bodenebener Dusche und hochwertigen Sanitärobjekten'
};

const renovationTemplates = {
  light: {
    name: 'Kosmetische Renovierung',
    description: 'Leichte Renovierung mit Fokus auf Oberflächenerneuerung und kleineren Modernisierungen.'
  },
  standard: {
    name: 'Standardsanierung',
    description: 'Umfassende Renovierung mit Erneuerung der wichtigsten Gewerke und Modernisierung der Ausstattung.'
  },
  complete: {
    name: 'Komplettsanierung',
    description: 'Vollständige Kernsanierung mit Erneuerung aller Gewerke und hochwertiger Neuausstattung.'
  },
  luxury: {
    name: 'Luxussanierung',
    description: 'Premium-Sanierung mit hochwertigen Materialien und exklusiver Ausstattung.'
  }
};

export function ConstructionDescription({
  selectedTrades,
  livingArea,
  rooms,
  bathrooms,
  description,
  onDescriptionChange
}: Omit<ConstructionDescriptionProps, 'propertyType'>) {
  const [template, setTemplate] = useState<string>('standard');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDescription = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let generated = `${renovationTemplates[template as keyof typeof renovationTemplates].description}\n\n`;

      // Add property details
      if (livingArea) {
        generated += `**Objektdetails:**\n`;
        generated += `- Wohnfläche: ${livingArea} m²\n`;
        if (rooms) generated += `- Zimmer: ${rooms}\n`;
        if (bathrooms) generated += `- Bäder: ${bathrooms}\n`;
        generated += '\n';
      }

      // Add selected trades descriptions
      generated += `**Geplante Maßnahmen:**\n`;
      selectedTrades.forEach(tradeId => {
        if (tradeDescriptions[tradeId]) {
          const tradeName = tradeId.charAt(0).toUpperCase() + tradeId.slice(1);
          generated += `\n**${tradeName}:**\n`;
          generated += `- ${tradeDescriptions[tradeId]}\n`;
        }
      });

      // Add quality standards
      generated += `\n**Qualitätsstandards:**\n`;
      generated += `- Alle Arbeiten werden von zertifizierten Fachbetrieben ausgeführt\n`;
      generated += `- Verwendung hochwertiger Markenmaterialien\n`;
      generated += `- Gewährleistung gemäß VOB/BGB\n`;
      generated += `- Energetische Optimierung nach aktuellem EnEV-Standard\n`;

      // Add timeline
      generated += `\n**Zeitrahmen:**\n`;
      const weeks = Math.ceil(selectedTrades.length * 1.5);
      generated += `- Geschätzte Renovierungsdauer: ${weeks}-${weeks + 2} Wochen\n`;
      generated += `- Koordinierte Gewerkeplanung zur Minimierung der Bauzeit\n`;

      onDescriptionChange(generated);
      setIsGenerating(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description);
  };

  const clearDescription = () => {
    onDescriptionChange('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Construction Description / Baubeschreibung</CardTitle>
          <Badge variant="secondary">Auto-Generated</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="template">Renovation Template</Label>
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(renovationTemplates).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex flex-col">
                    <span className="font-medium">{value.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={generateDescription}
            disabled={isGenerating || selectedTrades.length === 0}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Description
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={copyToClipboard}
            disabled={!description}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={clearDescription}
            disabled={!description}
          >
            Clear
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Generated Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Click 'Generate Description' to auto-generate based on selected trades..."
            className="min-h-[300px] font-mono text-sm"
          />
        </div>

        {selectedTrades.length === 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Select trades first to generate a construction description
            </p>
          </div>
        )}

        {description && (
          <div className="p-4 bg-accent rounded-lg">
            <p className="text-sm text-muted-foreground">
              Character count: {description.length} / Word count: {description.split(/\s+/).length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}