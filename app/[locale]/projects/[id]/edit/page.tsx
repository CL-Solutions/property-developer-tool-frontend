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

  Info
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
import { MultiFamilyHouseForm } from '@/components/pre-check/multi-family-house-form';
import { MockDataService } from '@/lib/mock-data';
import { Project } from '@/lib/types';

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  // const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProjectData = async () => {
      setLoading(true);
      try {
        // Decode the URL-encoded project ID
        const decodedProjectId = decodeURIComponent(projectId);
        
        // For now, we'll use mock data. In a real app, this would be an API call
        const allProperties = await MockDataService.getPropertySummaries();
        
        // Extract project name from ID
        const extractedName = decodedProjectId.replace('project-', '');
        
        // Filter properties for this project
        const projectProperties = allProperties.filter(p =>
          p.project_name.toLowerCase() === extractedName
        );

        if (projectProperties.length > 0) {
          // Create a project object from the first property's data
          const firstProperty = projectProperties[0];
          
          // Mock project data based on properties
          const mockProject = {
            id: projectId,
            name: firstProperty.project_name,
            street: firstProperty.street,
            house_number: firstProperty.house_number,
            zip_code: '',  // PropertySummary doesn't have zip_code
            city: firstProperty.city,
            construction_year: 2024,
            energy_class: 'B',
            energy_consumption: 75,
            energy_certificate_type: 'consumption'
          };
          
          setProject(mockProject as Project);
          // setProperties(projectProperties);
        }
      } catch (error) {
        console.error('Error loading project:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would update the project via API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Navigate back to project detail page
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error saving project:', error);
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

  if (!project) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center p-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
            <Button variant="outline" size="default" onClick={() => router.push('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Projects
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                  <BreadcrumbLink href="/projects">
                    Projects
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href={`/projects/${projectId}`}>
                    {project.name}
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
                  <CardTitle>Edit Project</CardTitle>
                  <CardDescription>
                    Update the information for {project.name}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${projectId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This is a multi-family house project with {project.total_units || 0} units.
                  Changes to building-level information will affect all units.
                  Individual unit details can be edited separately from each property&apos;s page.
                </AlertDescription>
              </Alert>
              
              {/* Use the MultiFamilyHouseForm for editing */}
              <MultiFamilyHouseForm
                initialData={{
                  buildingAddress: {
                    street: project.street || '',
                    houseNumber: project.house_number || '',
                    zipCode: project.zip_code || '',
                    city: project.city || ''
                  },
                  buildingDetails: {
                    buildYear: project.construction_year || new Date().getFullYear(),
                    totalPurchasePrice: project.developer_purchase_price || 0,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    defaultSalesPartner: (project as any).developer_sales_partner || 'internal',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    defaultBlackVestoPartner: (project as any).developer_blackvesto_partner
                  },
                  energyData: {
                    energyClass: project.energy_class || '',
                    energyValue: project.energy_consumption || 0,
                    energyType: project.energy_certificate_type || ''
                  },
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  units: (project as any).properties?.map((p: any) => ({
                    id: p.id,
                    unitNumber: p.unit_number,
                    propertyType: p.property_type || 'apartment',
                    size: p.size_sqm || 0,
                    rooms: p.rooms || 0,
                    floor: p.floor || '',
                    purchasePrice: p.purchase_price || 0,
                    sellingPrice: p.developer_selling_price || 0,
                    renovationBudget: p.developer_renovation_budget || 0,
                    furnishingBudget: p.developer_furnishing_budget || 0,
                    hoaFeeTotal: p.hoa_fee || 0,
                    hoaFeeLandlord: p.developer_hoa_fee_landlord || 0,
                    hoaFeeReserve: p.developer_hoa_fee_reserve || 0,
                    rentalType: p.developer_rental_type || 'standard',
                    standardRent: p.rental_price_net || 0,
                    wgRooms: p.developer_wg_rooms || [],
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    salesPartner: (p as any).developer_sales_partner || (project as any).developer_sales_partner || 'internal',
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    blackVestoPartner: (p as any).developer_blackvesto_partner || (project as any).developer_blackvesto_partner,
                    specialConditions: p.developer_special_conditions || []
                  })) || []
                }}
                onSave={handleSave}
                isEditMode={true}
                isSaving={saving}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}