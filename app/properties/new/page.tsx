'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrafficLightGrid } from '@/components/traffic-light-indicator';
import { MockDataService } from '@/lib/mock-data';
import { PropertyEntryForm, Project, TrafficLightStatus, PropertyType, Property } from '@/lib/types';
import {
  Building2,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function PropertyEntryPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<PropertyEntryForm>({
    project_id: '',
    unit_number: '',
    floor: '',
    property_type: 'apartment',
    size_sqm: 0,
    rooms: 2,
    bathrooms: 1,
    balcony: '',
    has_cellar: false,
    developer_sales_partner: 'blackvesto',
    developer_sales_partner_id: '',
    developer_purchase_price: 0,
    developer_renovation_budget: 0,
    developer_furnishing_budget: 0,
    selling_price: 0,
    monthly_rent: 0,
    additional_costs: 0,
    operation_cost_landlord: 0,
    operation_cost_tenant: 0,
    operation_cost_reserve: 0,
    developer_rental_strategy: 'standard',
    has_erstvermietungsgarantie: false,
    developer_wg_room_pricing: [],
    required_trades: [],
    uploaded_documents: []
  });

  // Traffic light assessment
  const [trafficLights, setTrafficLights] = useState({
    energy: 'yellow' as TrafficLightStatus,
    yield: 'green' as TrafficLightStatus,
    hoa: 'green' as TrafficLightStatus,
    location: 'green' as TrafficLightStatus
  });

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await MockDataService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load projects:', error);
      }
    };

    loadProjects();
  }, []);

  // Calculate rental yield when relevant fields change
  useEffect(() => {
    if (formData.developer_purchase_price > 0 && formData.monthly_rent > 0) {
      const annualRent = formData.monthly_rent * 12;
      const yieldPercentage = (annualRent / formData.developer_purchase_price) * 100;

      // Update yield traffic light based on calculation
      let yieldStatus: TrafficLightStatus = 'red';
      if (yieldPercentage >= 4.5) yieldStatus = 'green';
      else if (yieldPercentage >= 3.5) yieldStatus = 'yellow';

      setTrafficLights(prev => ({ ...prev, yield: yieldStatus }));
    }
  }, [formData.developer_purchase_price, formData.monthly_rent]);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Property details and specifications' },
    { id: 2, title: 'Sales Partner', description: 'Partner selection and assignment' },
    { id: 3, title: 'Financial Parameters', description: 'Pricing and cost structure' },
    { id: 4, title: 'Rental Strategy', description: 'Rental approach and pricing' },
    { id: 5, title: 'Trade Selection', description: 'Required renovation work' },
    { id: 6, title: 'Documents & Review', description: 'Upload documents and review' }
  ];

  const selectedProject = projects.find(p => p.id === formData.project_id);

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.project_id && formData.unit_number && formData.size_sqm > 0;
      case 2:
        return formData.developer_sales_partner;
      case 3:
        return formData.developer_purchase_price > 0 && formData.selling_price > 0;
      case 4:
        return formData.monthly_rent > 0;
      case 5:
        return true; // Trade selection is optional
      case 6:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length && canProceedToNextStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Simulate API call
      await MockDataService.createProperty(formData as Partial<Property>);

      // Redirect to dashboard or property detail
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create property:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const addWGRoom = () => {
    setFormData(prev => ({
      ...prev,
      developer_wg_room_pricing: [
        ...(prev.developer_wg_room_pricing || []),
        { room: `Room ${(prev.developer_wg_room_pricing?.length || 0) + 1}`, size: 15, price: 500 }
      ]
    }));
  };

  const removeWGRoom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      developer_wg_room_pricing: prev.developer_wg_room_pricing?.filter((_, i) => i !== index) || []
    }));
  };

  const updateWGRoom = (index: number, field: 'room' | 'size' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      developer_wg_room_pricing: prev.developer_wg_room_pricing?.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      ) || []
    }));
  };

  const requiredTrades = [
    'electrical', 'plumbing', 'heating', 'painting', 'flooring',
    'windows', 'roofing', 'bathroom', 'kitchen'
  ];

  const toggleTrade = (trade: string) => {
    setFormData(prev => ({
      ...prev,
      required_trades: prev.required_trades?.includes(trade)
        ? prev.required_trades.filter(t => t !== trade)
        : [...(prev.required_trades || []), trade]
    }));
  };

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Properties
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>New Property</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Add New Property</h1>
          <p className="text-muted-foreground">Phase 1: Property Entry & Pre-Check</p>
        </div>

      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Progress value={(currentStep / steps.length) * 100} className="flex-1 mr-4" />
            <span className="text-sm font-medium">{Math.round((currentStep / steps.length) * 100)}%</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'flex flex-col items-center',
                  index + 1 <= currentStep ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs mb-1',
                  index + 1 < currentStep ? 'bg-green-500 text-white' :
                  index + 1 === currentStep ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                )}>
                  {index + 1 < currentStep ? <CheckCircle2 className="w-3 h-3" /> : step.id}
                </div>
                <span className="hidden sm:block text-center max-w-16">{step.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
                <CardDescription>Enter the basic property information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} - {project.street} {project.house_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_number">Unit Number</Label>
                    <Input
                      id="unit_number"
                      value={formData.unit_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                      placeholder="e.g., WE1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Floor</Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                      placeholder="e.g., EG, 1. OG"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select value={formData.property_type} onValueChange={(value) => setFormData(prev => ({ ...prev, property_type: value as PropertyType }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size_sqm">Size (m²)</Label>
                    <Input
                      id="size_sqm"
                      type="number"
                      value={formData.size_sqm || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, size_sqm: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rooms">Rooms</Label>
                    <Input
                      id="rooms"
                      type="number"
                      value={formData.rooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, rooms: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={formData.bathrooms || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bathrooms: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="balcony">Balcony Direction</Label>
                  <Input
                    id="balcony"
                    value={formData.balcony || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, balcony: e.target.value }))}
                    placeholder="e.g., South, West, North"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Sales Partner */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Partner Selection</CardTitle>
                <CardDescription>Choose the sales partner for this property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant={formData.developer_sales_partner === 'blackvesto' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData(prev => ({ ...prev, developer_sales_partner: 'blackvesto' }))}
                    >
                      BlackVesto
                    </Button>
                    <Button
                      variant={formData.developer_sales_partner === 'internal' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData(prev => ({ ...prev, developer_sales_partner: 'internal' }))}
                    >
                      Internal
                    </Button>
                  </div>

                  {formData.developer_sales_partner === 'blackvesto' && (
                    <div className="space-y-2">
                      <Label htmlFor="partner_id">BlackVesto Partner ID</Label>
                      <Input
                        id="partner_id"
                        value={formData.developer_sales_partner_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, developer_sales_partner_id: e.target.value }))}
                        placeholder="e.g., bv-partner-001"
                      />
                    </div>
                  )}

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {formData.developer_sales_partner === 'blackvesto'
                        ? 'BlackVesto partnership includes marketing, sales support, and commission fees.'
                        : 'Internal sales means you handle all marketing and sales activities directly.'
                      }
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Financial Parameters */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Parameters</CardTitle>
                <CardDescription>Set pricing and cost structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price (€)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      value={formData.developer_purchase_price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, developer_purchase_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="250000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="selling_price">Selling Price (€)</Label>
                    <Input
                      id="selling_price"
                      type="number"
                      value={formData.selling_price || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                      placeholder="320000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="renovation_budget">Renovation Budget (€)</Label>
                    <Input
                      id="renovation_budget"
                      type="number"
                      value={formData.developer_renovation_budget || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, developer_renovation_budget: parseFloat(e.target.value) || 0 }))}
                      placeholder="45000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="furnishing_budget">Furnishing Budget (€)</Label>
                    <Input
                      id="furnishing_budget"
                      type="number"
                      value={formData.developer_furnishing_budget || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, developer_furnishing_budget: parseFloat(e.target.value) || 0 }))}
                      placeholder="8000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly_rent">Monthly Rent (€)</Label>
                  <Input
                    id="monthly_rent"
                    type="number"
                    value={formData.monthly_rent || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthly_rent: parseFloat(e.target.value) || 0 }))}
                    placeholder="950"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="additional_costs">Additional Costs (€)</Label>
                    <Input
                      id="additional_costs"
                      type="number"
                      value={formData.additional_costs || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, additional_costs: parseFloat(e.target.value) || 0 }))}
                      placeholder="180"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoa_landlord">HOA (Landlord) (€)</Label>
                    <Input
                      id="hoa_landlord"
                      type="number"
                      value={formData.operation_cost_landlord || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, operation_cost_landlord: parseFloat(e.target.value) || 0 }))}
                      placeholder="85"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hoa_tenant">HOA (Tenant) (€)</Label>
                    <Input
                      id="hoa_tenant"
                      type="number"
                      value={formData.operation_cost_tenant || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, operation_cost_tenant: parseFloat(e.target.value) || 0 }))}
                      placeholder="95"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Rental Strategy */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Rental Strategy</CardTitle>
                <CardDescription>Configure rental approach and pricing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Button
                      variant={formData.developer_rental_strategy === 'standard' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData(prev => ({ ...prev, developer_rental_strategy: 'standard' }))}
                    >
                      Standard Rental
                    </Button>
                    <Button
                      variant={formData.developer_rental_strategy === 'wg' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setFormData(prev => ({ ...prev, developer_rental_strategy: 'wg' }))}
                    >
                      WG (Shared Housing)
                    </Button>
                  </div>

                  {formData.developer_rental_strategy === 'wg' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Room Configuration</Label>
                        <Button size="sm" onClick={addWGRoom}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Room
                        </Button>
                      </div>

                      {formData.developer_wg_room_pricing?.map((room, index) => (
                        <div key={index} className="grid grid-cols-4 gap-3 items-end">
                          <div className="space-y-2">
                            <Label>Room Name</Label>
                            <Input
                              value={room.room}
                              onChange={(e) => updateWGRoom(index, 'room', e.target.value)}
                              placeholder="Room 1"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Size (m²)</Label>
                            <Input
                              type="number"
                              value={room.size}
                              onChange={(e) => updateWGRoom(index, 'size', parseFloat(e.target.value) || 0)}
                              placeholder="15"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price (€)</Label>
                            <Input
                              type="number"
                              value={room.price}
                              onChange={(e) => updateWGRoom(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="500"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeWGRoom(index)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      {formData.developer_wg_room_pricing && formData.developer_wg_room_pricing.length > 0 && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-sm font-medium mb-2">Total WG Income</div>
                          <div className="text-xl font-bold">
                            €{formData.developer_wg_room_pricing.reduce((sum, room) => sum + room.price, 0)}/month
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="erstvermietungsgarantie"
                      checked={formData.has_erstvermietungsgarantie}
                      onChange={(e) => setFormData(prev => ({ ...prev, has_erstvermietungsgarantie: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="erstvermietungsgarantie">
                      Erstvermietungsgarantie (First Rental Guarantee)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Trade Selection */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Trades</CardTitle>
                <CardDescription>Select renovation work that needs to be done</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {requiredTrades.map((trade) => (
                    <Button
                      key={trade}
                      variant={formData.required_trades?.includes(trade) ? 'default' : 'outline'}
                      className="justify-start h-auto py-3"
                      onClick={() => toggleTrade(trade)}
                    >
                      {formData.required_trades?.includes(trade) && (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      {trade.charAt(0).toUpperCase() + trade.slice(1)}
                    </Button>
                  ))}
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Selected trades will be automatically scheduled and tracked through the construction phase.
                    You can modify this selection later if needed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Documents & Review */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents & Final Review</CardTitle>
                <CardDescription>Upload required documents and review your property setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Document Upload */}
                <div className="space-y-4">
                  <Label>Required Documents</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <div className="text-sm font-medium mb-2">Upload Documents</div>
                    <div className="text-xs text-muted-foreground mb-4">
                      Floor plans, energy certificates, property documents
                    </div>
                    <Button variant="outline" size="sm">
                      Select Files
                    </Button>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-4">
                  <Label>Property Summary</Label>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Property Details</div>
                      <div className="text-muted-foreground">
                        {formData.unit_number} • {formData.size_sqm}m² • {formData.rooms} rooms
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Financial</div>
                      <div className="text-muted-foreground">
                        Purchase: €{formData.developer_purchase_price?.toLocaleString()} • Rent: €{formData.monthly_rent}/month
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Sales Partner</div>
                      <div className="text-muted-foreground">
                        {MockDataService.getSalesPartnerLabel(formData.developer_sales_partner)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Rental Strategy</div>
                      <div className="text-muted-foreground">
                        {formData.developer_rental_strategy === 'standard' ? 'Standard Rental' : 'WG (Shared Housing)'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNextStep()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !canProceedToNextStep()}
              >
                {submitting ? 'Creating...' : 'Create Property'}
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar with Traffic Light Assessment */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Pre-Check Assessment
              </CardTitle>
              <CardDescription>Real-time property evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <TrafficLightGrid lights={trafficLights} />

              {formData.developer_purchase_price > 0 && formData.monthly_rent > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-2">Rental Yield</div>
                  <div className="text-2xl font-bold">
                    {((formData.monthly_rent * 12 / formData.developer_purchase_price) * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Annual rent / Purchase price
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedProject && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="font-medium">{selectedProject.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedProject.street} {selectedProject.house_number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedProject.city}, {selectedProject.zip_code}
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="secondary">{selectedProject.total_units} units</Badge>
                  <Badge variant="secondary">{selectedProject.total_floors} floors</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </div>
    </SidebarInset>
  );
}