"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Building2,
  Home,
  Clock,
  Upload,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Mock data for document requests across all properties
const MOCK_REQUESTS = [
  {
    id: '1',
    propertyId: 'prop-leo-001',
    propertyName: 'WE 001',
    projectName: 'Leonardstraße 45',
    documentName: 'Updated HOA meeting minutes (2024)',
    requestedBy: 'BlackVesto Sales',
    requestedDate: '2024-01-15',
    dueDate: '2024-01-25',
    status: 'pending',
    priority: 'high',
    targetSection: 'project',
    phase: 2
  },
  {
    id: '2',
    propertyId: 'prop-leo-001',
    propertyName: 'WE 001',
    projectName: 'Leonardstraße 45',
    documentName: 'Professional exterior photos',
    requestedBy: 'BlackVesto Sales',
    requestedDate: '2024-01-16',
    dueDate: '2024-01-26',
    status: 'pending',
    priority: 'medium',
    targetSection: 'unit',
    phase: 4
  },
  {
    id: '3',
    propertyId: 'prop-leo-002',
    propertyName: 'WE 002',
    projectName: 'Leonardstraße 45',
    documentName: 'Energy certificate update',
    requestedBy: 'BlackVesto Sales',
    requestedDate: '2024-01-14',
    dueDate: '2024-01-24',
    status: 'overdue',
    priority: 'high',
    targetSection: 'project',
    phase: 1
  },
  {
    id: '4',
    propertyId: 'prop-haupt-101',
    propertyName: 'WE 101',
    projectName: 'Hauptstraße 89',
    documentName: 'Renovation cost breakdown',
    requestedBy: 'BlackVesto Sales',
    requestedDate: '2024-01-17',
    dueDate: '2024-01-27',
    status: 'pending',
    priority: 'low',
    targetSection: 'unit',
    phase: 3
  },
  {
    id: '5',
    propertyId: 'prop-haupt-102',
    propertyName: 'WE 102',
    projectName: 'Hauptstraße 89',
    documentName: 'Floor plan measurements',
    requestedBy: 'Internal Team',
    requestedDate: '2024-01-10',
    dueDate: '2024-01-20',
    status: 'uploaded',
    priority: 'medium',
    targetSection: 'unit',
    phase: 1,
    uploadedDate: '2024-01-18'
  },
  {
    id: '6',
    propertyId: 'prop-karl-201',
    propertyName: 'WE 201',
    projectName: 'Karlstraße 15',
    documentName: 'Insurance policy documentation',
    requestedBy: 'BlackVesto Sales',
    requestedDate: '2024-01-18',
    dueDate: '2024-01-28',
    status: 'pending',
    priority: 'high',
    targetSection: 'project',
    phase: 2
  }
];

export default function DocumentRequestsPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  // Filter requests
  const filteredRequests = MOCK_REQUESTS.filter(request => {
    const matchesSearch = request.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    const matchesTab = activeTab === 'all' ||
                       (activeTab === 'pending' && request.status === 'pending') ||
                       (activeTab === 'overdue' && request.status === 'overdue') ||
                       (activeTab === 'completed' && request.status === 'uploaded');

    return matchesSearch && matchesStatus && matchesPriority && matchesTab;
  });

  // Group by project for better organization
  const requestsByProject = filteredRequests.reduce((acc, request) => {
    if (!acc[request.projectName]) {
      acc[request.projectName] = [];
    }
    acc[request.projectName].push(request);
    return acc;
  }, {} as Record<string, typeof MOCK_REQUESTS>);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('documents.pending')}</Badge>;
      case 'overdue':
        return <Badge variant="destructive">{t('documents.overdue')}</Badge>;
      case 'uploaded':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('documents.completed')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">{t('documents.priorityHigh')}</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">{t('documents.priorityMedium')}</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">{t('documents.priorityLow')}</Badge>;
      default:
        return null;
    }
  };

  const pendingCount = MOCK_REQUESTS.filter(r => r.status === 'pending').length;
  const overdueCount = MOCK_REQUESTS.filter(r => r.status === 'overdue').length;
  const completedCount = MOCK_REQUESTS.filter(r => r.status === 'uploaded').length;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">{t('documents.requests')}</h1>
              <p className="text-gray-600">{t('documents.requestsDescription')}</p>
            </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={cn(
            "cursor-pointer transition-all",
            activeTab === 'all' && "ring-2 ring-primary"
          )} onClick={() => setActiveTab('all')}>
            <CardHeader className="pb-2">
              <CardDescription>{t('documents.totalRequests')}</CardDescription>
              <CardTitle className="text-2xl">{MOCK_REQUESTS.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{t('documents.acrossAllProperties')}</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "cursor-pointer transition-all border-orange-200 bg-orange-50",
            activeTab === 'pending' && "ring-2 ring-orange-500"
          )} onClick={() => setActiveTab('pending')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{t('documents.pending')}</CardDescription>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-600">{pendingCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-orange-600">{t('documents.awaitingUpload')}</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "cursor-pointer transition-all border-red-200 bg-red-50",
            activeTab === 'overdue' && "ring-2 ring-red-500"
          )} onClick={() => setActiveTab('overdue')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{t('documents.overdue')}</CardDescription>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">{overdueCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-600">{t('documents.immediateAttention')}</p>
            </CardContent>
          </Card>

          <Card className={cn(
            "cursor-pointer transition-all border-green-200 bg-green-50",
            activeTab === 'completed' && "ring-2 ring-green-500"
          )} onClick={() => setActiveTab('completed')}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{t('documents.completed')}</CardDescription>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">{completedCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-green-600">{t('documents.thisWeek')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('documents.allRequests')}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('documents.searchPlaceholder')}
                    className="pl-8 w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('documents.allStatus')}</SelectItem>
                    <SelectItem value="pending">{t('documents.pending')}</SelectItem>
                    <SelectItem value="overdue">{t('documents.overdue')}</SelectItem>
                    <SelectItem value="uploaded">{t('documents.completed')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('documents.allPriority')}</SelectItem>
                    <SelectItem value="high">{t('documents.priorityHigh')}</SelectItem>
                    <SelectItem value="medium">{t('documents.priorityMedium')}</SelectItem>
                    <SelectItem value="low">{t('documents.priorityLow')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Grouped Requests Table */}
            {Object.keys(requestsByProject).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(requestsByProject).map(([projectName, requests]) => (
                  <div key={projectName} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <Building2 className="h-4 w-4" />
                      {projectName}
                      <Badge variant="outline" className="text-xs">
                        {t('documents.requestCount', { count: requests.length })}
                      </Badge>
                    </div>
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('documents.document')}</TableHead>
                            <TableHead>{t('documents.property')}</TableHead>
                            <TableHead>{t('documents.type')}</TableHead>
                            <TableHead>{t('documents.requestedBy')}</TableHead>
                            <TableHead>{t('documents.dueDate')}</TableHead>
                            <TableHead>{t('documents.priority')}</TableHead>
                            <TableHead>{t('documents.status')}</TableHead>
                            <TableHead className="text-right">{t('documents.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {requests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  {request.documentName}
                                </div>
                              </TableCell>
                              <TableCell>{request.propertyName}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {request.targetSection === 'project' ? (
                                    <>
                                      <Building2 className="h-3 w-3 mr-1" />
                                      {t('documents.building')}
                                    </>
                                  ) : (
                                    <>
                                      <Home className="h-3 w-3 mr-1" />
                                      {t('documents.unit')}
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-gray-600">{request.requestedBy}</TableCell>
                              <TableCell>
                                <span className={cn(
                                  "text-sm",
                                  request.status === 'overdue' && "text-red-600 font-medium"
                                )}>
                                  {request.dueDate}
                                </span>
                              </TableCell>
                              <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                              <TableCell>{getStatusBadge(request.status)}</TableCell>
                              <TableCell className="text-right">
                                {request.status === 'pending' || request.status === 'overdue' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size="sm" variant="outline">
                                      <Upload className="h-3 w-3 mr-1" />
                                      {t('documents.upload')}
                                    </Button>
                                    <Link href={`/properties/${request.propertyId}?tab=documents`}>
                                      <Button size="sm" variant="ghost">
                                        <ArrowRight className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                  </div>
                                ) : (
                                  <Link href={`/properties/${request.propertyId}?tab=documents`}>
                                    <Button size="sm" variant="ghost">
                                      {t('common.view')}
                                    </Button>
                                  </Link>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">{t('documents.noRequestsFound')}</p>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}