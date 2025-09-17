"use client"

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MockDataService } from '@/lib/mock-data';
import { PropertySummary } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Building,
  AlertTriangle,
  TrendingUp,
  Activity,
  MapPin,
  Home,
  Plus,
  ArrowRight,
  Briefcase,
  Clock,
  ClipboardCheck,
  FileText
} from 'lucide-react';

interface ProjectSummary {
  id: string;
  name: string;
  address: string;
  city: string;
  propertyCount: number;
  averageProgress: number;
  criticalAlerts: number;
}

export function PropertyDashboard() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProperties: 0,
    criticalAlerts: 0,
    averageProgress: 0,
    activeProjects: 0,
    pendingRequests: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await MockDataService.getPropertySummaries();

        // Group properties by project
        const projectMap = new Map<string, PropertySummary[]>();
        data.forEach(property => {
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

          // Create a simpler ID that preserves the full project name
          const projectId = `project-${name.toLowerCase()}`;

          return {
            id: projectId,
            name: name,
            address: `${firstProp.street} ${firstProp.house_number}`,
            city: firstProp.city,
            propertyCount: props.length,
            averageProgress: avgProgress,
            criticalAlerts: criticalCount
          };
        });

        setProjects(projectSummaries.slice(0, 4)); // Show top 4 projects on dashboard

        // Calculate overall stats
        const criticalCount = data.filter(p => p.has_critical_alerts).length;
        const avgProgress = Math.round(
          data.reduce((acc, p) => acc + p.construction_progress, 0) / data.length
        );

        // Mock pending document requests count
        // In real app, this would come from an API
        const pendingRequestsCount = 7; // Simulating pending requests across properties

        setStats({
          totalProperties: data.length,
          criticalAlerts: criticalCount,
          averageProgress: avgProgress,
          activeProjects: projectSummaries.length,
          pendingRequests: pendingRequestsCount
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              Development projects in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Overall construction completion
            </p>
          </CardContent>
        </Card>

        {/* Pending Document Requests Card */}
        <Link href="/document-requests">
          <Card className="cursor-pointer hover:shadow-md transition-all border-orange-200 bg-gradient-to-br from-orange-50 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Document Requests</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                  Pending
                </Badge>
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link href="/projects">
            <Button variant="ghost" size="default">
              View all projects
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
                <Link href={`/projects/${project.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {project.address}, {project.city}
                        </div>
                      </div>
                      {project.criticalAlerts > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {project.criticalAlerts} Alert{project.criticalAlerts > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{project.propertyCount} Properties</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{project.averageProgress}%</span>
                      </div>
                      <Progress value={project.averageProgress} className="h-2" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href="/pre-check">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <ClipboardCheck className="h-4 w-4" />
                <CardTitle className="text-sm">Pre-Check</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Quick property assessment</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <Link href="/analytics">
              <CardHeader className="flex flex-row items-center space-x-2 pb-2">
                <Activity className="h-4 w-4" />
                <CardTitle className="text-sm">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">View performance metrics</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Briefcase className="h-4 w-4" />
              <CardTitle className="text-sm">Sales Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Manage partner relationships</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-2 pb-2">
              <Clock className="h-4 w-4" />
              <CardTitle className="text-sm">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">View project schedules</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}