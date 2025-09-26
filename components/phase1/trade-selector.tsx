"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Wrench,
  Zap,
  Droplets,
  PaintBucket,
  Home,
  Hammer,
  Bath,
  Sofa,
  TreePine,

  Calculator,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Trade configuration with icons and estimated costs per sqm
const AVAILABLE_TRADES = [
  { id: 'electrical', name: 'Electrical', icon: Zap, costPerSqm: 50, description: 'Wiring, outlets, lighting' },
  { id: 'plumbing', name: 'Plumbing', icon: Droplets, costPerSqm: 60, description: 'Pipes, fixtures, drainage' },
  { id: 'painting', name: 'Painting', icon: PaintBucket, costPerSqm: 25, description: 'Walls, ceilings, trim' },
  { id: 'flooring', name: 'Flooring', icon: Home, costPerSqm: 70, description: 'Hardwood, tiles, carpet' },
  { id: 'kitchen', name: 'Kitchen', icon: Home, costPerSqm: 150, description: 'Cabinets, countertops, appliances' },
  { id: 'bathroom', name: 'Bathroom', icon: Bath, costPerSqm: 120, description: 'Fixtures, tiles, vanity' },
  { id: 'windows', name: 'Windows & Doors', icon: Home, costPerSqm: 80, description: 'Replacement, repair' },
  { id: 'heating', name: 'Heating/Cooling', icon: Home, costPerSqm: 90, description: 'HVAC system, radiators' },
  { id: 'carpentry', name: 'Carpentry', icon: Hammer, costPerSqm: 40, description: 'Built-ins, trim work' },
  { id: 'furniture', name: 'Furnishing', icon: Sofa, costPerSqm: 100, description: 'Complete furniture package' },
  { id: 'landscaping', name: 'Landscaping', icon: TreePine, costPerSqm: 30, description: 'Garden, outdoor areas' },
];

interface TradeSelectorProps {
  livingArea?: number;
  selectedTrades?: string[];
  constructionDescription?: string;
  onTradesChange?: (trades: string[], totalBudget: number) => void;
  onDescriptionChange?: (description: string) => void;
  className?: string;
}

export function TradeSelector({
  livingArea = 0,
  selectedTrades = [],
  constructionDescription = '',
  onTradesChange,
  onDescriptionChange,
  className
}: TradeSelectorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedTrades));
  const [description, setDescription] = useState(constructionDescription);
  const [autoDescription, setAutoDescription] = useState('');

  // Calculate total budget based on selected trades
  const calculateBudget = (trades: Set<string>) => {
    if (!livingArea) return 0;

    return Array.from(trades).reduce((total, tradeId) => {
      const trade = AVAILABLE_TRADES.find(t => t.id === tradeId);
      return total + (trade?.costPerSqm || 0) * livingArea;
    }, 0);
  };

  // Generate automatic description based on selected trades
  useEffect(() => {
    const selectedTradeNames = Array.from(selected)
      .map(id => AVAILABLE_TRADES.find(t => t.id === id)?.name)
      .filter(Boolean);

    if (selectedTradeNames.length === 0) {
      setAutoDescription('');
      return;
    }

    const desc = `Comprehensive renovation including: ${selectedTradeNames.join(', ')}. ` +
      `This renovation will modernize the property and improve its energy efficiency, ` +
      `market value, and rental potential.`;

    setAutoDescription(desc);

    // Only update description if it's empty or was previously auto-generated
    if (!description || description === autoDescription) {
      setDescription(desc);
      onDescriptionChange?.(desc);
    }
  }, [selected, description, autoDescription, onDescriptionChange]);

  const handleTradeToggle = (tradeId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(tradeId)) {
      newSelected.delete(tradeId);
    } else {
      newSelected.add(tradeId);
    }

    setSelected(newSelected);
    const budget = calculateBudget(newSelected);
    onTradesChange?.(Array.from(newSelected), budget);
  };

  const totalBudget = calculateBudget(selected);

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Construction Trades Selection
        </CardTitle>
        <CardDescription>
          Select required renovation trades to estimate budget
          {livingArea > 0 && (
            <span className="ml-2 text-sm">
              (Based on {livingArea} m²)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!livingArea && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter the living area above to calculate accurate budget estimates
            </AlertDescription>
          </Alert>
        )}

        {/* Trade Selection Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {AVAILABLE_TRADES.map((trade) => {
            const TradeIcon = trade.icon;
            const isSelected = selected.has(trade.id);
            const tradeCost = livingArea ? trade.costPerSqm * livingArea : 0;

            return (
              <div
                key={trade.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                  isSelected && "bg-blue-50 border-blue-200"
                )}
              >
                <Checkbox
                  id={trade.id}
                  checked={isSelected}
                  onCheckedChange={() => handleTradeToggle(trade.id)}
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={trade.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <TradeIcon className="h-4 w-4" />
                    <span className="font-medium">{trade.name}</span>
                  </Label>
                  <p className="text-sm text-gray-600">{trade.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      €{trade.costPerSqm}/m²
                    </Badge>
                    {livingArea > 0 && isSelected && (
                      <span className="text-sm font-medium text-blue-600">
                        €{tradeCost.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Budget Summary */}
        {selected.size > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-gray-600" />
                <span className="font-semibold">Estimated Total Budget:</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  €{totalBudget.toLocaleString()}
                </div>
                {livingArea > 0 && (
                  <p className="text-sm text-gray-600">
                    {selected.size} trades × {livingArea} m²
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Construction Description */}
        <div className="space-y-2">
          <Label htmlFor="construction-description">
            Construction Description
          </Label>
          <Textarea
            id="construction-description"
            placeholder="Describe the planned renovations..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              onDescriptionChange?.(e.target.value);
            }}
            className="min-h-[100px]"
          />
          {autoDescription && description !== autoDescription && (
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => {
                setDescription(autoDescription);
                onDescriptionChange?.(autoDescription);
              }}
            >
              Use suggested description
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}