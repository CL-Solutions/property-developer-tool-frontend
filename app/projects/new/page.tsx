"use client"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { BuildingType } from '@/lib/types';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { MockDataService } from '@/lib/mock-data';
import { Project } from '@/lib/types';
import {
  ArrowLeft,
  Building,
  MapPin,
  FileText,
  Users,
  AlertCircle
} from 'lucide-react';

export default function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(isEditMode);
  const [salesPartner, setSalesPartner] = useState<'blackvesto' | 'internal'>('blackvesto');

  const [formData, setFormData] = useState({
    name: '',
    street: '',
    houseNumber: '',
    city: '',
    district: '',
    state: 'Bayern',
    zipCode: '',
    buildingType: 'apartment_building',
    constructionYear: '',
    renovationYear: new Date().getFullYear().toString(),
    totalFloors: '',
    totalUnits: '',
    hasElevator: false,
    hasParking: true,
    hasBasement: true,
    hasGarden: false,
    energyCertificateType: 'consumption',
    energyConsumption: '',
    energyClass: '',
    heatingType: 'Zentralheizung',
    propertyDeveloper: 'CL Immobilien GmbH'
  });

  // Load existing project data when in edit mode
  useEffect(() => {
    const loadProjectData = async () => {
      if (isEditMode && editId) {
        setDataLoading(true);
        try {
          // In a real app, this would be an API call to get the project
          // For now, we'll decode the project ID to get the name
          const decodedProjectId = decodeURIComponent(editId);
          
          // Mock loading existing project data
          // You would normally fetch this from your API
          const projectData = await MockDataService.getProject(editId);
          
          if (projectData) {
            setFormData({
              name: projectData.name || '',
              street: projectData.street || '',
              houseNumber: projectData.house_number || '',
              city: projectData.city || '',
              district: projectData.district || '',
              state: projectData.state || 'Bayern',
              zipCode: projectData.zip_code || '',
              buildingType: projectData.building_type || 'apartment_building',
              constructionYear: projectData.construction_year?.toString() || '',
              renovationYear: projectData.renovation_year?.toString() || new Date().getFullYear().toString(),
              totalFloors: projectData.total_floors?.toString() || '',
              totalUnits: projectData.total_units?.toString() || '',
              hasElevator: projectData.has_elevator ?? false,
              hasParking: projectData.has_parking ?? true,
              hasBasement: projectData.has_basement ?? true,
              hasGarden: projectData.has_garden ?? false,
              energyCertificateType: projectData.energy_certificate_type || 'consumption',
              energyConsumption: projectData.energy_consumption?.toString() || '',
              energyClass: projectData.energy_class || '',
              heatingType: projectData.heating_type || 'Zentralheizung',
              propertyDeveloper: projectData.property_developer || 'CL Immobilien GmbH'
            });
            setSalesPartner((projectData as any).developer_sales_partner || 'blackvesto');
          }
        } catch (error) {
          console.error('Failed to load project data:', error);
          toast.error('Failed to load project data');
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadProjectData();
  }, [isEditMode, editId]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.street || !formData.houseNumber || !formData.city || !formData.zipCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare project data
      const projectData: Partial<Project> = {
        name: formData.name,
        street: formData.street,
        house_number: formData.houseNumber,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        zip_code: formData.zipCode,
        building_type: formData.buildingType as BuildingType,
        construction_year: formData.constructionYear ? parseInt(formData.constructionYear) : undefined,
        renovation_year: formData.renovationYear ? parseInt(formData.renovationYear) : undefined,
        total_floors: formData.totalFloors ? parseInt(formData.totalFloors) : undefined,
        total_units: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
        has_elevator: formData.hasElevator,
        has_parking: formData.hasParking,
        has_basement: formData.hasBasement,
        has_garden: formData.hasGarden,
        energy_certificate_type: formData.energyCertificateType,
        energy_consumption: formData.energyConsumption ? parseFloat(formData.energyConsumption) : undefined,
        energy_class: formData.energyClass,
        heating_type: formData.heatingType,
        property_developer: formData.propertyDeveloper,
        status: 'active',
        visibility_status: 1,
        country: 'Germany',
      };

      if (isEditMode && editId) {
        // Update existing project
        await MockDataService.updateProject(editId, projectData);
        toast.success('Project updated successfully!');
        router.push(`/projects/${editId}`);
      } else {
        // Create the project
        const newProject = await MockDataService.createProject(projectData);
        // Create project ID from name for navigation
        const projectId = `project-${formData.name.toLowerCase()}`;
        toast.success('Project created successfully!');
        router.push(`/projects/${projectId}`);
      }
    } catch (error) {
      toast.error('Failed to create project');
      console.error('Error creating project:', error);
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
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="max-w-4xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {isEditMode ? 'Edit Project' : 'Create New Project'}
                  </CardTitle>
                  <CardDescription>
                    {isEditMode ? 'Update project information' : 'Add a new development project to your portfolio'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sales Partner Selection */}
                  <div className="space-y-3">
                    <Label>Sales Partner</Label>
                    <RadioGroup value={salesPartner} onValueChange={(value) => setSalesPartner(value as 'blackvesto' | 'internal')}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="blackvesto" id="blackvesto" />
                        <Label htmlFor="blackvesto" className="font-normal cursor-pointer">
                          Use BlackVesto sales partner
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="internal" id="internal" />
                        <Label htmlFor="internal" className="font-normal cursor-pointer">
                          Handle internally (without external sales support)
                        </Label>
                      </div>
                    </RadioGroup>
                    {salesPartner === 'blackvesto' && (
                      <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        Properties will be synced with BlackVesto for sales management
                      </div>
                    )}
                  </div>

                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                          id="name"
                          placeholder="e.g., Gotenstraße 69"
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buildingType">Building Type</Label>
                        <Select value={formData.buildingType || 'apartment_building'} onValueChange={(value) => handleInputChange('buildingType', value)}>
                          <SelectTrigger id="buildingType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="apartment_building">Apartment Building (MFH)</SelectItem>
                            <SelectItem value="single_apartment">Single Apartment</SelectItem>
                            <SelectItem value="townhouse">Townhouse</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Details
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Street *</Label>
                        <Input
                          id="street"
                          placeholder="Street name"
                          value={formData.street || ''}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="houseNumber">House Number *</Label>
                        <Input
                          id="houseNumber"
                          placeholder="69"
                          value={formData.houseNumber || ''}
                          onChange={(e) => handleInputChange('houseNumber', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="zipCode">ZIP Code *</Label>
                        <Input
                          id="zipCode"
                          placeholder="80336"
                          value={formData.zipCode || ''}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="Munich"
                          value={formData.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district">District</Label>
                        <Input
                          id="district"
                          placeholder="Schwanthalerhöhe"
                          value={formData.district || ''}
                          onChange={(e) => handleInputChange('district', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Building Specifications */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Building Specifications</h3>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label htmlFor="constructionYear">Construction Year</Label>
                        <Input
                          id="constructionYear"
                          type="number"
                          placeholder="1965"
                          value={formData.constructionYear || ''}
                          onChange={(e) => handleInputChange('constructionYear', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="renovationYear">Renovation Year</Label>
                        <Input
                          id="renovationYear"
                          type="number"
                          placeholder="2024"
                          value={formData.renovationYear || ''}
                          onChange={(e) => handleInputChange('renovationYear', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalFloors">Total Floors</Label>
                        <Input
                          id="totalFloors"
                          type="number"
                          placeholder="5"
                          value={formData.totalFloors || ''}
                          onChange={(e) => handleInputChange('totalFloors', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="totalUnits">Total Units</Label>
                        <Input
                          id="totalUnits"
                          type="number"
                          placeholder="12"
                          value={formData.totalUnits || ''}
                          onChange={(e) => handleInputChange('totalUnits', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasElevator">Has Elevator</Label>
                        <Switch
                          id="hasElevator"
                          checked={formData.hasElevator}
                          onCheckedChange={(checked) => handleInputChange('hasElevator', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasParking">Has Parking</Label>
                        <Switch
                          id="hasParking"
                          checked={formData.hasParking}
                          onCheckedChange={(checked) => handleInputChange('hasParking', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasBasement">Has Basement</Label>
                        <Switch
                          id="hasBasement"
                          checked={formData.hasBasement}
                          onCheckedChange={(checked) => handleInputChange('hasBasement', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hasGarden">Has Garden</Label>
                        <Switch
                          id="hasGarden"
                          checked={formData.hasGarden}
                          onCheckedChange={(checked) => handleInputChange('hasGarden', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Energy Certificate */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Energy Certificate
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label htmlFor="energyCertificateType">Certificate Type</Label>
                        <Select value={formData.energyCertificateType || 'consumption'} onValueChange={(value) => handleInputChange('energyCertificateType', value)}>
                          <SelectTrigger id="energyCertificateType">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consumption">Consumption Certificate</SelectItem>
                            <SelectItem value="demand">Demand Certificate</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="energyConsumption">Energy Consumption (kWh/m²)</Label>
                        <Input
                          id="energyConsumption"
                          type="number"
                          placeholder="125.5"
                          value={formData.energyConsumption || ''}
                          onChange={(e) => handleInputChange('energyConsumption', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="energyClass">Energy Class</Label>
                        <Select value={formData.energyClass || ''} onValueChange={(value) => handleInputChange('energyClass', value)}>
                          <SelectTrigger id="energyClass">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                            <SelectItem value="C">C</SelectItem>
                            <SelectItem value="D">D</SelectItem>
                            <SelectItem value="E">E</SelectItem>
                            <SelectItem value="F">F</SelectItem>
                            <SelectItem value="G">G</SelectItem>
                            <SelectItem value="H">H</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  onClick={() => router.push('/projects')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" size="default" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}