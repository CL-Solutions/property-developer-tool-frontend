"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocaleRouter } from '@/hooks/use-locale-router';
import { LocaleLink } from '@/components/locale-link';
import { AppSidebar } from "@/components/app-sidebar"
import { ProjectGanttChart } from '@/components/project-gantt-chart';
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PropertyCard, PropertyCardSkeleton } from '@/components/property-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MockDataService } from '@/lib/mock-data';
import { PropertySummary } from '@/lib/types';
import {
  Building,
  ArrowLeft,
  Plus,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Home,
  FileText,
  Settings,
  Edit
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useLocaleRouter();
  const t = useTranslations();
  const projectId = params.id as string;

  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState<string>('');

  useEffect(() => {
    const fetchProjectData = async () => {
      setLoading(true);
      try {
        const allProperties = await MockDataService.getPropertySummaries();

        // Decode the URL-encoded project ID
        const decodedProjectId = decodeURIComponent(projectId);

        // Extract project name from ID (just remove the 'project-' prefix)
        const extractedName = decodedProjectId.replace('project-', '');

        // Filter properties for this project (matching by lowercase name)
        const projectProperties = allProperties.filter(p =>
          p.project_name.toLowerCase() === extractedName
        );

        if (projectProperties.length > 0) {
          setProjectName(projectProperties[0].project_name);
          setProperties(projectProperties);
        }
      } catch (error) {
        console.error('Failed to fetch project data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const stats = {
    totalProperties: properties.length,
    criticalAlerts: properties.filter(p => p.has_critical_alerts).length,
    averageProgress: properties.length > 0
      ? Math.round(properties.reduce((sum, p) => sum + p.construction_progress, 0) / properties.length)
      : 0,
    totalValue: properties.length * 450000 // Mock value
  };

  const handlePropertyClick = (propertyId: string) => {
    router.push(`/properties/${propertyId}`);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          {/* Breadcrumb and Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="default"
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="h-4 w-4" />
              {t('projects.backToProjects')}
            </Button>
          </div>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ) : properties.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('projects.projectNotFound')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('projects.projectNotFoundDescription')}
              </p>
              <Button variant="outline" size="default" onClick={() => router.push('/projects')}>
                <ArrowLeft className="h-4 w-4" />
                {t('projects.backToProjects')}
              </Button>
            </Card>
          ) : (
            <>
              {/* Project Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      <Building className="h-8 w-8" />
                      {projectName}
                    </h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {properties[0]?.street} {properties[0]?.house_number}, {properties[0]?.city}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="default" onClick={() => router.push(`/projects/new?edit=${projectId}`)}>
                      <Edit className="h-4 w-4 mr-1" />
                      {t('projects.editProject')}
                    </Button>
                    <Button size="default" onClick={() => router.push(`/projects/${projectId}/properties/new`)}>
                      <Plus className="h-4 w-4 mr-1" />
                      {t('projects.addProperty')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('projects.totalProperties')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProperties}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('projects.criticalAlerts')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {stats.criticalAlerts}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('projects.averageProgress')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageProgress}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {t('projects.totalValue')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      €{new Intl.NumberFormat('de-DE').format(stats.totalValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="properties" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="properties">
                    <Home className="mr-2 h-4 w-4" />
                    {t('projects.properties')} ({properties.length})
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="mr-2 h-4 w-4" />
                    {t('projects.documents')}
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="mr-2 h-4 w-4" />
                    {t('navigation.settings')}
                  </TabsTrigger>
                  <TabsTrigger value="timeline">
                    <Calendar className="mr-2 h-4 w-4" />
                    {t('projects.timeline')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="properties" className="space-y-4">
                  {/* Properties Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.id}
                        property={property}
                        onClick={() => handlePropertyClick(property.id)}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="documents">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('projects.projectDocuments')}</CardTitle>
                      <CardDescription>
                        {t('projects.projectDocumentsDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <FileText className="h-12 w-12 mb-4" />
                        <p>{t('projects.noDocumentsYet')}</p>
                        <Button variant="outline" size="default" className="mt-4">
                          <Plus className="h-4 w-4" />
                          {t('projects.uploadDocument')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('projects.projectSettings')}</CardTitle>
                      <CardDescription>
                        {t('projects.projectSettingsDescription')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <div className="font-medium">{t('projects.projectName')}</div>
                            <div className="text-sm text-muted-foreground">{projectName}</div>
                          </div>
                          <Button variant="outline" size="sm">{t('common.edit')}</Button>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b">
                          <div>
                            <div className="font-medium">{t('properties.location')}</div>
                            <div className="text-sm text-muted-foreground">
                              {properties[0]?.city}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">{t('common.edit')}</Button>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <div className="font-medium">{t('properties.salesPartner')}</div>
                            <div className="text-sm text-muted-foreground">
                              {properties[0]?.sales_partner === 'blackvesto' ? 'BlackVesto' : 'Internal'}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">{t('common.change')}</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <ProjectGanttChart 
                    projectId={projectId}
                    projectName={projectName}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}