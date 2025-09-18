'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, Sofa, Bed, Package, Plus, Trash2, Euro } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FurnitureItem {
  id: string;
  name: string;
  nameGerman: string;
  category: 'bedroom' | 'living' | 'kitchen' | 'bathroom' | 'office' | 'other';
  priceRange: { min: number; max: number };
  quantity: number;
  selected: boolean;
  customPrice?: number;
}

const defaultFurnitureItems: FurnitureItem[] = [
  // Bedroom
  { id: 'bed', name: 'Bed', nameGerman: 'Bett', category: 'bedroom', priceRange: { min: 400, max: 800 }, quantity: 1, selected: true },
  { id: 'mattress', name: 'Mattress', nameGerman: 'Matratze', category: 'bedroom', priceRange: { min: 200, max: 500 }, quantity: 1, selected: true },
  { id: 'wardrobe', name: 'Wardrobe', nameGerman: 'Kleiderschrank', category: 'bedroom', priceRange: { min: 300, max: 700 }, quantity: 1, selected: true },
  { id: 'nightstand', name: 'Nightstand', nameGerman: 'Nachttisch', category: 'bedroom', priceRange: { min: 50, max: 150 }, quantity: 2, selected: true },

  // Living Room
  { id: 'sofa', name: 'Sofa', nameGerman: 'Sofa', category: 'living', priceRange: { min: 500, max: 1200 }, quantity: 1, selected: true },
  { id: 'coffee-table', name: 'Coffee Table', nameGerman: 'Couchtisch', category: 'living', priceRange: { min: 100, max: 300 }, quantity: 1, selected: true },
  { id: 'tv-stand', name: 'TV Stand', nameGerman: 'TV-Möbel', category: 'living', priceRange: { min: 150, max: 400 }, quantity: 1, selected: true },
  { id: 'bookshelf', name: 'Bookshelf', nameGerman: 'Bücherregal', category: 'living', priceRange: { min: 100, max: 300 }, quantity: 1, selected: false },

  // Kitchen
  { id: 'dining-table', name: 'Dining Table', nameGerman: 'Esstisch', category: 'kitchen', priceRange: { min: 200, max: 500 }, quantity: 1, selected: true },
  { id: 'dining-chairs', name: 'Dining Chairs', nameGerman: 'Esszimmerstühle', category: 'kitchen', priceRange: { min: 50, max: 150 }, quantity: 4, selected: true },
  { id: 'kitchen-appliances', name: 'Small Appliances', nameGerman: 'Kleingeräte', category: 'kitchen', priceRange: { min: 200, max: 400 }, quantity: 1, selected: true },

  // Bathroom
  { id: 'bathroom-cabinet', name: 'Bathroom Cabinet', nameGerman: 'Badschrank', category: 'bathroom', priceRange: { min: 100, max: 300 }, quantity: 1, selected: false },
  { id: 'mirror', name: 'Mirror', nameGerman: 'Spiegel', category: 'bathroom', priceRange: { min: 50, max: 150 }, quantity: 1, selected: false },

  // Office
  { id: 'desk', name: 'Desk', nameGerman: 'Schreibtisch', category: 'office', priceRange: { min: 150, max: 400 }, quantity: 1, selected: false },
  { id: 'office-chair', name: 'Office Chair', nameGerman: 'Bürostuhl', category: 'office', priceRange: { min: 100, max: 300 }, quantity: 1, selected: false },

  // Other
  { id: 'curtains', name: 'Curtains', nameGerman: 'Vorhänge', category: 'other', priceRange: { min: 30, max: 100 }, quantity: 4, selected: true },
  { id: 'lamps', name: 'Lamps', nameGerman: 'Lampen', category: 'other', priceRange: { min: 30, max: 80 }, quantity: 5, selected: true },
  { id: 'decoration', name: 'Decoration', nameGerman: 'Dekoration', category: 'other', priceRange: { min: 200, max: 500 }, quantity: 1, selected: true },
];

interface FurnitureCalculatorProps {
  rooms?: number;
  propertyType: 'single' | 'mfh';
  isWG?: boolean;
  totalBudget: number;
  onBudgetChange: (budget: number) => void;
}

export function FurnitureCalculator({
  rooms = 2,
  propertyType,
  isWG = false,
  totalBudget,
  onBudgetChange
}: FurnitureCalculatorProps) {
  const [items, setItems] = useState<FurnitureItem[]>(defaultFurnitureItems);
  const [qualityLevel, setQualityLevel] = useState<'basic' | 'standard' | 'premium'>('standard');
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  useEffect(() => {
    // Adjust default selections based on property type and WG status
    if (isWG) {
      // For WG, multiply bedroom furniture by room count
      setItems(prev => prev.map(item => {
        if (item.category === 'bedroom') {
          return { ...item, quantity: rooms - 1, selected: true }; // rooms minus living room
        }
        return item;
      }));
    }
  }, [isWG, rooms]);

  const handleItemToggle = (itemId: string) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleQuantityChange = (itemId: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
    ));
  };

  const handleCustomPriceChange = (itemId: string, price: number) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, customPrice: price } : item
    ));
  };

  const addCustomItem = () => {
    if (customItemName && customItemPrice) {
      const newItem: FurnitureItem = {
        id: `custom-${Date.now()}`,
        name: customItemName,
        nameGerman: customItemName,
        category: 'other',
        priceRange: { min: Number(customItemPrice), max: Number(customItemPrice) },
        quantity: 1,
        selected: true,
        customPrice: Number(customItemPrice)
      };
      setItems([...items, newItem]);
      setCustomItemName('');
      setCustomItemPrice('');
    }
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      if (item.selected) {
        const price = item.customPrice ||
          (qualityLevel === 'basic' ? item.priceRange.min :
           qualityLevel === 'premium' ? item.priceRange.max :
           (item.priceRange.min + item.priceRange.max) / 2);
        total += price * item.quantity;
      }
    });
    return total;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bedroom':
        return <Bed className="h-4 w-4" />;
      case 'living':
        return <Sofa className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bedroom':
        return 'bg-blue-100 text-blue-800';
      case 'living':
        return 'bg-green-100 text-green-800';
      case 'kitchen':
        return 'bg-yellow-100 text-yellow-800';
      case 'bathroom':
        return 'bg-purple-100 text-purple-800';
      case 'office':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const total = calculateTotal();

  useEffect(() => {
    onBudgetChange(total);
  }, [total]); // Removed onBudgetChange from dependencies to prevent infinite loop

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Furniture Planning / Möblierungsplanung</CardTitle>
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-bold">€{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <Select value={qualityLevel} onValueChange={(v) => setQualityLevel(v as 'basic' | 'standard' | 'premium')}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic (IKEA)</SelectItem>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
          {isWG && (
            <Badge variant="secondary">WG Configuration</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Furniture Items List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {['bedroom', 'living', 'kitchen', 'bathroom', 'office', 'other'].map(category => {
            const categoryItems = items.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground capitalize">
                  {category}
                </div>
                {categoryItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-lg border hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={() => handleItemToggle(item.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(item.category)}
                        <span className="text-sm font-medium">
                          {item.name} / {item.nameGerman}
                        </span>
                        <Badge className={getCategoryColor(item.category)}>
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                        className="w-16 h-8 text-center"
                        min="0"
                      />
                      <span className="text-sm">×</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Input
                              type="number"
                              value={item.customPrice || (
                                qualityLevel === 'basic' ? item.priceRange.min :
                                qualityLevel === 'premium' ? item.priceRange.max :
                                Math.round((item.priceRange.min + item.priceRange.max) / 2)
                              )}
                              onChange={(e) => handleCustomPriceChange(item.id, Number(e.target.value))}
                              className="w-20 h-8"
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Range: €{item.priceRange.min} - €{item.priceRange.max}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {item.id.startsWith('custom-') && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Add Custom Item */}
        <div className="p-4 border rounded-lg bg-accent/20">
          <Label className="text-sm font-medium mb-2 block">Add Custom Item</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Item name..."
              value={customItemName}
              onChange={(e) => setCustomItemName(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Price"
              value={customItemPrice}
              onChange={(e) => setCustomItemPrice(e.target.value)}
              className="w-24"
            />
            <Button onClick={addCustomItem} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-accent rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span>Selected Items:</span>
            <span className="font-medium">{items.filter(i => i.selected).length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Pieces:</span>
            <span className="font-medium">
              {items.filter(i => i.selected).reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          </div>
          <div className="border-t pt-2 flex justify-between">
            <span className="font-medium">Total Budget:</span>
            <span className="font-bold text-lg flex items-center gap-1">
              <Euro className="h-4 w-4" />
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}