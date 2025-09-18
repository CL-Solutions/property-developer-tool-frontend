'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { LiveTrafficLights } from './live-traffic-lights';
import { RentalStrategySelector } from './rental-strategy-selector';
import { MockDataService } from '@/lib/mock-data';
import {
  MapPin,
  Building,
  Euro,
  FileText,
  Zap,
  AlertCircle,
  Save,
  Send,
  Users,
  Upload,
  File
} from 'lucide-react';

interface FormData {
  // Address
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;

  // Building data
  constructionYear: number | null;
  livingArea: number | null;
  rooms: number | null;
  floor: string;

  // Vacancy status
  vacancyStatus: 'vacant' | 'rented';
  currentRent: number | null;

  // HOA
  hoaFeesLandlord: number | null;
  hoaFeesReserve: number | null;
  hoaTransferable: boolean;

  // Financial
  purchasePrice: number | null;
  sellingPrice: number | null; // Abgabepreis
  renovationBudget: number | null;

  // Sales Partner
  salesPartner: 'internal' | 'blackvesto';
  blackvestoPartner?: string;

  // Rental
  rentalStrategy: 'standard' | 'wg';
  plannedRent: number | null;
  wgRooms?: Array<{ name: string; size: number; rent: number }>;

  // Energy
  energyClass: string;

  // Special conditions
  historicPreservation: boolean;
  propertyDivision: boolean;
  subsidies: string;
  encumbrances: string;

  // Document uploads
  floorPlanFile: File | null;
  energyCertificateFile: File | null;

  renovationLevel: 'light' | 'standard' | 'complete';
}

// Mock BlackVesto partners
const BLACKVESTO_PARTNERS = [
  { id: 'bv-001', name: 'BlackVesto Munich' },
  { id: 'bv-002', name: 'BlackVesto Berlin' },
  { id: 'bv-003', name: 'BlackVesto Hamburg' },
  { id: 'bv-004', name: 'BlackVesto Frankfurt' },
];

interface SingleApartmentFormProps {
  initialData?: Partial<FormData>;
  onSave?: (data: FormData) => void | Promise<void>;
  isEditMode?: boolean;
  isSaving?: boolean;
  isUnitInMFH?: boolean;
  readOnlyFields?: string[];
}

export function SingleApartmentForm({
  initialData,
  onSave,
  isEditMode = false,
  isSaving = false,
  readOnlyFields = []
}: SingleApartmentFormProps = {}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    street: initialData?.street || '',
    houseNumber: initialData?.houseNumber || '',
    city: initialData?.city || 'Munich',
    zipCode: initialData?.zipCode || '',
    constructionYear: initialData?.constructionYear || 0,
    livingArea: initialData?.livingArea || 0,
    rooms: initialData?.rooms || 0,
    floor: initialData?.floor || '',
    vacancyStatus: initialData?.vacancyStatus || 'vacant',
    currentRent: initialData?.currentRent || 0,
    hoaFeesLandlord: initialData?.hoaFeesLandlord || 0,
    hoaFeesReserve: initialData?.hoaFeesReserve || 0,
    hoaTransferable: initialData?.hoaTransferable || false,
    purchasePrice: initialData?.purchasePrice || 0,
    sellingPrice: initialData?.sellingPrice || 0,
    renovationBudget: initialData?.renovationBudget || 0,
    salesPartner: initialData?.salesPartner || 'blackvesto',
    blackvestoPartner: initialData?.blackvestoPartner || '',
    rentalStrategy: initialData?.rentalStrategy || 'standard',
    plannedRent: initialData?.plannedRent || 0,
    wgRooms: initialData?.wgRooms || [],
    energyClass: initialData?.energyClass || '',
    historicPreservation: initialData?.historicPreservation || false,
    propertyDivision: initialData?.propertyDivision || false,
    subsidies: initialData?.subsidies || '',
    encumbrances: initialData?.encumbrances || '',
    floorPlanFile: initialData?.floorPlanFile || null,
    energyCertificateFile: initialData?.energyCertificateFile || null,
    renovationLevel: initialData?.renovationLevel || 'standard'
  });

  const [showTrafficLights, setShowTrafficLights] = useState(false);

  // Check if minimum data is available for traffic light calculation
  useEffect(() => {
    // Calculate WG total rent
    const wgTotalRent = formData.wgRooms?.reduce((sum, room) => sum + (room.rent || 0), 0) || 0;

    // Check if we have any rental income
    const hasRentalIncome = formData.vacancyStatus === 'rented'
      ? (formData.currentRent || 0) > 0
      : formData.rentalStrategy === 'wg'
        ? wgTotalRent > 0
        : (formData.plannedRent || 0) > 0;

    const hasMinimumData =
      formData.livingArea &&
      formData.purchasePrice &&
      hasRentalIncome;

    setShowTrafficLights(!!hasMinimumData);
  }, [formData]);

  const updateFormData = (field: keyof FormData, value: string | number | boolean | string[] | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value } as FormData));
  };

  const handleSubmit = async () => {
    try {
      if (onSave) {
        // If onSave callback is provided (edit mode), use it
        await onSave(formData);
      } else {
        // Otherwise, create new property (create mode)
        const newProperty = await MockDataService.createPropertyFromPreCheck({
          ...formData,
          furnishingBudget: 0
        });
        // Navigate to the property detail page
        router.push(`/properties/${newProperty.id}`);
      }
    } catch (error) {
      console.error('Failed to save property:', error);
      // In a real app, show an error toast/notification
    }
  };

  const handleSaveDraft = () => {
    // TODO: Save as draft
    console.log('Saving draft:', formData);
  };

  // Calculate total investment
  const totalInvestment = (formData.purchasePrice || 0) +
                          (formData.renovationBudget || 0);

  // Calculate WG total rent if applicable
  const totalWgRent = formData.wgRooms?.reduce((sum, room) => sum + (room.rent || 0), 0) || 0;

  // Get rental income for calculations
  const monthlyRent = formData.vacancyStatus === 'rented'
    ? formData.currentRent
    : formData.rentalStrategy === 'wg'
      ? totalWgRent
      : formData.plannedRent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Address Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Property Address
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) => updateFormData('street', e.target.value)}
                  placeholder="Street name"
                  disabled={readOnlyFields.includes('street')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="houseNumber">House Number</Label>
                <Input
                  id="houseNumber"
                  value={formData.houseNumber}
                  onChange={(e) => updateFormData('houseNumber', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Munich"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => updateFormData('zipCode', e.target.value)}
                  placeholder="80336"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="constructionYear">Construction Year</Label>
                <Input
                  id="constructionYear"
                  type="number"
                  value={formData.constructionYear || ''}
                  onChange={(e) => updateFormData('constructionYear', e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="1990"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) => updateFormData('floor', e.target.value)}
                  placeholder="2. OG"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="livingArea">Living Area (m²)</Label>
                <Input
                  id="livingArea"
                  type="number"
                  value={formData.livingArea || ''}
                  onChange={(e) => updateFormData('livingArea', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="75"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rooms">Number of Rooms</Label>
                <Input
                  id="rooms"
                  type="number"
                  value={formData.rooms || ''}
                  onChange={(e) => updateFormData('rooms', e.target.value ? parseInt(e.target.value) : 0)}
                  placeholder="3"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Vacancy Status</Label>
              <RadioGroup value={formData.vacancyStatus} onValueChange={(value) => updateFormData('vacancyStatus', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vacant" id="vacant" />
                  <Label htmlFor="vacant">Currently Vacant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rented" id="rented" />
                  <Label htmlFor="rented">Currently Rented</Label>
                </div>
              </RadioGroup>

              {formData.vacancyStatus === 'rented' && (
                <div className="space-y-2">
                  <Label htmlFor="currentRent">Current Monthly Rent (€)</Label>
                  <Input
                    id="currentRent"
                    type="number"
                    value={formData.currentRent || ''}
                    onChange={(e) => updateFormData('currentRent', e.target.value ? parseFloat(e.target.value) : 0)}
                    placeholder="1200"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Financial Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price (Kaufpreis) (€)</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={formData.purchasePrice || ''}
                  onChange={(e) => updateFormData('purchasePrice', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="180000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price (Abgabepreis) (€)</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => updateFormData('sellingPrice', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="250000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="renovationBudget">Renovation Budget (€)</Label>
                <Input
                  id="renovationBudget"
                  type="number"
                  value={formData.renovationBudget || ''}
                  onChange={(e) => updateFormData('renovationBudget', e.target.value ? parseFloat(e.target.value) : 0)}
                  placeholder="30000"
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>HOA Fees (Hausgeld)</Label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoaFeesLandlord">HOA - Landlord (€/month)</Label>
                    <Input
                      id="hoaFeesLandlord"
                      type="number"
                      value={formData.hoaFeesLandlord || ''}
                      onChange={(e) => updateFormData('hoaFeesLandlord', e.target.value ? parseFloat(e.target.value) : 0)}
                      placeholder="140"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoaFeesReserve">HOA - Reserve (€/month)</Label>
                    <Input
                      id="hoaFeesReserve"
                      type="number"
                      value={formData.hoaFeesReserve || ''}
                      onChange={(e) => updateFormData('hoaFeesReserve', e.target.value ? parseFloat(e.target.value) : 0)}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hoaTransferable"
                      checked={formData.hoaTransferable}
                      onCheckedChange={(checked) => updateFormData('hoaTransferable', checked)}
                    />
                    <Label htmlFor="hoaTransferable">Transferable to tenant</Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total HOA: €{((formData.hoaFeesLandlord || 0) + (formData.hoaFeesReserve || 0)).toFixed(2)}/month
                  </div>
                </div>
              </div>
            </div>

            {totalInvestment > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Investment:</span>
                  <span className="text-xl font-bold text-blue-600">
                    €{totalInvestment.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sales Partner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Sales Partner Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Sales Partner Type</Label>
              <RadioGroup
                value={formData.salesPartner}
                onValueChange={(value) => updateFormData('salesPartner', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal">Internal Sales</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="blackvesto" id="blackvesto" />
                  <Label htmlFor="blackvesto">BlackVesto Partner</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.salesPartner === 'blackvesto' && (
              <div className="space-y-2">
                <Label htmlFor="blackvestoPartner">Select BlackVesto Partner</Label>
                <Select
                  value={formData.blackvestoPartner}
                  onValueChange={(value) => updateFormData('blackvestoPartner', value)}
                >
                  <SelectTrigger id="blackvestoPartner">
                    <SelectValue placeholder="Choose a BlackVesto partner" />
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

            {formData.salesPartner === 'internal' && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  Property will be marketed and sold internally without external partner commission.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rental Strategy */}
        <RentalStrategySelector
          strategy={formData.rentalStrategy}
          onStrategyChange={(strategy) => updateFormData('rentalStrategy', strategy)}
          plannedRent={formData.plannedRent}
          onPlannedRentChange={(rent) => updateFormData('plannedRent', rent || 0)}
          wgRooms={formData.wgRooms}
          onWgRoomsChange={(rooms) => setFormData(prev => ({ ...prev, wgRooms: rooms }))}
          livingArea={formData.livingArea || 0}
          disabled={formData.vacancyStatus === 'rented'}
        />

        {/* Energy & Special Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Energy Certificate & Special Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="energyClass">Energy Class</Label>
              <Select value={formData.energyClass} onValueChange={(value) => updateFormData('energyClass', value)}>
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

            <Separator />

            <div className="space-y-4">
              <Label>Special Conditions</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="historicPreservation"
                    checked={formData.historicPreservation}
                    onCheckedChange={(checked) => updateFormData('historicPreservation', !!checked)}
                  />
                  <Label htmlFor="historicPreservation">Historic Preservation (Denkmalschutz)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="propertyDivision"
                    checked={formData.propertyDivision}
                    onCheckedChange={(checked) => updateFormData('propertyDivision', !!checked)}
                  />
                  <Label htmlFor="propertyDivision">Property Division Planned (Aufteilung)</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subsidies">Available Subsidies (Förderungen)</Label>
                <Textarea
                  id="subsidies"
                  value={formData.subsidies}
                  onChange={(e) => updateFormData('subsidies', e.target.value)}
                  placeholder="e.g., KfW Energy Efficiency Grant"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="encumbrances">Encumbrances (Baulasten)</Label>
                <Textarea
                  id="encumbrances"
                  value={formData.encumbrances}
                  onChange={(e) => updateFormData('encumbrances', e.target.value)}
                  placeholder="e.g., Right of way"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Uploads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Uploads
            </CardTitle>
            <CardDescription>
              Upload floor plans and energy certificate for better assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floorPlan">Floor Plan</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <input
                    id="floorPlan"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData(prev => ({ ...prev, floorPlanFile: e.target.files?.[0] || null }))}
                    className="hidden"
                  />
                  <label
                    htmlFor="floorPlan"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    {formData.floorPlanFile ? (
                      <>
                        <File className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{formData.floorPlanFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.floorPlanFile.size / 1024).toFixed(1)} KB
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Upload Floor Plan</p>
                        <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="energyCert">Energy Certificate</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <input
                    id="energyCert"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData(prev => ({ ...prev, energyCertificateFile: e.target.files?.[0] || null }))}
                    className="hidden"
                  />
                  <label
                    htmlFor="energyCert"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    {formData.energyCertificateFile ? (
                      <>
                        <File className="h-8 w-8 text-green-500 mb-2" />
                        <p className="text-sm font-medium">{formData.energyCertificateFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.energyCertificateFile.size / 1024).toFixed(1)} KB
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

            {(formData.floorPlanFile || formData.energyCertificateFile) && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-600">
                  Documents will be attached to the property for future reference
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          {!isEditMode && (
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={isSaving}
            className={isEditMode ? "ml-auto" : ""}
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditMode ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Pre-Check
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Sticky Traffic Light Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          {showTrafficLights ? (
            <LiveTrafficLights
              livingArea={formData.livingArea || 0}
              purchasePrice={formData.purchasePrice}
              renovationBudget={formData.renovationBudget}
              furnishingBudget={0}
              monthlyRent={monthlyRent}
              hoaFeesLandlord={formData.hoaFeesLandlord}
              hoaFeesReserve={formData.hoaFeesReserve}
              energyClass={formData.energyClass}
              constructionYear={formData.constructionYear}
              city={formData.city}
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
                  Enter at least living area, purchase price, and rental income to see traffic light assessment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}