"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { MockDataService } from '@/lib/mock-data';
import { Property } from '@/lib/types';
import { TradeSelector } from '@/components/phase1/trade-selector';
import { TrafficLightPreview } from '@/components/phase1/traffic-light-preview';
import {
  ArrowLeft,
  Home,
  MapPin,
  Calculator,
  Euro,
  FileText,
  AlertCircle,
  Users,
  Bed,
  Maximize,
  Plus
} from 'lucide-react';

export default function NewPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [rentalType, setRentalType] = useState<'standard' | 'wg'>('standard');
  const [salesPartner, setSalesPartner] = useState<'blackvesto' | 'internal'>('blackvesto');
  const [selectedSalesPartnerId, setSelectedSalesPartnerId] = useState<string>('');
  const [selectedTrades, setSelectedTrades] = useState<string[]>([]);
  const [constructionDescription, setConstructionDescription] = useState('');

  const [formData, setFormData] = useState({
    unitNumber: '',
    livingArea: '',
    rooms: '',
    floor: '',
    purchasePrice: '',
    renovationBudget: '',
    furnitureBudget: '',
    monthlyRent: '',
    additionalCosts: '',
    operationCostLandlord: '',
    operationCostTenant: '',
    operationCostReserve: '',
    hasErstvermietungsgarantie: false,
    guaranteedRent: '',

    // WG specific
    wgRooms: [
      { roomNumber: 1, size: '', rent: '' }
    ],

    // Special conditions
    historicPreservation: false,
    propertyDivision: false,
    subsidies: '',
    encumbrances: ''
  });

  useEffect(() => {
    const loadProjectName = async () => {
      try {
        const properties = await MockDataService.getPropertySummaries();
        const decodedProjectId = decodeURIComponent(projectId);
        const extractedName = decodedProjectId.replace('project-', '');

        const projectProperty = properties.find(p =>
          p.project_name.toLowerCase() === extractedName
        );

        if (projectProperty) {
          setProjectName(projectProperty.project_name);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    };

    loadProjectName();
  }, [projectId]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addWgRoom = () => {
    setFormData(prev => ({
      ...prev,
      wgRooms: [...prev.wgRooms, {
        roomNumber: prev.wgRooms.length + 1,
        size: '',
        rent: ''
      }]
    }));
  };

  const updateWgRoom = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      wgRooms: prev.wgRooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    }));
  };

  const calculateRentalYield = () => {
    const purchasePrice = parseFloat(formData.purchasePrice) || 0;
    const renovationBudget = parseFloat(formData.renovationBudget) || 0;
    const totalInvestment = purchasePrice + renovationBudget;

    let annualRent = 0;
    if (rentalType === 'standard') {
      annualRent = (parseFloat(formData.monthlyRent) || 0) * 12;
    } else {
      annualRent = formData.wgRooms.reduce((sum, room) => {
        return sum + (parseFloat(room.rent) || 0) * 12;
      }, 0);
    }

    if (totalInvestment > 0) {
      return ((annualRent / totalInvestment) * 100).toFixed(2);
    }
    return '0.00';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.unitNumber || !formData.livingArea || !formData.rooms || !formData.purchasePrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Calculate total monthly rent
      let monthlyRentTotal = 0;
      if (rentalType === 'standard') {
        monthlyRentTotal = parseFloat(formData.monthlyRent) || 0;
      } else {
        monthlyRentTotal = formData.wgRooms.reduce((sum, room) => {
          return sum + (parseFloat(room.rent) || 0);
        }, 0);
      }

      // Prepare property data
      const propertyData: Partial<Property> = {
        project_id: projectId,
        project_name: projectName,
        unit_number: formData.unitNumber,
        floor: formData.floor,
        rooms: parseFloat(formData.rooms),
        size_sqm: parseFloat(formData.livingArea),
        property_type: 'apartment',
        bathrooms: 1, // Default value
        balcony: 'no', // Default value, can be updated later
        has_cellar: false, // Default value, can be updated later
        selling_price: parseFloat(formData.purchasePrice),
        developer_purchase_price: parseFloat(formData.purchasePrice),
        developer_renovation_budget: parseFloat(formData.renovationBudget) || 0,
        developer_furnishing_budget: 0,
        monthly_rent: monthlyRentTotal,
        total_monthly_rent: monthlyRentTotal,
        hoa_fees_landlord: parseFloat(formData.operationCostLandlord) || 0,
        hoa_fees_tenant: parseFloat(formData.operationCostTenant) || 0,
        hoa_fees_reserve: parseFloat(formData.operationCostReserve) || 0,
        additional_costs: parseFloat(formData.operationCostTenant) || 0,
        management_fee: 0,
        total_purchase_price: parseFloat(formData.purchasePrice) + (parseFloat(formData.renovationBudget) || 0),
        gross_rental_yield: parseFloat(calculateRentalYield()),
        developer_rental_strategy: rentalType,
        has_erstvermietungsgarantie: formData.hasErstvermietungsgarantie,
        developer_phase: 1, // Start at phase 1
        developer_phase_status: 'active',
        developer_traffic_light_energy: 'green',
        developer_traffic_light_yield: 'green',
        developer_traffic_light_hoa: 'green',
        developer_traffic_light_location: 'green',
        developer_construction_progress: 0,
        developer_sales_partner: salesPartner,
        developer_sales_partner_id: selectedSalesPartnerId || undefined,
        developer_construction_visible_blackvesto: salesPartner === 'blackvesto',
        developer_selected_trades: selectedTrades,
        developer_construction_description: constructionDescription,
        developer_special_conditions: {
          historic_preservation: formData.historicPreservation,
          property_division: formData.propertyDivision,
          subsidies: formData.subsidies ? formData.subsidies.split(',').map(s => s.trim()) : [],
          encumbrances: formData.encumbrances ? formData.encumbrances.split(',').map(s => s.trim()) : []
        },
        active: 1,
        visibility: 1,
        city: '', // Will be inherited from project
        state: '', // Will be inherited from project
        zip_code: '', // Will be inherited from project
      };

      // Create the property
      await MockDataService.createProperty(propertyData);

      toast.success('Property added successfully!');
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error('Failed to add property');
      console.error('Error creating property:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="default"
              onClick={() => router.push(`/projects/${projectId}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Project
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Add Property to {projectName}
                  </CardTitle>
                  <CardDescription>
                    Create a new property unit within this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Property Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Property Information</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="unitNumber">Unit Number (WE) *</Label>
                        <Input
                          id="unitNumber"
                          placeholder="e.g., WE01"
                          value={formData.unitNumber}
                          onChange={(e) => handleInputChange('unitNumber', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="floor">Floor</Label>
                        <Input
                          id="floor"
                          placeholder="e.g., 2"
                          value={formData.floor}
                          onChange={(e) => handleInputChange('floor', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rooms">Number of Rooms *</Label>
                        <Input
                          id="rooms"
                          type="number"
                          step="0.5"
                          placeholder="e.g., 3.5"
                          value={formData.rooms}
                          onChange={(e) => handleInputChange('rooms', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="livingArea">Living Area (m²) *</Label>
                        <div className="relative">
                          <Maximize className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="livingArea"
                            type="number"
                            className="pl-10"
                            placeholder="e.g., 75"
                            value={formData.livingArea}
                            onChange={(e) => handleInputChange('livingArea', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="purchasePrice">Purchase Price (€) *</Label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="purchasePrice"
                            type="number"
                            className="pl-10"
                            placeholder="e.g., 350000"
                            value={formData.purchasePrice}
                            onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Budget Planning */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Budget Planning</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="renovationBudget">Renovation Budget (€)</Label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="renovationBudget"
                            type="number"
                            className="pl-10"
                            placeholder="e.g., 25000"
                            value={formData.renovationBudget}
                            onChange={(e) => handleInputChange('renovationBudget', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="furnitureBudget">Furniture Budget (€)</Label>
                        <div className="relative">
                          <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="furnitureBudget"
                            type="number"
                            className="pl-10"
                            placeholder="e.g., 15000"
                            value={formData.furnitureBudget}
                            onChange={(e) => handleInputChange('furnitureBudget', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rental Planning */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Rental Planning
                    </h3>

                    {/* Rental Type Selection */}
                    <RadioGroup value={rentalType} onValueChange={(value) => setRentalType(value as 'standard' | 'wg')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="standard" id="standard" />
                        <Label htmlFor="standard" className="font-normal cursor-pointer">
                          Standard Rental
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="wg" id="wg" />
                        <Label htmlFor="wg" className="font-normal cursor-pointer">
                          Shared Apartment (WG)
                        </Label>
                      </div>
                    </RadioGroup>

                    {/* Erstvermietungsgarantie */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-0.5">
                        <Label htmlFor="hasErstvermietungsgarantie">First Rental Guarantee (Erstvermietungsgarantie)</Label>
                        <div className="text-sm text-muted-foreground">
                          Property comes with guaranteed first rental price
                        </div>
                      </div>
                      <Switch
                        id="hasErstvermietungsgarantie"
                        checked={formData.hasErstvermietungsgarantie}
                        onCheckedChange={(checked) => handleInputChange('hasErstvermietungsgarantie', checked)}
                      />
                    </div>

                    {formData.hasErstvermietungsgarantie && (
                      <div className="space-y-2">
                        <Label htmlFor="guaranteedRent">Guaranteed Rent (€/month)</Label>
                        <Input
                          id="guaranteedRent"
                          type="number"
                          placeholder="e.g., 1500"
                          value={formData.guaranteedRent}
                          onChange={(e) => handleInputChange('guaranteedRent', e.target.value)}
                        />
                      </div>
                    )}

                    {/* Standard Rental Fields */}
                    {rentalType === 'standard' && (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="monthlyRent">Monthly Rent (€)</Label>
                          <Input
                            id="monthlyRent"
                            type="number"
                            placeholder="e.g., 1200"
                            value={formData.monthlyRent}
                            onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                            disabled={formData.hasErstvermietungsgarantie}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="additionalCosts">Additional Costs (Nebenkosten) (€/month)</Label>
                          <Input
                            id="additionalCosts"
                            type="number"
                            placeholder="e.g., 200"
                            value={formData.additionalCosts}
                            onChange={(e) => handleInputChange('additionalCosts', e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* WG Room Configuration */}
                    {rentalType === 'wg' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <Label>Room Configuration</Label>
                          <Button type="button" size="default" variant="outline" onClick={addWgRoom}>
                            <Plus className="h-4 w-4" />
                            Add Room
                          </Button>
                        </div>
                        {formData.wgRooms.map((room, index) => (
                          <div key={index} className="grid gap-4 md:grid-cols-3 p-3 border rounded">
                            <div className="space-y-2">
                              <Label>Room {room.roomNumber}</Label>
                              <Input
                                placeholder="Size (m²)"
                                value={room.size}
                                onChange={(e) => updateWgRoom(index, 'size', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Rent (€/month)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 450"
                                value={room.rent}
                                onChange={(e) => updateWgRoom(index, 'rent', e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* HOA Fees */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">HOA Fees (Hausgeld)</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="operationCostLandlord">
                          Landlord Portion (€/month)
                        </Label>
                        <Input
                          id="operationCostLandlord"
                          type="number"
                          placeholder="e.g., 100"
                          value={formData.operationCostLandlord}
                          onChange={(e) => handleInputChange('operationCostLandlord', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Non-recoverable</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operationCostTenant">
                          Tenant Portion (€/month)
                        </Label>
                        <Input
                          id="operationCostTenant"
                          type="number"
                          placeholder="e.g., 150"
                          value={formData.operationCostTenant}
                          onChange={(e) => handleInputChange('operationCostTenant', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Recoverable</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operationCostReserve">
                          Reserve Fund (€/month)
                        </Label>
                        <Input
                          id="operationCostReserve"
                          type="number"
                          placeholder="e.g., 50"
                          value={formData.operationCostReserve}
                          onChange={(e) => handleInputChange('operationCostReserve', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Instandhaltungsrücklage</p>
                      </div>
                    </div>
                  </div>

                  {/* Rental Yield Calculation */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">Estimated Rental Yield</p>
                          <p className="text-3xl font-bold text-blue-900">{calculateRentalYield()}%</p>
                        </div>
                        <Calculator className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-xs text-blue-700 mt-2">
                        Based on purchase price, renovation budget, and projected rental income
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>

              {/* Sales Partner Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Sales Partner Configuration
                  </CardTitle>
                  <CardDescription>
                    Choose how this property will be marketed and sold
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={salesPartner}
                    onValueChange={(value) => {
                      setSalesPartner(value as 'blackvesto' | 'internal');
                      if (value === 'internal') {
                        setSelectedSalesPartnerId('internal-001');
                      }
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blackvesto" id="blackvesto-partner" />
                      <Label htmlFor="blackvesto-partner" className="font-normal cursor-pointer">
                        Use BlackVesto Sales Partner
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="internal" id="internal-partner" />
                      <Label htmlFor="internal-partner" className="font-normal cursor-pointer">
                        Handle Internally
                      </Label>
                    </div>
                  </RadioGroup>

                  {salesPartner === 'blackvesto' && (
                    <div className="space-y-2">
                      <Label htmlFor="partner-selection">Select BlackVesto Partner</Label>
                      <Select
                        value={selectedSalesPartnerId}
                        onValueChange={setSelectedSalesPartnerId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a partner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MockDataService.getSalesPartners()
                            .filter(p => p.type === 'blackvesto')
                            .map(partner => (
                              <SelectItem key={partner.id} value={partner.id}>
                                {partner.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Trade Selection for Renovation */}
              <TradeSelector
                livingArea={parseFloat(formData.livingArea) || 0}
                selectedTrades={selectedTrades}
                constructionDescription={constructionDescription}
                onTradesChange={(trades, budget) => {
                  setSelectedTrades(trades);
                  // Auto-update renovation budget if user hasn't manually set it
                  if (!formData.renovationBudget || formData.renovationBudget === '0') {
                    handleInputChange('renovationBudget', budget.toString());
                  }
                }}
                onDescriptionChange={setConstructionDescription}
              />

              {/* Special Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Special Conditions
                  </CardTitle>
                  <CardDescription>
                    Additional property characteristics and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="historic"
                        checked={formData.historicPreservation}
                        onCheckedChange={(checked) =>
                          handleInputChange('historicPreservation', checked)
                        }
                      />
                      <Label htmlFor="historic" className="cursor-pointer">
                        Historic preservation status
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="division"
                        checked={formData.propertyDivision}
                        onCheckedChange={(checked) =>
                          handleInputChange('propertyDivision', checked)
                        }
                      />
                      <Label htmlFor="division" className="cursor-pointer">
                        Property division required
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subsidies">Available Subsidies/Grants</Label>
                    <Textarea
                      id="subsidies"
                      placeholder="e.g., KfW funding, energy efficiency grants (comma-separated)"
                      value={formData.subsidies}
                      onChange={(e) => handleInputChange('subsidies', e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encumbrances">Building Encumbrances/Restrictions</Label>
                    <Textarea
                      id="encumbrances"
                      placeholder="e.g., right of way, building restrictions (comma-separated)"
                      value={formData.encumbrances}
                      onChange={(e) => handleInputChange('encumbrances', e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Traffic Light Preview */}
              <TrafficLightPreview
                livingArea={parseFloat(formData.livingArea) || 0}
                purchasePrice={parseFloat(formData.purchasePrice) || 0}
                renovationBudget={parseFloat(formData.renovationBudget) || 0}
                monthlyRent={rentalType === 'standard' ?
                  parseFloat(formData.monthlyRent) || 0 :
                  formData.wgRooms.reduce((sum, room) =>
                    sum + (parseFloat(room.rent) || 0), 0
                  )
                }
                operationCosts={{
                  landlord: parseFloat(formData.operationCostLandlord) || 0,
                  tenant: parseFloat(formData.operationCostTenant) || 0,
                  reserve: parseFloat(formData.operationCostReserve) || 0
                }}
                energyClass={'C'} // Would come from project data in real app
                constructionYear={2000} // Would come from project data
                city="Munich"
                showDetails={true}
                showWarnings={true}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => router.push(`/projects/${projectId}`)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" size="default" disabled={loading}>
                  {loading ? 'Adding Property...' : 'Add Property'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}