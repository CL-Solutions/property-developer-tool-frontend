'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedTrafficLights } from '@/components/enhanced-traffic-lights';
import { PhaseTimeline, PhaseIndicator } from '@/components/phase-indicator';
import { DocumentManagement } from '@/components/document-management';
import { ConstructionTracking } from '@/components/construction-tracking';
import { PreCheckSummary } from '@/components/phase1/pre-check-summary';
import { HandoverTab } from '@/components/handover-tab';
import { MockDataService } from '@/lib/mock-data';
import { Property, DeveloperConstructionMilestone, DeveloperHandoverProtocol, DeveloperDocumentRequest } from '@/lib/types';
import {
  ArrowLeft,
  Construction,
  HandHeart,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  FileCheck,
  Calendar,
  Users,
  Key,
  FileUp,
  DollarSign,
  TrendingUp,
  Home,
  CheckSquare,
  XCircle,
  RefreshCw,
  Edit
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
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { PropertyGanttChart } from "@/components/property-gantt-chart"

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [milestones, setMilestones] = useState<DeveloperConstructionMilestone[]>([]);
  const [handoverProtocols, setHandoverProtocols] = useState<DeveloperHandoverProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadPropertyData = async () => {
      setLoading(true);
      try {
        const [propertyData, milestonesData, handoverData] = await Promise.all([
          MockDataService.getProperty(propertyId),
          MockDataService.getConstructionMilestones(propertyId),
          MockDataService.getHandoverProtocols(propertyId)
        ]);

        setProperty(propertyData);
        setMilestones(milestonesData);
        setHandoverProtocols(handoverData);
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPropertyData();
  }, [propertyId]);

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
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
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const totalConstructionProgress = milestones.length > 0
    ? Math.round(milestones.reduce((sum, m) => sum + m.progress_percentage, 0) / milestones.length)
    : property.developer_construction_progress || 0;

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
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {property.unit_number} - {property.project?.name || 'Property'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Property Header and Development Progress Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Property Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    {property.unit_number} - {property.project?.name || 'Unknown Project'}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {property.project?.street} {property.project?.house_number}, {property.project?.zip_code} {property.project?.city}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/properties/new?edit=${propertyId}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Property
                  </Button>
                  <Badge variant={property.developer_sales_partner === 'blackvesto' ? 'default' : 'secondary'}>
                    {property.developer_sales_partner === 'blackvesto' ? 'BlackVesto' : 'Internal'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="font-semibold">{property.size_sqm} m²</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Rooms</p>
                  <p className="font-semibold">{property.rooms}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Floor</p>
                  <p className="font-semibold">{property.floor}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold capitalize">{property.property_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Progress */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Development Progress</CardTitle>
                  <CardDescription>Current phase: {property.developer_phase} of 6</CardDescription>
                </div>
                <PhaseIndicator currentPhase={property.developer_phase} status={property.developer_phase_status} size="sm" />
              </div>
            </CardHeader>
            <CardContent>
              <PhaseTimeline currentPhase={property.developer_phase} />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pre-check">Pre-Check Assessment</TabsTrigger>
            <TabsTrigger value="construction">Construction</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="handover">Handover</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Dynamic Phase-Based Content */}
            {property.developer_phase === 1 && (
              <>
                {/* Phase 1: Pre-Check */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileCheck className="h-5 w-5" />
                          Pre-Check Assessment
                        </CardTitle>
                        <CardDescription>
                          {!property.developer_pre_check_date
                            ? "Gather property data and send for evaluation"
                            : property.developer_pre_check_result
                            ? "BlackVesto feedback received"
                            : "Awaiting BlackVesto evaluation"}
                        </CardDescription>
                      </div>
                      {property.developer_pre_check_date && !property.developer_pre_check_result && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Pending Review
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Traffic Lights Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3">Current Assessment</h4>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "w-8 h-8 rounded-full",
                              property.developer_initial_traffic_lights?.energy === 'green' ? "bg-green-500" :
                              property.developer_initial_traffic_lights?.energy === 'yellow' ? "bg-yellow-500" :
                              property.developer_initial_traffic_lights?.energy === 'red' ? "bg-red-500" :
                              property.energy_class && ['A', 'A+', 'B'].includes(property.energy_class) ? "bg-green-500" :
                              property.energy_class && ['C', 'D'].includes(property.energy_class) ? "bg-yellow-500" :
                              "bg-red-500"
                            )}></div>
                            <span className="text-sm font-medium">Energy</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-10">
                            {property.developer_initial_traffic_lights?.scores?.energy
                              ? `${property.developer_initial_traffic_lights.scores.energy.toFixed(1)}/10`
                              : `Class ${property.energy_class || 'N/A'}`}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "w-8 h-8 rounded-full",
                              property.developer_initial_traffic_lights?.yield === 'green' ? "bg-green-500" :
                              property.developer_initial_traffic_lights?.yield === 'yellow' ? "bg-yellow-500" :
                              property.developer_initial_traffic_lights?.yield === 'red' ? "bg-red-500" :
                              property.gross_rental_yield && property.gross_rental_yield >= 5 ? "bg-green-500" :
                              property.gross_rental_yield && property.gross_rental_yield >= 3.5 ? "bg-yellow-500" :
                              "bg-red-500"
                            )}></div>
                            <span className="text-sm font-medium">Yield</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-10">
                            {property.developer_initial_traffic_lights?.scores?.yield
                              ? `${property.developer_initial_traffic_lights.scores.yield.toFixed(1)}/10`
                              : property.gross_rental_yield ? `${property.gross_rental_yield}%` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "w-8 h-8 rounded-full",
                              property.developer_initial_traffic_lights?.hoa === 'green' ? "bg-green-500" :
                              property.developer_initial_traffic_lights?.hoa === 'yellow' ? "bg-yellow-500" :
                              property.developer_initial_traffic_lights?.hoa === 'red' ? "bg-red-500" :
                              "bg-gray-500" // Default if no traffic light data
                            )}></div>
                            <span className="text-sm font-medium">HOA</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-10">
                            {property.developer_initial_traffic_lights?.scores?.hoa
                              ? `${property.developer_initial_traffic_lights.scores.hoa.toFixed(1)}/10`
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn(
                              "w-8 h-8 rounded-full",
                              property.developer_initial_traffic_lights?.location === 'green' ? "bg-green-500" :
                              property.developer_initial_traffic_lights?.location === 'yellow' ? "bg-yellow-500" :
                              property.developer_initial_traffic_lights?.location === 'red' ? "bg-red-500" :
                              "bg-gray-500" // Default if no traffic light data
                            )}></div>
                            <span className="text-sm font-medium">Location</span>
                          </div>
                          <p className="text-xs text-gray-600 ml-10">
                            {property.developer_initial_traffic_lights?.scores?.location
                              ? `${property.developer_initial_traffic_lights.scores.location.toFixed(1)}/10`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('pre-check')}
                        >
                          View Detailed Assessment →
                        </Button>
                      </div>
                    </div>

                    {/* BlackVesto Feedback (if received) */}
                    {property.developer_pre_check_result && (
                      <Alert className={
                        property.developer_pre_check_result === 'approved' ? 'border-green-200' :
                        property.developer_pre_check_result === 'approved_with_modifications' ? 'border-yellow-200' :
                        'border-red-200'
                      }>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          <span className="font-semibold">BlackVesto Feedback: </span>
                          {property.developer_pre_check_result === 'approved' && 'Property approved for purchase'}
                          {property.developer_pre_check_result === 'approved_with_modifications' && 'Approved with suggested price adjustment'}
                          {property.developer_pre_check_result === 'rejected' && 'Not recommended for purchase'}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!property.developer_pre_check_date ? (
                        <>
                          <Button className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Send to BlackVesto Partner
                          </Button>
                          <Button variant="outline">
                            Complete Manually
                          </Button>
                        </>
                      ) : property.developer_pre_check_result ? (
                        <Button className="flex items-center gap-2">
                          <ArrowLeft className="h-4 w-4" />
                          Proceed to Purchase Decision
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Clock className="h-4 w-4 mr-2" />
                          Awaiting Response...
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <FileUp className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-semibold">Upload Documents</p>
                          <p className="text-sm text-gray-500">Floor plans, energy certificate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-8 w-8 text-green-500" />
                        <div>
                          <p className="font-semibold">Financial Calculator</p>
                          <p className="text-sm text-gray-500">ROI and yield analysis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <FileCheck className="h-8 w-8 text-purple-500" />
                        <div>
                          <p className="font-semibold">Pre-Check Details</p>
                          <p className="text-sm text-gray-500">View full assessment</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {property.developer_phase === 2 && (
              <>
                {/* Phase 2: Purchase Decision */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Purchase Decision Required
                    </CardTitle>
                    <CardDescription>Review feedback and make final decision</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* BlackVesto Feedback Summary */}
                    {property.developer_pre_check_result && (
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileCheck className="h-4 w-4" />
                          BlackVesto Evaluation
                        </h4>
                        <Badge className={
                          property.developer_pre_check_result === 'approved' ? 'bg-green-100 text-green-800' :
                          property.developer_pre_check_result === 'approved_with_modifications' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {property.developer_pre_check_result === 'approved' && 'Fully Approved'}
                          {property.developer_pre_check_result === 'approved_with_modifications' && 'Price Adjustment Suggested'}
                          {property.developer_pre_check_result === 'rejected' && 'Not Recommended'}
                        </Badge>
                        {property.developer_pre_check_result === 'approved_with_modifications' && (
                          <Alert className="mt-3">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              BlackVesto suggests reducing price from €{property.developer_purchase_price?.toLocaleString()}
                              to achieve better yield
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* Traffic Lights Overview */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-3">Assessment Results</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 mx-auto rounded-full mb-2",
                            property.developer_initial_traffic_lights?.energy === 'green' ? "bg-green-500" :
                            property.developer_initial_traffic_lights?.energy === 'yellow' ? "bg-yellow-500" :
                            property.developer_initial_traffic_lights?.energy === 'red' ? "bg-red-500" :
                            property.energy_class && ['A', 'A+', 'B'].includes(property.energy_class) ? "bg-green-500" :
                            property.energy_class && ['C', 'D'].includes(property.energy_class) ? "bg-yellow-500" :
                            "bg-red-500"
                          )}></div>
                          <p className="text-xs font-medium">Energy</p>
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 mx-auto rounded-full mb-2",
                            property.developer_initial_traffic_lights?.yield === 'green' ? "bg-green-500" :
                            property.developer_initial_traffic_lights?.yield === 'yellow' ? "bg-yellow-500" :
                            property.developer_initial_traffic_lights?.yield === 'red' ? "bg-red-500" :
                            property.gross_rental_yield && property.gross_rental_yield >= 5 ? "bg-green-500" :
                            property.gross_rental_yield && property.gross_rental_yield >= 3.5 ? "bg-yellow-500" :
                            "bg-red-500"
                          )}></div>
                          <p className="text-xs font-medium">Yield</p>
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 mx-auto rounded-full mb-2",
                            property.developer_initial_traffic_lights?.hoa === 'green' ? "bg-green-500" :
                            property.developer_initial_traffic_lights?.hoa === 'yellow' ? "bg-yellow-500" :
                            property.developer_initial_traffic_lights?.hoa === 'red' ? "bg-red-500" :
                            "bg-red-500"
                          )}></div>
                          <p className="text-xs font-medium">HOA</p>
                        </div>
                        <div className="text-center">
                          <div className={cn(
                            "w-12 h-12 mx-auto rounded-full mb-2",
                            property.developer_initial_traffic_lights?.location === 'green' ? "bg-green-500" :
                            property.developer_initial_traffic_lights?.location === 'yellow' ? "bg-yellow-500" :
                            property.developer_initial_traffic_lights?.location === 'red' ? "bg-red-500" :
                            "bg-gray-300"
                          )}></div>
                          <p className="text-xs font-medium">Location</p>
                        </div>
                      </div>
                    </div>

                    {/* Decision Actions */}
                    <div className="space-y-2">
                      <h4 className="font-semibold">Make Your Decision</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          GO - Purchase Property
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Adjust & Negotiate
                        </Button>
                        <Button variant="destructive" className="flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          NO GO - Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Decision Criteria Checklist */}
                <Card>
                  <CardHeader>
                    <CardTitle>Decision Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        'Positive BlackVesto feedback',
                        'Yield meets target (>5%)',
                        'Location assessment positive',
                        'HOA fees acceptable',
                        'Renovation budget confirmed'
                      ].map((criteria) => (
                        <div key={criteria} className="flex items-center gap-2">
                          <CheckSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{criteria}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {property.developer_phase === 3 && (
              <>
                {/* Phase 3: Documentation & Preparation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileUp className="h-5 w-5" />
                      Documentation & Preparation
                    </CardTitle>
                    <CardDescription>Complete all documentation and prepare marketing materials</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Property purchased successfully. Now preparing for marketing.
                        </AlertDescription>
                      </Alert>
                      <div className="flex gap-2">
                        <Button>Upload Documents</Button>
                        <Button variant="outline">Generate Marketing Materials</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {property.developer_phase === 4 && (
              <>
                {/* Phase 4: Active Marketing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Active Marketing & Reservation
                    </CardTitle>
                    <CardDescription>Property is actively listed and accepting viewings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Viewing Requests</p>
                        <p className="text-2xl font-semibold">12</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Reservations</p>
                        <p className="text-2xl font-semibold">2</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Days on Market</p>
                        <p className="text-2xl font-semibold">7</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button>Schedule Viewing</Button>
                      <Button variant="outline">Create Reservation</Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {property.developer_phase === 5 && (
              <>
                {/* Phase 5: Buyer Process & Notary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Buyer Process & Notary
                    </CardTitle>
                    <CardDescription>Finalizing sale with buyer and notary appointment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded">
                        <p className="text-sm font-semibold">Buyer Information</p>
                        <p className="text-sm mt-1">Max Mustermann</p>
                        <p className="text-sm text-gray-500">Notary appointment: 15.01.2024</p>
                      </div>
                      <div className="flex gap-2">
                        <Button>View Contract</Button>
                        <Button variant="outline">Contact Notary</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {property.developer_phase === 6 && (
              <>
                {/* Phase 6: Handover & Rental */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Property Handover & Rental Setup
                    </CardTitle>
                    <CardDescription>Complete handover and setup rental management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {property.has_erstvermietungsgarantie && (
                        <Alert>
                          <Home className="h-4 w-4" />
                          <AlertDescription>
                            First rental guarantee active: €{property.monthly_rent}/month
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="flex gap-2">
                        <Button>Complete Handover</Button>
                        <Button variant="outline">Setup Rental Management</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Financial Overview - Always visible */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Price</p>
                    <p className="text-xl font-semibold">€{property.developer_purchase_price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Selling Price</p>
                    <p className="text-xl font-semibold">€{property.selling_price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Renovation Budget</p>
                    <p className="text-xl font-semibold">€{property.developer_renovation_budget?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gross Rental Yield</p>
                    <p className="text-xl font-semibold">{property.gross_rental_yield}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pre-check" className="space-y-4">
            {property.developer_phase >= 1 ? (
              <PreCheckSummary property={property} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pre-Check Assessment</CardTitle>
                  <CardDescription>Initial property evaluation and traffic light assessment</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Pre-check assessment not yet completed</p>
                  <p className="text-sm text-gray-400">The pre-check evaluation will be available once Phase 1 is initiated</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="construction" className="space-y-4">
            <ConstructionTracking
              propertyId={propertyId}
              currentPhase={property.developer_phase}
              salesPartner={property.developer_sales_partner}
              onVisibilityToggle={(visible) => {
                console.log('Construction visibility changed:', visible);
              }}
            />
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <DocumentManagement
              propertyId={propertyId}
              property={property}
              currentPhase={property.developer_phase}
              documents={[]} // Mock data - in real app would come from API
              onDocumentUpload={async (file, documentType) => {
                // Simulate document upload
                console.log('Uploading:', file.name, 'as', documentType);
                await new Promise(resolve => setTimeout(resolve, 2000));
              }}
              onDocumentDelete={async (documentId) => {
                // Simulate document deletion
                console.log('Deleting document:', documentId);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }}
            />
          </TabsContent>

          <TabsContent value="handover" className="space-y-4">
            <HandoverTab property={property} />
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <PropertyGanttChart 
              propertyId={propertyId}
              currentPhase={property.developer_phase}
              purchaseDate={property.developer_purchase_date ? new Date(property.developer_purchase_date) : new Date()}
              projectName={property.project?.name}
              unitNumber={property.unit_number}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
    </SidebarProvider>
  );
}