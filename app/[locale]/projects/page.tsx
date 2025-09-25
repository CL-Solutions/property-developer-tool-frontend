"use client"

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LocaleLink } from '@/components/locale-link';
import Link from 'next/link';
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MockDataService } from '@/lib/mock-data';
import { PropertySummary } from '@/lib/types';
import {
  Building,
  MapPin,
  Home,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ProjectSummary {
  id: string;
  name: string;
  address: string;
  city: string;
  propertyCount: number;
  averageProgress: number;
  criticalAlerts: number;
  totalValue: number;
  phase: string;
}

export default function ProjectsPage() {
  const t = useTranslations();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const properties = await MockDataService.getPropertySummaries();

        // Group properties by project
        const projectMap = new Map<string, PropertySummary[]>();
        properties.forEach(property => {
          if (!projectMap.has(property.project_name)) {
            projectMap.set(property.project_name, []);
          }
          projectMap.get(property.project_name)?.push(property);
        });

        // Create project summaries
        const projectSummaries: ProjectSummary[] = Array.from(projectMap.entries()).map(([name, props]) => {
          const firstProp = props[0];
          const avgProgress = Math.round(
            props.reduce((sum, p) => sum + p.construction_progress, 0) / props.length
          );
          const criticalCount = props.filter(p => p.has_critical_alerts).length;

          // Determine overall project phase (most common phase)
          const phaseCounts = props.reduce((acc, p) => {
            acc[p.phase] = (acc[p.phase] || 0) + 1;
            return acc;
          }, {} as Record<number, number>);
          const mostCommonPhase = Object.entries(phaseCounts).reduce((a, b) =>
            phaseCounts[parseInt(a[0])] > phaseCounts[parseInt(b[0])] ? a : b
          )[0];

          // Create a simpler ID that preserves the full project name
          const projectId = `project-${name.toLowerCase()}`;

          return {
            id: projectId,
            name: name,
            address: `${firstProp.street} ${firstProp.house_number}`,
            city: firstProp.city,
            propertyCount: props.length,
            averageProgress: avgProgress,
            criticalAlerts: criticalCount,
            totalValue: props.length * 450000, // Mock value
            phase: `Phase ${mostCommonPhase}`
          };
        });

        setProjects(projectSummaries);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{t('projects.title')}</h1>
              <p className="text-muted-foreground">
                {t('projects.description')}
              </p>
            </div>
            <LocaleLink href="/projects/new">
              <Button size="default">
                <Plus className="h-4 w-4" />
                {t('projects.newProject')}
              </Button>
            </LocaleLink>
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <LocaleLink href={`/projects/${project.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {project.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {project.address}, {project.city}
                          </CardDescription>
                        </div>
                        {project.criticalAlerts > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {project.criticalAlerts} {project.criticalAlerts > 1 ? t('projects.alerts') : t('projects.alert')}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Properties count */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span>{project.propertyCount} {t('projects.properties')}</span>
                        </div>
                        <Badge variant="outline">{project.phase}</Badge>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{t('projects.constructionProgress')}</span>
                          <span className="font-medium">{project.averageProgress}%</span>
                        </div>
                        <Progress value={project.averageProgress} className="h-2" />
                      </div>

                      {/* Total Value */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          <div className="text-xs text-muted-foreground">{t('projects.totalValue')}</div>
                          <div className="text-lg font-semibold">
                            €{new Intl.NumberFormat('de-DE').format(project.totalValue)}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t('common.viewDetails')}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </LocaleLink>
                </Card>
              ))
            )}
          </div>

          {/* Empty state */}
          {!loading && projects.length === 0 && (
            <Card className="flex flex-col items-center justify-center p-12">
              <Building className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('projects.noProjectsYet')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('projects.noProjectsDescription')}
              </p>
              <Button size="default">
                <Plus className="h-4 w-4" />
                {t('projects.createProject')}
              </Button>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}