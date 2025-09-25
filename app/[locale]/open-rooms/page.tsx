'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { MockDataService } from '@/lib/mock-data';
import { Property } from '@/lib/types';
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  BedDouble,
  Eye,
  UserPlus,
  AlertCircle
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface OpenRoom {
  id: string;
  propertyId: string;
  property: Property;
  roomNumber: string;
  roomSize: number;
  monthlyRent: number;
  vacantSince: Date;
  daysVacant: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastViewing?: Date;
  viewingCount: number;
  status: 'vacant' | 'reserved' | 'processing';
}

export default function OpenRoomsPage() {
  const router = useRouter();
  const [openRooms, setOpenRooms] = useState<OpenRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'vacant' | 'reserved' | 'processing'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'days' | 'rent' | 'priority'>('priority');
  const [selectedRoom, setSelectedRoom] = useState<OpenRoom | null>(null);
  const [showQuickRent, setShowQuickRent] = useState(false);

  useEffect(() => {
    loadOpenRooms();
  }, []);

  const loadOpenRooms = async () => {
    setLoading(true);
    try {
      const properties = await MockDataService.getProperties();

      // Filter for WG properties and create room entries
      const wgProperties = properties.filter(p =>
        p.developer_rental_strategy === 'wg' &&
        p.developer_phase >= 5 // At least in buyer/notary phase
      );

      const mockOpenRooms: OpenRoom[] = [];

      wgProperties.forEach((property) => {
        // Simulate that some rooms are still vacant
        const totalRooms = Math.floor(property.rooms || 3);
        const rentedRooms = Math.floor(totalRooms * 0.6); // 60% rented
        const vacantRooms = totalRooms - rentedRooms;

        for (let i = 0; i < vacantRooms; i++) {
          const vacantDays = Math.floor(Math.random() * 90) + 1; // 1-90 days
          mockOpenRooms.push({
            id: `room-${property.id}-${i + 1}`,
            propertyId: property.id,
            property: property,
            roomNumber: `Room ${rentedRooms + i + 1}`,
            roomSize: 12 + Math.floor(Math.random() * 8), // 12-20 sqm
            monthlyRent: (400 + Math.floor(Math.random() * 200)), // 400-600€
            vacantSince: new Date(Date.now() - vacantDays * 24 * 60 * 60 * 1000),
            daysVacant: vacantDays,
            priority: vacantDays > 60 ? 'critical' : vacantDays > 30 ? 'high' : vacantDays > 14 ? 'medium' : 'low',
            lastViewing: vacantDays > 7 ? new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) : undefined,
            viewingCount: Math.floor(Math.random() * 10),
            status: Math.random() > 0.8 ? 'reserved' : Math.random() > 0.9 ? 'processing' : 'vacant'
          });
        }
      });

      setOpenRooms(mockOpenRooms);
    } catch (error) {
      console.error('Error loading open rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vacant': return 'bg-gray-100 text-gray-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRooms = openRooms
    .filter(room => filterStatus === 'all' || room.status === filterStatus)
    .filter(room => filterPriority === 'all' || room.priority === filterPriority)
    .sort((a, b) => {
      switch (sortBy) {
        case 'days': return b.daysVacant - a.daysVacant;
        case 'rent': return b.monthlyRent - a.monthlyRent;
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        default: return 0;
      }
    });

  const statistics = {
    totalVacant: openRooms.filter(r => r.status === 'vacant').length,
    totalReserved: openRooms.filter(r => r.status === 'reserved').length,
    totalProcessing: openRooms.filter(r => r.status === 'processing').length,
    criticalRooms: openRooms.filter(r => r.priority === 'critical').length,
    totalLostRent: openRooms.reduce((sum, room) => sum + (room.monthlyRent * room.daysVacant / 30), 0),
    avgDaysVacant: openRooms.length > 0 ? Math.round(openRooms.reduce((sum, r) => sum + r.daysVacant, 0) / openRooms.length) : 0
  };

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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Open Rooms</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Vacant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{statistics.totalVacant}</span>
                  <BedDouble className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Available for rent</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-red-600">{statistics.criticalRooms}</span>
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Vacant &gt; 60 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Lost Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">€{Math.round(statistics.totalLostRent).toLocaleString()}</span>
                  <TrendingUp className="h-5 w-5 text-orange-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Potential income lost</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Avg Days Vacant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{statistics.avgDaysVacant}</span>
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Average vacancy period</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Open Rooms Management</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as 'all' | 'vacant' | 'reserved' | 'processing')}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="vacant">Vacant</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as 'all' | 'critical' | 'high' | 'medium' | 'low')}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'days' | 'rent' | 'priority')}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="days">Days Vacant</SelectItem>
                      <SelectItem value="rent">Monthly Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                Manage and prioritize vacant WG rooms across all properties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property / Room</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Rent</TableHead>
                      <TableHead>Vacant Since</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Viewings</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRooms.map((room) => (
                      <TableRow key={room.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{room.property.unit_number}</p>
                            <p className="text-sm text-gray-500">{room.roomNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{room.property.project?.street} {room.property.project?.house_number}</p>
                            <p className="text-gray-500">{room.property.project?.city}</p>
                          </div>
                        </TableCell>
                        <TableCell>{room.roomSize} m²</TableCell>
                        <TableCell className="font-medium">€{room.monthlyRent}</TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{format(room.vacantSince, 'dd.MM.yyyy')}</p>
                            <p className="text-xs text-gray-500">{room.daysVacant} days</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(room.priority)}>
                            {room.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getStatusColor(room.status)}>
                            {room.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{room.viewingCount} total</p>
                            {room.lastViewing && (
                              <p className="text-xs text-gray-500">
                                Last: {format(room.lastViewing, 'dd.MM')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRoom(room)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedRoom(room);
                                setShowQuickRent(true);
                              }}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredRooms.length === 0 && (
                <div className="text-center py-8">
                  <BedDouble className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No open rooms match your filters</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority Alert for Critical Rooms */}
          {statistics.criticalRooms > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <strong>{statistics.criticalRooms} rooms</strong> have been vacant for over 60 days.
                Consider adjusting pricing or increasing marketing efforts for these units.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Room Details Dialog */}
        {selectedRoom && !showQuickRent && (
          <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Room Details</DialogTitle>
                <DialogDescription>
                  {selectedRoom.property.unit_number} - {selectedRoom.roomNumber}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Property</Label>
                    <p className="text-sm">{selectedRoom.property.unit_number}</p>
                    <p className="text-xs text-gray-500">
                      {selectedRoom.property.project?.street} {selectedRoom.property.project?.house_number}
                    </p>
                  </div>
                  <div>
                    <Label>Room Details</Label>
                    <p className="text-sm">{selectedRoom.roomNumber} - {selectedRoom.roomSize} m²</p>
                    <p className="text-xs text-gray-500">Monthly Rent: €{selectedRoom.monthlyRent}</p>
                  </div>
                  <div>
                    <Label>Vacancy Status</Label>
                    <p className="text-sm">Vacant since {format(selectedRoom.vacantSince, 'dd.MM.yyyy')}</p>
                    <p className="text-xs text-gray-500">{selectedRoom.daysVacant} days vacant</p>
                  </div>
                  <div>
                    <Label>Financial Impact</Label>
                    <p className="text-sm text-red-600">
                      €{Math.round(selectedRoom.monthlyRent * selectedRoom.daysVacant / 30)} lost revenue
                    </p>
                    <p className="text-xs text-gray-500">Potential income lost</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Marketing Actions</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button variant="outline" size="sm">Update Listing</Button>
                    <Button variant="outline" size="sm">Schedule Viewing</Button>
                    <Button variant="outline" size="sm">Adjust Price</Button>
                    <Button variant="outline" size="sm">Boost Marketing</Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedRoom(null)}>Close</Button>
                  <Button onClick={() => router.push(`/properties/${selectedRoom.propertyId}/handover`)}>
                    Go to Property
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Quick Rent Dialog */}
        {selectedRoom && showQuickRent && (
          <Dialog open={showQuickRent} onOpenChange={() => { setShowQuickRent(false); setSelectedRoom(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Quick Rent - {selectedRoom.roomNumber}</DialogTitle>
                <DialogDescription>
                  Add a new tenant for {selectedRoom.property.unit_number}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenant-name">Tenant Name</Label>
                    <Input id="tenant-name" placeholder="Enter tenant name" />
                  </div>
                  <div>
                    <Label htmlFor="tenant-email">Email</Label>
                    <Input id="tenant-email" type="email" placeholder="tenant@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="tenant-phone">Phone</Label>
                    <Input id="tenant-phone" placeholder="+49 123 456789" />
                  </div>
                  <div>
                    <Label htmlFor="move-in">Move-in Date</Label>
                    <Input id="move-in" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Rental Terms</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Monthly Rent:</span>
                      <span className="ml-2 font-medium">€{selectedRoom.monthlyRent}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Deposit:</span>
                      <span className="ml-2 font-medium">€{selectedRoom.monthlyRent * 3}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Room Size:</span>
                      <span className="ml-2 font-medium">{selectedRoom.roomSize} m²</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className="ml-2 font-medium">Will be marked as rented</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setShowQuickRent(false); setSelectedRoom(null); }}>
                    Cancel
                  </Button>
                  <Button onClick={() => {
                    // Here you would save the tenant info
                    console.log('Renting room:', selectedRoom.id);
                    setShowQuickRent(false);
                    setSelectedRoom(null);
                  }}>
                    Create Rental Contract
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}