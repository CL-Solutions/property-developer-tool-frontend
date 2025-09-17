'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { LiveTrafficLights } from './live-traffic-lights';
import { RentalStrategySelector } from './rental-strategy-selector';
import { UnitData } from './multi-family-house-form';
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Home,
  Euro,
  TrendingUp,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock BlackVesto partners
const BLACKVESTO_PARTNERS = [
  { id: 'bv-001', name: 'BlackVesto Munich' },
  { id: 'bv-002', name: 'BlackVesto Berlin' },
  { id: 'bv-003', name: 'BlackVesto Hamburg' },
  { id: 'bv-004', name: 'BlackVesto Frankfurt' },
];

interface UnitCardProps {
  unit: UnitData;
  index: number;
  onUpdate: (updates: Partial<UnitData>) => void;
  onRemove: () => void;
  canRemove: boolean;
  buildingEnergyClass: string;
  buildingConstructionYear: number | null;
  city: string;
}

export function UnitCard({
  unit,
  index,
  onUpdate,
  onRemove,
  canRemove,
  buildingEnergyClass,
  buildingConstructionYear,
  city
}: UnitCardProps) {
  const [isOpen, setIsOpen] = useState(index === 0); // First unit open by default

  // Calculate unit totals
  const totalInvestment = (unit.purchasePrice || 0) +
                         (unit.renovationBudget || 0) +
                         (unit.furnishingBudget || 0);

  // Calculate WG total rent if applicable
  const totalWgRent = unit.wgRooms?.reduce((sum, room) => sum + (room.rent || 0), 0) || 0;

  const monthlyRent = unit.vacancyStatus === 'rented'
    ? unit.currentRent
    : unit.rentalStrategy === 'wg'
      ? totalWgRent
      : unit.plannedRent;

  const grossYield = totalInvestment > 0 && monthlyRent
    ? (monthlyRent * 12 / totalInvestment * 100)
    : 0;

  const hasMinimumData = unit.livingArea && unit.purchasePrice && monthlyRent;

  return (
    <Card className={cn("transition-all", isOpen && "shadow-md")}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                <div className="text-left">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    {unit.unitNumber || `Unit ${index + 1}`}
                    {unit.floor && <span className="text-sm font-normal text-muted-foreground">· {unit.floor}</span>}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {unit.livingArea ? `${unit.livingArea} m²` : 'Size not set'}
                    {unit.rooms && ` · ${unit.rooms} rooms`}
                    {totalInvestment > 0 && ` · €${totalInvestment.toLocaleString()}`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Quick metrics */}
                {grossYield > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Yield</p>
                    <p className={cn(
                      "text-lg font-bold",
                      grossYield >= 5 ? "text-green-600" :
                      grossYield >= 3.5 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {grossYield.toFixed(1)}%
                    </p>
                  </div>
                )}
                {/* Mini traffic lights */}
                {hasMinimumData && (
                  <LiveTrafficLights
                    livingArea={unit.livingArea}
                    purchasePrice={unit.purchasePrice}
                    renovationBudget={unit.renovationBudget}
                    furnishingBudget={unit.furnishingBudget}
                    monthlyRent={monthlyRent}
                    hoaFees={unit.hoaFees}
                    energyClass={buildingEnergyClass}
                    constructionYear={buildingConstructionYear}
                    city={city}
                    unitId={unit.unitNumber}
                    compact={true}
                  />
                )}
                {canRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <Separator />

            {/* Basic Information */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Unit Details</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`unit-${unit.id}-number`}>Unit Number</Label>
                  <Input
                    id={`unit-${unit.id}-number`}
                    value={unit.unitNumber}
                    onChange={(e) => onUpdate({ unitNumber: e.target.value })}
                    placeholder="WE01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${unit.id}-floor`}>Floor</Label>
                  <Input
                    id={`unit-${unit.id}-floor`}
                    value={unit.floor}
                    onChange={(e) => onUpdate({ floor: e.target.value })}
                    placeholder="1. OG"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${unit.id}-area`}>Living Area (m²)</Label>
                  <Input
                    id={`unit-${unit.id}-area`}
                    type="number"
                    value={unit.livingArea || ''}
                    onChange={(e) => onUpdate({ livingArea: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`unit-${unit.id}-rooms`}>Rooms</Label>
                  <Input
                    id={`unit-${unit.id}-rooms`}
                    type="number"
                    value={unit.rooms || ''}
                    onChange={(e) => onUpdate({ rooms: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="3"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Financial Information */}
            <div>
              <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Financial Information
              </Label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-price`}>Purchase Price (Kaufpreis) (€)</Label>
                    <Input
                      id={`unit-${unit.id}-price`}
                      type="number"
                      value={unit.purchasePrice || ''}
                      onChange={(e) => onUpdate({ purchasePrice: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="180000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-selling`}>Selling Price (Abgabepreis) (€)</Label>
                    <Input
                      id={`unit-${unit.id}-selling`}
                      type="number"
                      value={unit.sellingPrice || ''}
                      onChange={(e) => onUpdate({ sellingPrice: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="250000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-renovation`}>Renovation (€)</Label>
                    <Input
                      id={`unit-${unit.id}-renovation`}
                      type="number"
                      value={unit.renovationBudget || ''}
                      onChange={(e) => onUpdate({ renovationBudget: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="20000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-furnishing`}>Furnishing (€)</Label>
                    <Input
                      id={`unit-${unit.id}-furnishing`}
                      type="number"
                      value={unit.furnishingBudget || ''}
                      onChange={(e) => onUpdate({ furnishingBudget: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="8000"
                    />
                  </div>
                </div>

                {/* HOA Fees */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-hoa`}>Monthly HOA Fees (€)</Label>
                    <Input
                      id={`unit-${unit.id}-hoa`}
                      type="number"
                      value={unit.hoaFees || ''}
                      onChange={(e) => onUpdate({ hoaFees: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="150"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Checkbox
                      id={`unit-${unit.id}-hoa-transfer`}
                      checked={unit.hoaTransferable}
                      onCheckedChange={(checked) => onUpdate({ hoaTransferable: !!checked })}
                    />
                    <Label htmlFor={`unit-${unit.id}-hoa-transfer`}>Transferable to tenant</Label>
                  </div>
                </div>

                {totalInvestment > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Unit Investment:</span>
                      <span className="text-lg font-bold text-blue-600">
                        €{totalInvestment.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Vacancy Status */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Occupancy Status</Label>
              <RadioGroup
                value={unit.vacancyStatus}
                onValueChange={(value) => onUpdate({ vacancyStatus: value as 'vacant' | 'rented' })}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vacant" id={`unit-${unit.id}-vacant`} />
                    <Label htmlFor={`unit-${unit.id}-vacant`}>Currently Vacant</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rented" id={`unit-${unit.id}-rented`} />
                    <Label htmlFor={`unit-${unit.id}-rented`}>Currently Rented</Label>
                  </div>
                </div>
              </RadioGroup>

              {unit.vacancyStatus === 'rented' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor={`unit-${unit.id}-current-rent`}>Current Monthly Rent (€)</Label>
                  <Input
                    id={`unit-${unit.id}-current-rent`}
                    type="number"
                    value={unit.currentRent || ''}
                    onChange={(e) => onUpdate({ currentRent: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="900"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Sales Partner */}
            <div>
              <Label className="text-sm font-semibold mb-3 block flex items-center gap-2">
                <Users className="h-4 w-4" />
                Sales Partner
              </Label>
              <div className="space-y-4">
                <RadioGroup
                  value={unit.salesPartner}
                  onValueChange={(value) => onUpdate({ salesPartner: value as 'internal' | 'blackvesto' })}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id={`unit-${unit.id}-internal`} />
                      <Label htmlFor={`unit-${unit.id}-internal`}>Internal Sales</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blackvesto" id={`unit-${unit.id}-blackvesto`} />
                      <Label htmlFor={`unit-${unit.id}-blackvesto`}>BlackVesto Partner</Label>
                    </div>
                  </div>
                </RadioGroup>

                {unit.salesPartner === 'blackvesto' && (
                  <div className="space-y-2">
                    <Label htmlFor={`unit-${unit.id}-bv-partner`}>Select BlackVesto Partner</Label>
                    <Select
                      value={unit.blackvestoPartner}
                      onValueChange={(value) => onUpdate({ blackvestoPartner: value })}
                    >
                      <SelectTrigger id={`unit-${unit.id}-bv-partner`}>
                        <SelectValue placeholder="Choose a partner" />
                      </SelectTrigger>
                      <SelectContent>
                        {BLACKVESTO_PARTNERS.map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Rental Strategy (only for vacant units) */}
            {unit.vacancyStatus === 'vacant' && (
              <>
                <Separator />
                <RentalStrategySelector
                  strategy={unit.rentalStrategy}
                  onStrategyChange={(strategy) => onUpdate({ rentalStrategy: strategy })}
                  plannedRent={unit.plannedRent}
                  onPlannedRentChange={(rent) => onUpdate({ plannedRent: rent })}
                  wgRooms={unit.wgRooms}
                  onWgRoomsChange={(rooms) => onUpdate({ wgRooms: rooms })}
                  livingArea={unit.livingArea}
                  disabled={false}
                />
              </>
            )}

            {/* Unit-level traffic lights (full view) */}
            {hasMinimumData && (
              <>
                <Separator />
                <LiveTrafficLights
                  livingArea={unit.livingArea}
                  purchasePrice={unit.purchasePrice}
                  renovationBudget={unit.renovationBudget}
                  furnishingBudget={unit.furnishingBudget}
                  monthlyRent={monthlyRent}
                  hoaFees={unit.hoaFees}
                  energyClass={buildingEnergyClass}
                  constructionYear={buildingConstructionYear}
                  city={city}
                  unitId={unit.unitNumber}
                  compact={false}
                />
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}