'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Wrench, Paintbrush, Zap, Droplets, Home, Hammer } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Trade {
  id: string;
  name: string;
  nameGerman: string;
  category: 'essential' | 'common' | 'optional';
  icon: React.ReactNode;
  estimatedCost?: string;
  description: string;
  autoSelected?: boolean;
}

const trades: Trade[] = [
  {
    id: 'demolition',
    name: 'Demolition',
    nameGerman: 'Abrissarbeiten',
    category: 'common',
    icon: <Hammer className="h-4 w-4" />,
    estimatedCost: '€2,000 - €5,000',
    description: 'Removal of walls, old fixtures, and materials',
    autoSelected: true
  },
  {
    id: 'electrical',
    name: 'Electrical',
    nameGerman: 'Elektrik',
    category: 'essential',
    icon: <Zap className="h-4 w-4" />,
    estimatedCost: '€3,000 - €8,000',
    description: 'Electrical wiring, outlets, and lighting',
    autoSelected: true
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    nameGerman: 'Sanitär',
    category: 'essential',
    icon: <Droplets className="h-4 w-4" />,
    estimatedCost: '€3,000 - €7,000',
    description: 'Water supply, drainage, and bathroom fixtures',
    autoSelected: true
  },
  {
    id: 'painting',
    name: 'Painting',
    nameGerman: 'Malerarbeiten',
    category: 'essential',
    icon: <Paintbrush className="h-4 w-4" />,
    estimatedCost: '€2,000 - €4,000',
    description: 'Wall preparation and painting',
    autoSelected: true
  },
  {
    id: 'flooring',
    name: 'Flooring',
    nameGerman: 'Bodenbelag',
    category: 'essential',
    icon: <Home className="h-4 w-4" />,
    estimatedCost: '€3,000 - €6,000',
    description: 'Floor installation (laminate, tiles, parquet)',
    autoSelected: true
  },
  {
    id: 'carpentry',
    name: 'Carpentry',
    nameGerman: 'Tischlerarbeiten',
    category: 'common',
    icon: <Wrench className="h-4 w-4" />,
    estimatedCost: '€2,000 - €5,000',
    description: 'Doors, built-in furniture, and wood fixtures',
    autoSelected: false
  },
  {
    id: 'hvac',
    name: 'HVAC',
    nameGerman: 'Heizung/Klima',
    category: 'optional',
    icon: <Home className="h-4 w-4" />,
    estimatedCost: '€2,000 - €8,000',
    description: 'Heating and air conditioning systems',
    autoSelected: false
  },
  {
    id: 'windows',
    name: 'Windows',
    nameGerman: 'Fenster',
    category: 'optional',
    icon: <Home className="h-4 w-4" />,
    estimatedCost: '€3,000 - €10,000',
    description: 'Window replacement or renovation',
    autoSelected: false
  },
  {
    id: 'kitchen',
    name: 'Kitchen Installation',
    nameGerman: 'Kücheneinbau',
    category: 'common',
    icon: <Home className="h-4 w-4" />,
    estimatedCost: '€5,000 - €15,000',
    description: 'Kitchen cabinets and appliance installation',
    autoSelected: true
  },
  {
    id: 'bathroom',
    name: 'Bathroom Renovation',
    nameGerman: 'Badsanierung',
    category: 'essential',
    icon: <Droplets className="h-4 w-4" />,
    estimatedCost: '€4,000 - €10,000',
    description: 'Complete bathroom renovation',
    autoSelected: true
  }
];

interface TradeSelectionProps {
  selectedTrades: string[];
  onTradesChange: (trades: string[]) => void;
  propertyType?: 'single' | 'mfh';
  renovationLevel?: 'light' | 'standard' | 'complete';
}

export function TradeSelection({
  selectedTrades,
  onTradesChange,
  renovationLevel = 'standard'
}: Omit<TradeSelectionProps, 'propertyType'>) {
  const [localSelected, setLocalSelected] = useState<string[]>(selectedTrades);

  useEffect(() => {
    // Auto-select trades based on renovation level
    if (selectedTrades.length === 0) {
      const autoSelected = trades
        .filter(trade => {
          if (renovationLevel === 'complete') return true;
          if (renovationLevel === 'standard') return trade.autoSelected;
          if (renovationLevel === 'light') return trade.category === 'essential';
          return false;
        })
        .map(trade => trade.id);

      setLocalSelected(autoSelected);
      onTradesChange(autoSelected);
    }
  }, [renovationLevel, onTradesChange, selectedTrades.length]);

  const handleTradeToggle = (tradeId: string) => {
    const newSelected = localSelected.includes(tradeId)
      ? localSelected.filter(id => id !== tradeId)
      : [...localSelected, tradeId];

    setLocalSelected(newSelected);
    onTradesChange(newSelected);
  };

  const selectAll = () => {
    const allIds = trades.map(t => t.id);
    setLocalSelected(allIds);
    onTradesChange(allIds);
  };

  const clearAll = () => {
    setLocalSelected([]);
    onTradesChange([]);
  };

  const selectEssential = () => {
    const essentialIds = trades
      .filter(t => t.category === 'essential')
      .map(t => t.id);
    setLocalSelected(essentialIds);
    onTradesChange(essentialIds);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'destructive';
      case 'common':
        return 'default';
      case 'optional':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const calculateTotalEstimate = () => {
    const selected = trades.filter(t => localSelected.includes(t.id));
    let minTotal = 0;
    let maxTotal = 0;

    selected.forEach(trade => {
      if (trade.estimatedCost) {
        const match = trade.estimatedCost.match(/€([\d,]+)\s*-\s*€([\d,]+)/);
        if (match) {
          minTotal += parseInt(match[1].replace(',', ''));
          maxTotal += parseInt(match[2].replace(',', ''));
        }
      }
    });

    return `€${minTotal.toLocaleString()} - €${maxTotal.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trade Selection / Gewerkeauswahl</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Select the trades required for your renovation project.
                  Essential trades are pre-selected based on typical requirements.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={selectAll}
          >
            Select All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={selectEssential}
          >
            Essential Only
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearAll}
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {trades.map(trade => (
            <div
              key={trade.id}
              className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                id={trade.id}
                checked={localSelected.includes(trade.id)}
                onCheckedChange={() => handleTradeToggle(trade.id)}
                className="mt-1"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor={trade.id}
                    className="text-sm font-medium cursor-pointer flex items-center gap-2"
                  >
                    {trade.icon}
                    {trade.name} / {trade.nameGerman}
                  </Label>
                  <Badge variant={getCategoryBadgeColor(trade.category)}>
                    {trade.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trade.description}
                </p>
                {trade.estimatedCost && (
                  <p className="text-xs font-medium text-primary">
                    Est. {trade.estimatedCost}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-accent rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selected Trades:</span>
            <span className="text-sm font-bold">{localSelected.length} / {trades.length}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Estimated Total:</span>
            <span className="text-sm font-bold text-primary">
              {calculateTotalEstimate()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}