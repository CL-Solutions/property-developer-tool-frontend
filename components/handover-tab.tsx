'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Camera,

  Zap,
  Droplets,
  Flame,
  AlertCircle,
  Download,
  Send,
  CreditCard,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  FileSignature,
  Users,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import type { Property } from '@/lib/types';

interface MeterReading {
  id: string;
  type: 'electricity' | 'gas' | 'water' | 'heating';
  meterNumber: string;
  currentReading: string;
  previousReading?: string;
  readingDate: string;
  photo?: File;
  photoUrl?: string;
  unit: string;
}

interface HandoverChecklistItem {
  id: string;
  category: string;
  item: string;
  checked: boolean;
  notes?: string;
  required: boolean;
}

interface TenantInfo {
  name: string;
  email: string;
  phone: string;
  moveInDate: string;
  monthlyRent: number;
  deposit: number;
  contractStartDate: string;
  contractEndDate?: string;
  sepaMandate?: boolean;
}

interface RoomTenantInfo extends TenantInfo {
  roomName: string;
  roomSize?: number;
  roomNumber: number;
  isOccupied: boolean;
}

interface HandoverTabProps {
  property: Property;
}

export function HandoverTab({ property }: HandoverTabProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('meters');
  const [handoverComplete, setHandoverComplete] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [showSEPAPreview, setShowSEPAPreview] = useState(false);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number | null>(null);
  const [forceWGMode] = useState(false);

  // Check if property is WG type
  const isWG = forceWGMode || property.developer_rental_strategy === 'wg';

  // Get WG room configuration from property
  const propertyWithWGRooms = property as Property & {
    developer_wg_room_pricing?: Array<{
      room: string;
      size: number;
      price: number;
    }>;
    developer_tenant_info?: {
      name?: string;
      email?: string;
      phone?: string;
      move_in_date?: string;
      monthly_rent?: number;
      deposit?: number;
      contract_start?: string;
      contract_end?: string;
      sepa_mandate?: boolean;
    };
  };

  // Initialize meter readings from property data if available
  const initializeMeterReadings = (): MeterReading[] => {
    const defaultReadings: MeterReading[] = [
      {
        id: '1',
        type: 'electricity',
        meterNumber: 'EL-2024-001',
        currentReading: '',
        previousReading: '12345',
        readingDate: format(new Date(), 'yyyy-MM-dd'),
        unit: 'kWh'
      },
      {
        id: '2',
        type: 'gas',
        meterNumber: 'GAS-2024-002',
        currentReading: '',
        previousReading: '8765',
        readingDate: format(new Date(), 'yyyy-MM-dd'),
        unit: 'm³'
      },
      {
        id: '3',
        type: 'water',
        meterNumber: 'H2O-2024-003',
        currentReading: '',
        previousReading: '234',
        readingDate: format(new Date(), 'yyyy-MM-dd'),
        unit: 'm³'
      }
    ];

    const propertyWithMeters = property as Property & {
      developer_meter_readings?: Array<{
        type: string;
        meter_number?: string;
        current_reading?: number;
        previous_reading?: number;
        reading_date?: string;
        unit?: string;
      }>;
    };

    if (propertyWithMeters.developer_meter_readings && Array.isArray(propertyWithMeters.developer_meter_readings)) {
      return propertyWithMeters.developer_meter_readings.map((meter, index) => ({
        id: (index + 1).toString(),
        type: meter.type as MeterReading['type'],
        meterNumber: meter.meter_number || `${meter.type.toUpperCase()}-2024-${index + 1}`,
        currentReading: meter.current_reading?.toString() || '',
        previousReading: meter.previous_reading?.toString() || '',
        readingDate: meter.reading_date || format(new Date(), 'yyyy-MM-dd'),
        unit: meter.unit || 'kWh'
      }));
    }

    return defaultReadings;
  };

  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(initializeMeterReadings());

  const [nebenkostenData, setNebenkostenData] = useState({
    prepaidAmount: 2640,
    actualCosts: {
      heating: 890,
      water: 340,
      garbage: 180,
      cleaning: 220,
      insurance: 120,
      maintenance: 350,
      other: 140
    }
  });

  const handleNebenkostenChange = (field: string, value: number) => {
    if (field === 'prepaidAmount') {
      setNebenkostenData(prev => ({ ...prev, prepaidAmount: value }));
    } else {
      setNebenkostenData(prev => ({
        ...prev,
        actualCosts: { ...prev.actualCosts, [field]: value }
      }));
    }
  };

  // Initialize checklist from property data if available
  const initializeChecklist = (): HandoverChecklistItem[] => {
    const defaultChecklist = [
      { id: '1', category: 'Keys', item: 'Main door keys handed over', checked: false, required: true },
      { id: '2', category: 'Keys', item: 'Mailbox key handed over', checked: false, required: true },
      { id: '3', category: 'Keys', item: 'Cellar key handed over', checked: false, required: false },
      { id: '4', category: 'Documents', item: 'Energy certificate provided', checked: false, required: true },
      { id: '5', category: 'Documents', item: 'Rental contract signed', checked: false, required: true },
      { id: '6', category: 'Documents', item: 'House rules provided', checked: false, required: true },
      { id: '7', category: 'Documents', item: 'Handover protocol signed', checked: false, required: true },
      { id: '8', category: 'Condition', item: 'Walls and ceilings checked', checked: false, required: true },
      { id: '9', category: 'Condition', item: 'Windows and doors functional', checked: false, required: true },
      { id: '10', category: 'Condition', item: 'Heating system explained', checked: false, required: true },
      { id: '11', category: 'Condition', item: 'Electrical outlets tested', checked: false, required: false },
      { id: '12', category: 'Condition', item: 'Water taps functional', checked: false, required: true },
      { id: '13', category: 'Payment', item: 'Deposit received', checked: false, required: true },
      { id: '14', category: 'Payment', item: 'First rent received', checked: false, required: true },
      { id: '15', category: 'Payment', item: 'SEPA mandate signed', checked: false, required: false }
    ];

    const propertyWithChecklist = property as Property & {
      developer_handover_checklist?: {
        keys_handed?: boolean;
        protocol_signed?: boolean;
        deposit_received?: boolean;
        first_rent_received?: boolean;
        damages_documented?: boolean;
      };
    };
    if (propertyWithChecklist.developer_handover_checklist) {
      const checklist = propertyWithChecklist.developer_handover_checklist;
      // Update checklist based on property data
      return defaultChecklist.map(item => {
        switch(item.id) {
          case '1':
          case '2':
          case '3':
            return { ...item, checked: checklist.keys_handed || false };
          case '7':
            return { ...item, checked: checklist.protocol_signed || false };
          case '13':
            return { ...item, checked: checklist.deposit_received || false };
          case '14':
            return { ...item, checked: checklist.first_rent_received || false };
          case '8':
          case '9':
          case '10':
          case '11':
          case '12':
            return { ...item, checked: checklist.damages_documented || false };
          default:
            return item;
        }
      });
    }

    return defaultChecklist;
  };

  const [checklist, setChecklist] = useState<HandoverChecklistItem[]>(initializeChecklist());

  // Initialize room tenants for WG properties
  const initializeRoomTenants = (): RoomTenantInfo[] => {
    if (!isWG) {
      return [];
    }

    // If we have predefined room pricing, use it
    if (propertyWithWGRooms.developer_wg_room_pricing && propertyWithWGRooms.developer_wg_room_pricing.length > 0) {
      return propertyWithWGRooms.developer_wg_room_pricing.map((room, index) => ({
        roomName: room.room,
        roomSize: room.size,
        roomNumber: index + 1,
        isOccupied: false,
        name: '',
        email: '',
        phone: '',
        moveInDate: format(new Date(), 'yyyy-MM-dd'),
        monthlyRent: room.price,
        deposit: room.price * 3,
        contractStartDate: format(new Date(), 'yyyy-MM-dd'),
        contractEndDate: '',
        sepaMandate: false
      }));
    }

    // Otherwise, create default rooms based on property.rooms count
    const roomCount = property.rooms || 3; // Default to 3 if no room count
    const estimatedRent = property.monthly_rent ? Math.floor(property.monthly_rent / roomCount) : 500;

    return Array.from({ length: roomCount }, (_, index) => ({
      roomName: `Room ${index + 1}`,
      roomSize: Math.floor(property.size_sqm ? property.size_sqm / roomCount : 15),
      roomNumber: index + 1,
      isOccupied: false,
      name: '',
      email: '',
      phone: '',
      moveInDate: format(new Date(), 'yyyy-MM-dd'),
      monthlyRent: estimatedRent,
      deposit: estimatedRent * 3,
      contractStartDate: format(new Date(), 'yyyy-MM-dd'),
      contractEndDate: '',
      sepaMandate: false
    }));
  };

  const [roomTenants, setRoomTenants] = useState<RoomTenantInfo[]>(initializeRoomTenants());

  // Initialize tenant information for standard rental
  const initializeTenantInfo = (): TenantInfo => {
    const defaultInfo = {
      name: '',
      email: '',
      phone: '',
      moveInDate: format(new Date(), 'yyyy-MM-dd'),
      monthlyRent: property.monthly_rent || 0,
      deposit: (property.monthly_rent || 0) * 3,
      contractStartDate: format(new Date(), 'yyyy-MM-dd'),
      contractEndDate: '',
      sepaMandate: false
    };

    if (propertyWithWGRooms.developer_tenant_info) {
      const tenant = propertyWithWGRooms.developer_tenant_info;
      return {
        name: tenant.name || '',
        email: tenant.email || '',
        phone: tenant.phone || '',
        moveInDate: tenant.move_in_date || defaultInfo.moveInDate,
        monthlyRent: tenant.monthly_rent || defaultInfo.monthlyRent,
        deposit: tenant.deposit || defaultInfo.deposit,
        contractStartDate: tenant.contract_start || defaultInfo.contractStartDate,
        contractEndDate: tenant.contract_end || '',
        sepaMandate: tenant.sepa_mandate || false
      };
    }

    return defaultInfo;
  };

  const [tenantInfo, setTenantInfo] = useState<TenantInfo>(initializeTenantInfo());

  const handleMeterReadingChange = (id: string, field: string, value: string) => {
    setMeterReadings(prev => prev.map(reading =>
      reading.id === id ? { ...reading, [field]: value } : reading
    ));
  };

  const handlePhotoUpload = (id: string, file: File) => {
    const photoUrl = URL.createObjectURL(file);
    setMeterReadings(prev => prev.map(reading =>
      reading.id === id ? { ...reading, photo: file, photoUrl } : reading
    ));
  };

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const calculateNebenkosten = () => {
    const totalActual = Object.values(nebenkostenData.actualCosts).reduce((a, b) => a + b, 0);
    const difference = nebenkostenData.prepaidAmount - totalActual;
    return { totalActual, difference };
  };

  const getCompletionProgress = () => {
    const requiredItems = checklist.filter(item => item.required);
    const checkedRequired = requiredItems.filter(item => item.checked);
    return Math.round((checkedRequired.length / requiredItems.length) * 100);
  };

  const getMeterIcon = (type: string) => {
    switch (type) {
      case 'electricity': return <Zap className="h-4 w-4" />;
      case 'gas': return <Flame className="h-4 w-4" />;
      case 'water': return <Droplets className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const generateHandoverProtocol = () => {
    console.log('Generating handover protocol PDF...');
    // In a real app, this would generate a PDF
  };

  const generateRentalContract = (tenant: TenantInfo, roomInfo?: { roomName: string; roomSize?: number }) => {
    // Generate rental contract with tenant data
    const contractData = {
      landlord: {
        name: 'Property Management GmbH',
        address: `${property.project?.street} ${property.project?.house_number}`,
        city: `${property.project?.zip_code} ${property.project?.city}`
      },
      tenant: tenant,
      property: {
        address: `${property.project?.street} ${property.project?.house_number} - ${property.unit_number}${roomInfo ? ` - ${roomInfo.roomName}` : ''}`,
        size: roomInfo ? roomInfo.roomSize : property.size_sqm,
        rooms: roomInfo ? 1 : property.rooms,
        floor: property.floor
      },
      terms: {
        monthlyRent: tenant.monthlyRent,
        deposit: tenant.deposit,
        startDate: tenant.contractStartDate,
        endDate: tenant.contractEndDate || 'Unbefristet'
      }
    };

    return contractData;
  };

  const generateSEPAMandate = (tenant: TenantInfo) => {
    const mandateData = {
      creditor: {
        name: 'Property Management GmbH',
        creditorId: 'DE98ZZZ09999999999'
      },
      debtor: {
        name: tenant.name,
        email: tenant.email
      },
      mandate: {
        reference: `SEPA-${property.unit_number}-${Date.now()}`,
        date: format(new Date(), 'dd.MM.yyyy'),
        amount: tenant.monthlyRent
      }
    };

    return mandateData;
  };

  const updateRoomTenant = (roomIndex: number, field: keyof RoomTenantInfo, value: string | number | Date | boolean | null) => {
    setRoomTenants(prev => prev.map((tenant, idx) =>
      idx === roomIndex ? { ...tenant, [field]: value } : tenant
    ));
  };

  const getOccupiedRoomsCount = () => {
    return roomTenants.filter(t => t.name && t.name.trim() !== '').length;
  };

  const getTotalMonthlyRent = () => {
    return roomTenants.filter(t => t.name && t.name.trim() !== '').reduce((sum, t) => sum + t.monthlyRent, 0);
  };

  const addRoom = () => {
    const newRoomNumber = roomTenants.length + 1;
    const estimatedRent = property.monthly_rent ? Math.floor(property.monthly_rent / (roomTenants.length + 1)) : 500;

    setRoomTenants(prev => [...prev, {
      roomName: `Room ${newRoomNumber}`,
      roomSize: 15,
      roomNumber: newRoomNumber,
      isOccupied: false,
      name: '',
      email: '',
      phone: '',
      moveInDate: format(new Date(), 'yyyy-MM-dd'),
      monthlyRent: estimatedRent,
      deposit: estimatedRent * 3,
      contractStartDate: format(new Date(), 'yyyy-MM-dd'),
      contractEndDate: '',
      sepaMandate: false
    }]);
  };

  const removeRoom = (index: number) => {
    setRoomTenants(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header with completion status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('handover.title')}</h2>
          <p className="text-muted-foreground">
            {property.unit_number} - {property.project?.street} {property.project?.house_number}
          </p>
        </div>
        <div className="text-right">
          <Badge variant="default" className={handoverComplete ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
            {handoverComplete ? t('handover.handoverComplete') : t('handover.inProgress')}
          </Badge>
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">{t('handover.completion')}: {getCompletionProgress()}%</span>
            <Progress value={getCompletionProgress()} className="w-32 mt-1" />
          </div>
        </div>
      </div>

      {/* Rental Type Indicator for WG */}
      {isWG && (
        <Alert>
          <Home className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>{t('handover.wgPropertyWithRooms', { count: roomTenants.length })}</span>
              <span className="font-semibold">
                {t('handover.roomsOccupied', { occupied: getOccupiedRoomsCount(), total: roomTenants.length })} •
                {t('handover.totalRent')}: {t('handover.perMonth', { amount: getTotalMonthlyRent() })}
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="meters">{t('handover.tabs.meterReadings')}</TabsTrigger>
          <TabsTrigger value="checklist">{t('handover.tabs.checklist')}</TabsTrigger>
          <TabsTrigger value="nebenkosten">{t('handover.tabs.nebenkosten')}</TabsTrigger>
          <TabsTrigger value="tenant">
            {isWG ? t('handover.tabs.roomTenants') : t('handover.tabs.tenantInfo')}
          </TabsTrigger>
          <TabsTrigger value="documents">{t('handover.tabs.documents')}</TabsTrigger>
        </TabsList>

        <TabsContent value="meters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('handover.meterReadings.title')}</CardTitle>
              <CardDescription>
                {t('handover.meterReadings.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {meterReadings.map((reading) => (
                <div key={reading.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getMeterIcon(reading.type)}
                      <span className="font-medium capitalize">{reading.type}</span>
                    </div>
                    <Badge variant="outline">{reading.meterNumber}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>{t('handover.meterReadings.previousReading')}</Label>
                      <Input
                        value={reading.previousReading}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label>{t('handover.meterReadings.currentReading')}</Label>
                      <Input
                        value={reading.currentReading}
                        onChange={(e) => handleMeterReadingChange(reading.id, 'currentReading', e.target.value)}
                        placeholder={t('handover.meterReadings.enterReading')}
                      />
                    </div>
                    <div>
                      <Label>{t('handover.meterReadings.unit')}</Label>
                      <Input value={reading.unit} disabled />
                    </div>
                    <div>
                      <Label>{t('handover.meterReadings.photoEvidence')}</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById(`photo-${reading.id}`)?.click()}
                        >
                          <Camera className="h-4 w-4 mr-1" />
                          {t('handover.meterReadings.upload')}
                        </Button>
                        <input
                          id={`photo-${reading.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(reading.id, file);
                          }}
                        />
                        {reading.photoUrl && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('handover.meterReadings.photoAttached')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('handover.checklist.title')}</CardTitle>
              <CardDescription>
                {t('handover.checklist.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {['Keys', 'Documents', 'Condition', 'Payment'].map(category => {
                  const categoryItems = checklist.filter(item => item.category === category);
                  const checkedCount = categoryItems.filter(item => item.checked).length;

                  return (
                    <div key={category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{category}</h4>
                        <Badge variant="default" className={checkedCount === categoryItems.length ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                          {checkedCount}/{categoryItems.length}
                        </Badge>
                      </div>
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-center space-x-3 ml-4">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => handleChecklistToggle(item.id)}
                          />
                          <label className="text-sm flex-1">
                            {item.item}
                            {item.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {item.checked && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('handover.checklist.requiredItemsNote')}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nebenkosten" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('handover.nebenkosten.title')}</CardTitle>
              <CardDescription>
                {t('handover.nebenkosten.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded">
                  <Label htmlFor="prepaidAmount">{t('handover.nebenkosten.prepaidAmountAnnual')}</Label>
                  <div className="flex items-center gap-1">
                    <span>€</span>
                    <Input
                      id="prepaidAmount"
                      type="number"
                      value={nebenkostenData.prepaidAmount}
                      onChange={(e) => handleNebenkostenChange('prepaidAmount', Number(e.target.value))}
                      className="w-24 text-right"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  {Object.entries(nebenkostenData.actualCosts).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <Label htmlFor={`cost-${key}`} className="capitalize">{key}</Label>
                      <div className="flex items-center gap-1">
                        <span>€</span>
                        <Input
                          id={`cost-${key}`}
                          type="number"
                          value={value}
                          onChange={(e) => handleNebenkostenChange(key, Number(e.target.value))}
                          className="w-24 text-right"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{t('handover.nebenkosten.actualCosts')}</span>
                    <span className="font-semibold">€{calculateNebenkosten().totalActual}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {calculateNebenkosten().difference >= 0 ? t('handover.nebenkosten.refundDue') : t('handover.nebenkosten.additionalPaymentDue')}
                    </span>
                    <Badge variant={calculateNebenkosten().difference >= 0 ? "default" : "destructive"} className={calculateNebenkosten().difference >= 0 ? "bg-green-100 text-green-800" : ""}>
                      €{Math.abs(calculateNebenkosten().difference)}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenant" className="space-y-4">
          {isWG ? (
            // WG Room Management
            <Card>
              <CardHeader>
                <CardTitle>{t('handover.tenant.wgRoomTenants')}</CardTitle>
                <CardDescription>
                  {t('handover.tenant.manageRoomTenants')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Room Button */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addRoom}
                  >
                    <Home className="h-4 w-4 mr-1" />
                    {t('handover.tenant.addRoom')}
                  </Button>
                </div>

                <div className="grid gap-4">
                  {roomTenants.map((roomTenant, index) => (
                    <Card key={index} className={roomTenant.name && roomTenant.name.trim() !== '' ? 'border-green-500' : 'border-orange-500'}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Home className="h-5 w-5" />
                            <div className="flex gap-2 items-center">
                              <Input
                                value={roomTenant.roomName}
                                onChange={(e) => updateRoomTenant(index, 'roomName', e.target.value)}
                                className="w-28 h-8"
                                placeholder={t('handover.tenant.roomNamePlaceholder')}
                              />
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={roomTenant.roomSize}
                                  onChange={(e) => updateRoomTenant(index, 'roomSize', Number(e.target.value))}
                                  className="w-16 h-8"
                                  placeholder={t('handover.tenant.sizePlaceholder')}
                                />
                                <span className="text-sm">m²</span>
                              </div>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm">€{roomTenant.monthlyRent}/month</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className={roomTenant.name && roomTenant.name.trim() !== '' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {roomTenant.name && roomTenant.name.trim() !== '' ? t('handover.tenant.occupied') : t('handover.tenant.vacant')}
                            </Badge>
                            {roomTenants.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeRoom(index)}
                                className="h-8 w-8 p-0"
                              >
                                ✕
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>{t('handover.tenant.tenantName')}</Label>
                                <Input
                                  value={roomTenant.name}
                                  onChange={(e) => updateRoomTenant(index, 'name', e.target.value)}
                                  placeholder={t('handover.tenant.enterTenantName')}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.email')}</Label>
                                <Input
                                  value={roomTenant.email}
                                  onChange={(e) => updateRoomTenant(index, 'email', e.target.value)}
                                  placeholder={t('handover.tenant.emailPlaceholder')}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.phone')}</Label>
                                <Input
                                  value={roomTenant.phone}
                                  onChange={(e) => updateRoomTenant(index, 'phone', e.target.value)}
                                  placeholder={t('handover.tenant.phonePlaceholder')}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.moveInDate')}</Label>
                                <Input
                                  type="date"
                                  value={roomTenant.moveInDate}
                                  onChange={(e) => updateRoomTenant(index, 'moveInDate', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.monthlyRentEuro')}</Label>
                                <Input
                                  type="number"
                                  value={roomTenant.monthlyRent}
                                  onChange={(e) => updateRoomTenant(index, 'monthlyRent', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.depositEuro')}</Label>
                                <Input
                                  type="number"
                                  value={roomTenant.deposit}
                                  onChange={(e) => updateRoomTenant(index, 'deposit', Number(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.contractStart')}</Label>
                                <Input
                                  type="date"
                                  value={roomTenant.contractStartDate}
                                  onChange={(e) => updateRoomTenant(index, 'contractStartDate', e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>{t('handover.tenant.contractEndOptional')}</Label>
                                <Input
                                  type="date"
                                  value={roomTenant.contractEndDate || ''}
                                  onChange={(e) => updateRoomTenant(index, 'contractEndDate', e.target.value)}
                                  placeholder={t('handover.tenant.indefinitePlaceholder')}
                                />
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={roomTenant.sepaMandate}
                                onCheckedChange={(checked) =>
                                  updateRoomTenant(index, 'sepaMandate', !!checked)
                                }
                              />
                              <Label>{t('handover.tenant.sepaSignedLabel')}</Label>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRoomIndex(index);
                                  setShowContractPreview(true);
                                }}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                {t('handover.documents.generateContract')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRoomIndex(index);
                                  setShowSEPAPreview(true);
                                }}
                              >
                                <CreditCard className="h-4 w-4 mr-1" />
                                {t('handover.documents.generateSEPA')}
                              </Button>
                            </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Summary */}
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div>{t('handover.tenant.occupiedRoomsOf', { occupied: getOccupiedRoomsCount(), total: roomTenants.length })}</div>
                      <div>{t('handover.tenant.totalMonthlyRent')}: €{getTotalMonthlyRent()}</div>
                      <div>{t('handover.tenant.vacantRooms')}: {roomTenants.length - getOccupiedRoomsCount()}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            // Standard Single Tenant
            <Card>
              <CardHeader>
                <CardTitle>{t('handover.tenant.title')}</CardTitle>
                <CardDescription>
                  {t('handover.tenant.singleTenantDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('handover.tenant.tenantName')}</Label>
                    <Input
                      value={tenantInfo.name}
                      onChange={(e) => setTenantInfo({...tenantInfo, name: e.target.value})}
                      placeholder={t('handover.tenant.enterTenantName')}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.email')}</Label>
                    <Input
                      value={tenantInfo.email}
                      onChange={(e) => setTenantInfo({...tenantInfo, email: e.target.value})}
                      placeholder={t('handover.tenant.emailPlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.phone')}</Label>
                    <Input
                      value={tenantInfo.phone}
                      onChange={(e) => setTenantInfo({...tenantInfo, phone: e.target.value})}
                      placeholder={t('handover.tenant.phonePlaceholder')}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.moveInDate')}</Label>
                    <Input
                      type="date"
                      value={tenantInfo.moveInDate}
                      onChange={(e) => setTenantInfo({...tenantInfo, moveInDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.monthlyRentEuro')}</Label>
                    <Input
                      type="number"
                      value={tenantInfo.monthlyRent}
                      onChange={(e) => setTenantInfo({...tenantInfo, monthlyRent: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.depositEuro')}</Label>
                    <Input
                      type="number"
                      value={tenantInfo.deposit}
                      onChange={(e) => setTenantInfo({...tenantInfo, deposit: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.contractStart')}</Label>
                    <Input
                      type="date"
                      value={tenantInfo.contractStartDate}
                      onChange={(e) => setTenantInfo({...tenantInfo, contractStartDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>{t('handover.tenant.contractEndOptional')}</Label>
                    <Input
                      type="date"
                      value={tenantInfo.contractEndDate || ''}
                      onChange={(e) => setTenantInfo({...tenantInfo, contractEndDate: e.target.value})}
                      placeholder="Unbefristet"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={tenantInfo.sepaMandate}
                    onCheckedChange={(checked) =>
                      setTenantInfo({...tenantInfo, sepaMandate: !!checked})
                    }
                  />
                  <Label>{t('handover.tenant.sepaSignedLabel')}</Label>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowContractPreview(true)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    {t('handover.documents.generateContract')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSEPAPreview(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    {t('handover.documents.generateSEPAMandate')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('handover.documents.title')}</CardTitle>
              <CardDescription>
                {t('handover.documents.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  className="justify-start"
                  variant="outline"
                  onClick={generateHandoverProtocol}
                >
                  <FileSignature className="h-4 w-4 mr-2" />
                  {t('handover.documents.generateProtocol')}
                  <Badge className="ml-auto">PDF</Badge>
                </Button>

                <Button className="justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('handover.documents.downloadEnergyCertificate')}
                  <Badge className="ml-auto">PDF</Badge>
                </Button>

                <Button className="justify-start" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  {t('handover.documents.printFullPackage')}
                  <Badge className="ml-auto">{t('handover.documents.allDocs')}</Badge>
                </Button>

                <Button className="justify-start" variant="outline">
                  <Send className="h-4 w-4 mr-2" />
                  {t('handover.documents.sendToTenant')}
                  <Badge className="ml-auto">Email</Badge>
                </Button>
              </div>

              <Separator />

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  {t('handover.documents.lastGenerated', { date: format(new Date(), 'dd.MM.yyyy HH:mm') })}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="outline">
          {t('handover.actions.saveDraft')}
        </Button>
        <div className="flex gap-2">
          <Button
            variant="default"
            disabled={getCompletionProgress() < 100}
            onClick={() => setHandoverComplete(true)}
          >
            {t('handover.actions.completeHandover')}
          </Button>
        </div>
      </div>

      {/* Contract Preview Modal */}
      <Dialog open={showContractPreview} onOpenChange={setShowContractPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('handover.documents.contractPreview')}</DialogTitle>
            <DialogDescription>
              {t('handover.documents.contractPreviewDescription')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-6 border rounded">
            {(() => {
              const currentTenant = isWG && selectedRoomIndex !== null
                ? roomTenants[selectedRoomIndex]
                : tenantInfo;
              const roomInfo = isWG && selectedRoomIndex !== null
                ? {
                    roomName: roomTenants[selectedRoomIndex].roomName,
                    roomSize: roomTenants[selectedRoomIndex].roomSize
                  }
                : undefined;
              const contractData = generateRentalContract(currentTenant, roomInfo);

              return (
                <div className="space-y-6 font-mono text-sm">
                  <div className="text-center text-lg font-bold">
                    {t('handover.documents.contractTitle')}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">{t('handover.documents.between')}</h3>
                    <div className="ml-4">
                      <p><strong>{t('handover.documents.landlord')}:</strong></p>
                      <p>{contractData.landlord.name}</p>
                      <p>{contractData.landlord.address}</p>
                      <p>{contractData.landlord.city}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Und / And:</h3>
                    <div className="ml-4">
                      <p><strong>{t('handover.documents.tenant')}:</strong></p>
                      <p>{contractData.tenant.name}</p>
                      <p>{contractData.tenant.email}</p>
                      <p>{contractData.tenant.phone}</p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">§1 Mietobjekt / Rental Object</h3>
                    <p>Der Vermieter vermietet dem Mieter folgende Wohnung:</p>
                    <p>The landlord rents the following apartment to the tenant:</p>
                    <div className="ml-4 mt-2">
                      <p><strong>Adresse / Address:</strong> {contractData.property.address}</p>
                      <p><strong>Größe / Size:</strong> {contractData.property.size} m²</p>
                      <p><strong>Zimmer / Rooms:</strong> {contractData.property.rooms}</p>
                      <p><strong>Etage / Floor:</strong> {contractData.property.floor}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">§2 Mietzeit / Rental Period</h3>
                    <p>Das Mietverhältnis beginnt am {contractData.terms.startDate}.</p>
                    <p>The rental period begins on {contractData.terms.startDate}.</p>
                    {contractData.terms.endDate === 'Unbefristet' ? (
                      <p>Das Mietverhältnis wird auf unbestimmte Zeit geschlossen.</p>
                    ) : (
                      <p>Das Mietverhältnis endet am {contractData.terms.endDate}.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">§3 Miete / Rent</h3>
                    <p>Die monatliche Kaltmiete beträgt: <strong>€{contractData.terms.monthlyRent}</strong></p>
                    <p>The monthly base rent amounts to: <strong>€{contractData.terms.monthlyRent}</strong></p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">§4 Kaution / Deposit</h3>
                    <p>Der Mieter zahlt eine Kaution in Höhe von: <strong>€{contractData.terms.deposit}</strong></p>
                    <p>The tenant pays a deposit amounting to: <strong>€{contractData.terms.deposit}</strong></p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">§5 Hausordnung / House Rules</h3>
                    <p>Der Mieter verpflichtet sich, die Hausordnung einzuhalten.</p>
                    <p>The tenant agrees to comply with the house rules.</p>
                  </div>

                  <Separator />

                  <div className="mt-8">
                    <p>Munich, {format(new Date(), 'dd.MM.yyyy')}</p>
                    <div className="grid grid-cols-2 gap-8 mt-8">
                      <div>
                        <p>_________________________</p>
                        <p>Vermieter / Landlord</p>
                      </div>
                      <div>
                        <p>_________________________</p>
                        <p>Mieter / Tenant</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowContractPreview(false)}>
              {t('common.close')}
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-1" />
              {t('handover.documents.printContract')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEPA Mandate Preview Modal */}
      <Dialog open={showSEPAPreview} onOpenChange={setShowSEPAPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{t('handover.sepa.title')}</DialogTitle>
            <DialogDescription>
              {t('handover.sepa.reviewDescription')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-6 border rounded">
            {(() => {
              const currentTenant = isWG && selectedRoomIndex !== null
                ? roomTenants[selectedRoomIndex]
                : tenantInfo;
              const mandateData = generateSEPAMandate(currentTenant);

              return (
                <div className="space-y-6 font-mono text-sm">
                  <div className="text-center text-lg font-bold">
                    SEPA-LASTSCHRIFTMANDAT / SEPA DIRECT DEBIT MANDATE
                  </div>

                  <div className="p-4 border rounded">
                    <p><strong>Gläubiger-Identifikationsnummer / Creditor Identifier:</strong></p>
                    <p>{mandateData.creditor.creditorId}</p>
                  </div>

                  <div className="p-4 border rounded">
                    <p><strong>Mandatsreferenz / Mandate Reference:</strong></p>
                    <p>{mandateData.mandate.reference}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-2">Zahlungsempfänger / Creditor:</h3>
                    <p>{mandateData.creditor.name}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Zahlungspflichtiger / Debtor:</h3>
                    <p>{mandateData.debtor.name}</p>
                    <p>{mandateData.debtor.email}</p>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <p className="text-justify">
                      <strong>SEPA-Lastschriftmandat:</strong><br/>
                      Ich ermächtige den Zahlungsempfänger, Zahlungen von meinem Konto mittels Lastschrift einzuziehen.
                      Zugleich weise ich mein Kreditinstitut an, die vom Zahlungsempfänger auf mein Konto gezogenen
                      Lastschriften einzulösen.
                    </p>

                    <p className="text-justify">
                      <strong>SEPA Direct Debit Mandate:</strong><br/>
                      I authorize the creditor to collect payments from my account by direct debit.
                      At the same time, I instruct my bank to honor the direct debits drawn on my account by the creditor.
                    </p>

                    <p className="text-justify">
                      <strong>Hinweis:</strong> Ich kann innerhalb von acht Wochen, beginnend mit dem Belastungsdatum,
                      die Erstattung des belasteten Betrages verlangen.
                    </p>

                    <p className="text-justify">
                      <strong>Note:</strong> I can demand a refund of the debited amount within eight weeks,
                      starting from the debit date.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded">
                    <p><strong>Monatlicher Betrag / Monthly Amount:</strong> €{mandateData.mandate.amount}</p>
                    <p><strong>Fälligkeit / Due Date:</strong> Monatlich zum 3. Werktag / Monthly on the 3rd business day</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p><strong>IBAN:</strong> _________________________________</p>
                    </div>
                    <div>
                      <p><strong>BIC:</strong> _________________________________</p>
                    </div>
                    <div>
                      <p><strong>Bank:</strong> _________________________________</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="mt-8">
                    <p>Munich, {mandateData.mandate.date}</p>
                    <div className="mt-8">
                      <p>_________________________________</p>
                      <p>Unterschrift Zahlungspflichtiger / Signature of Debtor</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowSEPAPreview(false)}>
              {t('common.close')}
            </Button>
            <Button>
              <Printer className="h-4 w-4 mr-1" />
              {t('handover.sepa.printMandate')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}