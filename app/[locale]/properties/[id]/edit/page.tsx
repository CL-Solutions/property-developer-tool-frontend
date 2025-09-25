'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  AlertTriangle,
  Loader2,
  Save
} from 'lucide-react';
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
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SingleApartmentForm } from '@/components/pre-check/single-apartment-form';
import { MultiFamilyHouseForm } from '@/components/pre-check/multi-family-house-form';
import { MockDataService } from '@/lib/mock-data';
import { Property, Project } from '@/lib/types';

export default function PropertyEditPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadPropertyData = async () => {
      setLoading(true);
      try {
        const propertyData = await MockDataService.getProperty(propertyId);
        setProperty(propertyData);
        
        if (propertyData?.project_id) {
          const projectData = await MockDataService.getProject(propertyData.project_id);
          setProject(projectData);
        }
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId]);

  const handleSave = async (formData: any) => {
    setSaving(true);
    try {
      // In a real app, this would update the property via API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Navigate back to property detail page
      router.push(`/properties/${propertyId}`);
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!property) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property not found</h2>
            <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</p>
            <Button variant="outline" size="default" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Determine if this is a single apartment or part of an MFH
  const isMFH = false; // For now, we'll handle this differently since Project type doesn't have properties array

  return (
    <SidebarProvider>
      <AppSidebar />
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/properties/${propertyId}`}>
                    {property.unit_number}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    Edit
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Edit Property</CardTitle>
                  <CardDescription>
                    Update the information for {property.unit_number} - {project?.name || 'Property'}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/properties/${propertyId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isMFH ? (
                <Alert className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This property is part of a multi-family house project. To edit building-level information,
                    please <a href={`/projects/${project?.id}/edit`} className="font-medium underline">edit the project</a>.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              {/* Use the appropriate form component based on property type */}
              {!isMFH ? (
                <SingleApartmentForm
                  initialData={{
                    // Map property data to form fields
                    salesPartner: property.developer_sales_partner || 'internal',
                    blackvestoPartner: property.developer_sales_partner === 'blackvesto' ? property.developer_sales_partner : undefined,
                    street: project?.street || '',
                    houseNumber: project?.house_number || '',
                    zipCode: project?.zip_code || '',
                    city: project?.city || '',
                    livingArea: property.size_sqm || 0,
                    rooms: property.rooms || 0,
                    floor: property.floor || '',
                    constructionYear: project?.construction_year || new Date().getFullYear(),
                    purchasePrice: property.total_purchase_price || 0,
                    sellingPrice: property.selling_price || 0,
                    renovationBudget: property.developer_renovation_budget || 0,
                    hoaFeesLandlord: property.hoa_fees_landlord || 0,
                    hoaFeesReserve: property.hoa_fees_reserve || 0,
                    rentalStrategy: property.developer_rental_strategy || 'standard',
                    plannedRent: property.monthly_rent || 0,
                    energyClass: project?.energy_class || '',
                  }}
                  onSave={handleSave}
                  isEditMode={true}
                  isSaving={saving}
                />
              ) : (
                <div className="space-y-6">
                  <Alert>
                    <AlertDescription>
                      Editing individual units in a multi-family house project. Building-level data must be edited at the project level.
                    </AlertDescription>
                  </Alert>
                  
                  {/* For MFH units, show a simplified form for unit-specific data only */}
                  <SingleApartmentForm
                    initialData={{
                      salesPartner: property.developer_sales_partner || 'internal',
                      blackvestoPartner: property.developer_sales_partner === 'blackvesto' ? property.developer_sales_partner : undefined,
                      street: project?.street || '',
                      houseNumber: project?.house_number || '',
                      zipCode: project?.zip_code || '',
                      city: project?.city || '',
                      propertyType: property.property_type || 'apartment',
                      size: property.size_sqm || 0,
                      rooms: property.rooms || 0,
                      floor: property.floor || '',
                      buildYear: project?.build_year || new Date().getFullYear(),
                      purchasePrice: property.purchase_price || 0,
                      sellingPrice: property.developer_selling_price || 0,
                      renovationBudget: property.developer_renovation_budget || 0,
                      furnishingBudget: property.developer_furnishing_budget || 0,
                      hoaFeeTotal: property.hoa_fee || 0,
                      hoaFeeLandlord: property.developer_hoa_fee_landlord || 0,
                      hoaFeeReserve: property.developer_hoa_fee_reserve || 0,
                      rentalType: property.developer_rental_type || 'standard',
                      standardRent: property.rental_price_net || 0,
                      wgRooms: property.developer_wg_rooms || [],
                      specialConditions: property.developer_special_conditions || [],
                      energyClass: project?.energy_class || '',
                      energyValue: project?.energy_value || 0,
                      energyType: project?.energy_type || '',
                    }}
                    onSave={handleSave}
                    isEditMode={true}
                    isSaving={saving}
                    isUnitInMFH={true}
                    readOnlyFields={['street', 'houseNumber', 'zipCode', 'city', 'buildYear', 'energyClass', 'energyValue', 'energyType']}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}