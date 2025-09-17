'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UnitCard } from './unit-card';
import { AggregateTrafficLights } from './aggregate-traffic-lights';
import {
  MapPin,
  Building2,
  Plus,
  Save,
  Send,
  Euro,
  Zap,
  AlertCircle,
  Calculator,
  TrendingUp,
  Users,
  Upload,
  File,
  FileText
} from 'lucide-react';

// Mock BlackVesto partners
const BLACKVESTO_PARTNERS = [
  { id: 'bv-001', name: 'BlackVesto Munich' },
  { id: 'bv-002', name: 'BlackVesto Berlin' },
  { id: 'bv-003', name: 'BlackVesto Hamburg' },
  { id: 'bv-004', name: 'BlackVesto Frankfurt' },
];

interface BuildingData {
  // Address
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;

  // Building info
  constructionYear: number | null;
  totalFloors: number | null;
  totalBuildingArea: number | null;

  // Energy
  energyClass: string;

  // Building-wide renovations
  buildingRenovationBudget: number | null;
  renovationDescription: string;

  // Special conditions
  historicPreservation: boolean;
  propertyDivision: boolean;
  subsidies: string;
  encumbrances: string;

  // Building-level sales partner
  defaultSalesPartner: 'internal' | 'blackvesto';
  defaultBlackvestoPartner?: string;

  // Document uploads
  floorPlanFile: File | null;
  energyCertificateFile: File | null;
}

export interface UnitData {
  id: string;
  unitNumber: string;
  floor: string;
  livingArea: number | null;
  rooms: number | null;
  purchasePrice: number | null;
  sellingPrice: number | null; // Abgabepreis
  renovationBudget: number | null;
  furnishingBudget: number | null;
  hoaFeesLandlord: number | null;
  hoaFeesReserve: number | null;
  hoaTransferable: boolean;
  vacancyStatus: 'vacant' | 'rented';
  currentRent: number | null;
  rentalStrategy: 'standard' | 'wg';
  plannedRent: number | null;
  salesPartner: 'internal' | 'blackvesto';
  blackvestoPartner?: string;
  wgRooms?: Array<{ name: string; size: number; rent: number }>;
}

interface MultiFamilyHouseFormProps {
  initialData?: {
    buildingAddress?: {
      street: string;
      houseNumber: string;
      zipCode: string;
      city: string;
    };
    buildingDetails?: {
      buildYear: number;
      totalPurchasePrice: number;
      defaultSalesPartner: 'internal' | 'blackvesto';
      defaultBlackVestoPartner?: string;
    };
    energyData?: {
      energyClass: string;
      energyValue: number;
      energyType: string;
    };
    units?: Array<Record<string, unknown>>;
  };
  onSave?: (data: Record<string, unknown>) => void | Promise<void>;
  isEditMode?: boolean;
  isSaving?: boolean;
}

export function MultiFamilyHouseForm({
  initialData,
  onSave,
  isEditMode = false,
  isSaving = false
}: MultiFamilyHouseFormProps = {}) {
  const [buildingData, setBuildingData] = useState<BuildingData>({
    street: '',
    houseNumber: '',
    city: 'Munich',
    zipCode: '',
    constructionYear: null,
    totalFloors: null,
    totalBuildingArea: null,
    energyClass: '',
    buildingRenovationBudget: null,
    renovationDescription: '',
    historicPreservation: false,
    propertyDivision: false,
    subsidies: '',
    encumbrances: '',
    defaultSalesPartner: 'internal',
    defaultBlackvestoPartner: undefined,
    floorPlanFile: null,
    energyCertificateFile: null
  });

  const [units, setUnits] = useState<UnitData[]>([
    {
      id: '1',
      unitNumber: 'WE01',
      floor: 'EG',
      livingArea: null,
      rooms: null,
      purchasePrice: null,
      sellingPrice: null,
      renovationBudget: null,
      furnishingBudget: null,
      hoaFeesLandlord: null,
      hoaFeesReserve: null,
      hoaTransferable: false,
      vacancyStatus: 'vacant',
      currentRent: null,
      rentalStrategy: 'standard',
      plannedRent: null,
      salesPartner: 'internal',
      blackvestoPartner: undefined
    }
  ]);

  const updateBuildingData = (field: keyof BuildingData, value: string | number | boolean) => {
    setBuildingData(prev => ({ ...prev, [field]: value }));
  };

  const updateUnit = (unitId: string, updates: Partial<UnitData>) => {
    setUnits(prev => prev.map(unit =>
      unit.id === unitId ? { ...unit, ...updates } : unit
    ));
  };

  const addUnit = () => {
    const nextNumber = units.length + 1;
    const newUnit: UnitData = {
      id: String(nextNumber),
      unitNumber: `WE${String(nextNumber).padStart(2, '0')}`,
      floor: '',
      livingArea: null,
      rooms: null,
      purchasePrice: null,
      sellingPrice: null,
      renovationBudget: null,
      furnishingBudget: null,
      hoaFeesLandlord: null,
      hoaFeesReserve: null,
      hoaTransferable: false,
      vacancyStatus: 'vacant',
      currentRent: null,
      rentalStrategy: 'standard',
      plannedRent: null,
      salesPartner: buildingData.defaultSalesPartner,
      blackvestoPartner: buildingData.defaultBlackvestoPartner
    };
    setUnits(prev => [...prev, newUnit]);
  };

  const removeUnit = (unitId: string) => {
    if (units.length > 1) {
      setUnits(prev => prev.filter(unit => unit.id !== unitId));
    }
  };

  const handleSubmit = async () => {
    console.log('Submitting MFH pre-check:', { buildingData, units });
  };

  const handleSaveDraft = () => {
    console.log('Saving MFH draft:', { buildingData, units });
  };

  // Calculate totals
  const totalInvestment = units.reduce((sum, unit) =>
    sum + (unit.purchasePrice || 0) + (unit.renovationBudget || 0) + (unit.furnishingBudget || 0),
    0
  ) + (buildingData.buildingRenovationBudget || 0);

  const totalMonthlyRent = units.reduce((sum, unit) => {
    const wgTotalRent = unit.wgRooms?.reduce((roomSum, room) => roomSum + (room.rent || 0), 0) || 0;
    const rent = unit.vacancyStatus === 'rented'
      ? unit.currentRent
      : unit.rentalStrategy === 'wg'
        ? wgTotalRent
        : unit.plannedRent;
    return sum + (rent || 0);
  }, 0);

  const averageYield = totalInvestment > 0
    ? (totalMonthlyRent * 12 / totalInvestment * 100)
    : 0;

  const hasMinimumData = units.some(unit =>
    unit.livingArea && unit.purchasePrice && (unit.currentRent || unit.plannedRent)
  );

  return (
    <div className="space-y-6">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Building Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Building Information
              </CardTitle>
              <CardDescription>
                Shared information that applies to all units in the building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Address</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input
                      id="street"
                      value={buildingData.street}
                      onChange={(e) => updateBuildingData('street', e.target.value)}
                      placeholder="Street name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="houseNumber">House Number</Label>
                    <Input
                      id="houseNumber"
                      value={buildingData.houseNumber}
                      onChange={(e) => updateBuildingData('houseNumber', e.target.value)}
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={buildingData.city}
                      onChange={(e) => updateBuildingData('city', e.target.value)}
                      placeholder="Munich"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={buildingData.zipCode}
                      onChange={(e) => updateBuildingData('zipCode', e.target.value)}
                      placeholder="80336"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Building Details */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Building Details</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="constructionYear">Construction Year</Label>
                    <Input
                      id="constructionYear"
                      type="number"
                      value={buildingData.constructionYear || ''}
                      onChange={(e) => updateBuildingData('constructionYear', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="1990"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalFloors">Total Floors</Label>
                    <Input
                      id="totalFloors"
                      type="number"
                      value={buildingData.totalFloors || ''}
                      onChange={(e) => updateBuildingData('totalFloors', e.target.value ? parseInt(e.target.value) : 0)}
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalBuildingArea">Total Area (m²)</Label>
                    <Input
                      id="totalBuildingArea"
                      type="number"
                      value={buildingData.totalBuildingArea || ''}
                      onChange={(e) => updateBuildingData('totalBuildingArea', e.target.value ? parseFloat(e.target.value) : 0)}
                      placeholder="500"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Energy & Renovations */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Energy & Building Renovations</Label>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="energyClass">Energy Class</Label>
                    <Select
                      value={buildingData.energyClass}
                      onValueChange={(value) => updateBuildingData('energyClass', value)}
                    >
                      <SelectTrigger id="energyClass">
                        <SelectValue placeholder="Select energy class" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(cls => (
                          <SelectItem key={cls} value={cls}>
                            Class {cls} {cls <= 'C' ? '(Green)' : cls <= 'E' ? '(Yellow)' : '(Red)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="buildingRenovationBudget">
                      Building-wide Renovation Budget (€)
                    </Label>
                    <Input
                      id="buildingRenovationBudget"
                      type="number"
                      value={buildingData.buildingRenovationBudget || ''}
                      onChange={(e) => updateBuildingData('buildingRenovationBudget', e.target.value ? parseFloat(e.target.value) : 0)}
                      placeholder="50000"
                    />
                    <p className="text-xs text-muted-foreground">
                      For roof, facade, heating system, etc.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="renovationDescription">Renovation Description</Label>
                    <Textarea
                      id="renovationDescription"
                      value={buildingData.renovationDescription}
                      onChange={(e) => updateBuildingData('renovationDescription', e.target.value)}
                      placeholder="Describe planned building-wide renovations..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Special Conditions */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Special Conditions</Label>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="historicPreservation"
                        checked={buildingData.historicPreservation}
                        onCheckedChange={(checked) => updateBuildingData('historicPreservation', !!checked)}
                      />
                      <Label htmlFor="historicPreservation">Historic Preservation (Denkmalschutz)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="propertyDivision"
                        checked={buildingData.propertyDivision}
                        onCheckedChange={(checked) => updateBuildingData('propertyDivision', !!checked)}
                      />
                      <Label htmlFor="propertyDivision">Property Division Planned (Aufteilung)</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subsidies">Available Subsidies (Förderungen)</Label>
                    <Textarea
                      id="subsidies"
                      value={buildingData.subsidies}
                      onChange={(e) => updateBuildingData('subsidies', e.target.value)}
                      placeholder="e.g., KfW Energy Efficiency Grant"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encumbrances">Encumbrances (Baulasten)</Label>
                    <Textarea
                      id="encumbrances"
                      value={buildingData.encumbrances}
                      onChange={(e) => updateBuildingData('encumbrances', e.target.value)}
                      placeholder="e.g., Right of way"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Building-level Sales Partner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="h-5 w-5" />
                Default Sales Partner
              </CardTitle>
              <CardDescription>
                Pre-select sales partner for all units (can be overridden per unit)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={buildingData.defaultSalesPartner}
                onValueChange={(value) => updateBuildingData('defaultSalesPartner', value as 'internal' | 'blackvesto')}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="internal" id="building-internal" />
                    <Label htmlFor="building-internal">Internal Sales</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="blackvesto" id="building-blackvesto" />
                    <Label htmlFor="building-blackvesto">BlackVesto Partner</Label>
                  </div>
                </div>
              </RadioGroup>

              {buildingData.defaultSalesPartner === 'blackvesto' && (
                <div className="space-y-2">
                  <Label htmlFor="building-bv-partner">Select Default BlackVesto Partner</Label>
                  <Select
                    value={buildingData.defaultBlackvestoPartner}
                    onValueChange={(value) => updateBuildingData('defaultBlackvestoPartner', value)}
                  >
                    <SelectTrigger id="building-bv-partner">
                      <SelectValue placeholder="Choose a partner for all units" />
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

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This selection will be applied to all new units. Each unit can still have its sales partner changed individually.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Document Uploads */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Building Documents
              </CardTitle>
              <CardDescription>
                Upload floor plans and energy certificate for the entire building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building-floorPlan">Building Floor Plans</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                    <input
                      id="building-floorPlan"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {/* Handle file upload */}}
                      className="hidden"
                    />
                    <label
                      htmlFor="building-floorPlan"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {buildingData.floorPlanFile ? (
                        <>
                          <File className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-sm font-medium">{buildingData.floorPlanFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(buildingData.floorPlanFile.size / 1024).toFixed(1)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">Upload Floor Plans</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="building-energyCert">Energy Certificate</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                    <input
                      id="building-energyCert"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {/* Handle file upload */}}
                      className="hidden"
                    />
                    <label
                      htmlFor="building-energyCert"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      {buildingData.energyCertificateFile ? (
                        <>
                          <File className="h-8 w-8 text-green-500 mb-2" />
                          <p className="text-sm font-medium">{buildingData.energyCertificateFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(buildingData.energyCertificateFile.size / 1024).toFixed(1)} KB
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm font-medium">Upload Energy Certificate</p>
                          <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {(buildingData.floorPlanFile || buildingData.energyCertificateFile) && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    Documents will be attached to all properties in this building
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Units Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Individual Units</h2>
              <Button onClick={addUnit} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Unit
              </Button>
            </div>

            {units.map((unit, index) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                index={index}
                onUpdate={(updates) => updateUnit(unit.id, updates)}
                onRemove={() => removeUnit(unit.id)}
                canRemove={units.length > 1}
                buildingEnergyClass={buildingData.energyClass}
                buildingConstructionYear={buildingData.constructionYear}
                city={buildingData.city}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit for Pre-Check
            </Button>
          </div>
        </div>

        {/* Sidebar with Aggregate Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Units:</span>
                    <span className="font-medium">{units.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Investment:</span>
                    <span className="font-medium">€{totalInvestment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Monthly Rent:</span>
                    <span className="font-medium">€{totalMonthlyRent.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Average Yield:</span>
                    <span className="text-lg font-bold text-green-600">
                      {averageYield.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Per-unit breakdown */}
                {units.length > 1 && (
                  <div className="pt-3 border-t">
                    <p className="text-xs font-medium mb-2">Per Unit:</p>
                    <div className="space-y-1">
                      {units.map(unit => {
                        const unitInvestment = (unit.purchasePrice || 0) + (unit.renovationBudget || 0) + (unit.furnishingBudget || 0);
                        const wgTotalRent = unit.wgRooms?.reduce((roomSum, room) => roomSum + (room.rent || 0), 0) || 0;
                        const unitRent = unit.vacancyStatus === 'rented'
                          ? unit.currentRent
                          : unit.rentalStrategy === 'wg'
                            ? wgTotalRent
                            : unit.plannedRent;
                        const unitYield = unitInvestment > 0 && unitRent ? (unitRent * 12 / unitInvestment * 100) : 0;

                        return (
                          <div key={unit.id} className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{unit.unitNumber}:</span>
                            <span className={unitYield > 4 ? 'text-green-600' : unitYield > 3 ? 'text-yellow-600' : 'text-red-600'}>
                              {unitYield.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Aggregate Traffic Lights */}
            {hasMinimumData ? (
              <AggregateTrafficLights
                units={units}
                buildingData={buildingData}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                    Traffic Light Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Complete at least one unit with living area, purchase price, and rental income to see assessment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}