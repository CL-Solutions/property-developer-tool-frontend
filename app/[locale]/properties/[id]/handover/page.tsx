'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
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
  ArrowLeft,
  Users,
  CreditCard,
  CheckCircle2,
  Euro,
  Camera,
  Upload,
  Zap,
  Droplets,
  Flame,
  AlertCircle,
  Download,
  Send,
  ClipboardCheck,
  Clock,
  Printer
} from 'lucide-react';
import { MockDataService } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { format } from 'date-fns';

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

export default function HandoverPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<Property | null>(null);
  const [activeTab, setActiveTab] = useState('meters');
  const [handoverComplete, setHandoverComplete] = useState(false);

  // Meter readings state
  const [meterReadings, setMeterReadings] = useState<MeterReading[]>([
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
      previousReading: '5678',
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
  ]);

  // Nebenkosten state
  const [nebenkostenData, setNebenkostenData] = useState({
    period: { from: '2024-01-01', to: format(new Date(), 'yyyy-MM-dd') },
    prepaidAmount: 2400,
    actualCosts: {
      heating: 0,
      water: 0,
      electricity: 0,
      cleaning: 0,
      insurance: 0,
      propertyTax: 0,
      other: 0
    }
  });

  // Handover checklist
  const [checklist, setChecklist] = useState<HandoverChecklistItem[]>([
    { id: '1', category: 'Keys', item: 'Main entrance key', checked: false, required: true },
    { id: '2', category: 'Keys', item: 'Apartment door key', checked: false, required: true },
    { id: '3', category: 'Keys', item: 'Mailbox key', checked: false, required: true },
    { id: '4', category: 'Keys', item: 'Basement key', checked: false, required: false },
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
  ]);

  // Tenant information
  const [tenantInfo, setTenantInfo] = useState<TenantInfo>({
    name: '',
    email: '',
    phone: '',
    moveInDate: format(new Date(), 'yyyy-MM-dd'),
    monthlyRent: 0,
    deposit: 0,
    contractStartDate: format(new Date(), 'yyyy-MM-dd'),
    contractEndDate: '',
    sepaMandate: false
  });

  const loadProperty = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MockDataService.getProperty(propertyId);
      if (data) {
        setProperty(data);
        // Set rental amount from property data
        setTenantInfo(prev => ({
          ...prev,
          monthlyRent: data.monthly_rent || 0,
          deposit: (data.monthly_rent || 0) * 3
        }));
      }
    } catch (error) {
      console.error('Failed to load property:', error);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

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

  const sendToTenant = () => {
    console.log('Sending documents to tenant...');
    // In a real app, this would send emails
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="animate-pulse">{t('common.loading')}</div>
        </main>
      </SidebarProvider>
    );
  }

  const { totalActual, difference } = calculateNebenkosten();
  const progress = getCompletionProgress();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/properties/${propertyId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('handover.backToProperty')}
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{t('handover.title')}</h1>
                <p className="text-gray-600">
                  {property?.unit_number}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {handoverComplete ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {t('handover.handoverComplete')}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-4 w-4 mr-1" />
                  {t('handover.inProgress')}
                </Badge>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>{t('handover.progress.title')}</CardTitle>
              <CardDescription>
                {t('handover.progress.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('handover.completion')}</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {progress < 100 && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('handover.progress.itemsRemaining', { count: checklist.filter(item => item.required && !item.checked).length })}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="meters">
                <Camera className="h-4 w-4 mr-2" />
                {t('handover.tabs.meterReadings')}
              </TabsTrigger>
              <TabsTrigger value="nebenkosten">
                <Euro className="h-4 w-4 mr-2" />
                {t('handover.tabs.nebenkosten')}
              </TabsTrigger>
              <TabsTrigger value="checklist">
                <ClipboardCheck className="h-4 w-4 mr-2" />
                {t('handover.tabs.checklist')}
              </TabsTrigger>
              <TabsTrigger value="tenant">
                <Users className="h-4 w-4 mr-2" />
                {t('handover.tabs.tenantInfo')}
              </TabsTrigger>
            </TabsList>

            {/* Meter Readings Tab */}
            <TabsContent value="meters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('handover.meterReadings.title')}</CardTitle>
                  <CardDescription>
                    {t('handover.meterReadings.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {meterReadings.map(reading => (
                    <div key={reading.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMeterIcon(reading.type)}
                          <span className="font-medium capitalize">{reading.type}</span>
                          <Badge variant="outline">{reading.meterNumber}</Badge>
                        </div>
                        <span className="text-sm text-gray-500">{t('handover.meterReadings.unit')}: {reading.unit}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`prev-${reading.id}`}>{t('handover.meterReadings.previousReading')}</Label>
                          <Input
                            id={`prev-${reading.id}`}
                            value={reading.previousReading || ''}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`current-${reading.id}`}>{t('handover.meterReadings.currentReading')}</Label>
                          <Input
                            id={`current-${reading.id}`}
                            value={reading.currentReading}
                            onChange={(e) => handleMeterReadingChange(reading.id, 'currentReading', e.target.value)}
                            placeholder={t('handover.meterReadings.enterReading')}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`date-${reading.id}`}>{t('handover.meterReadings.readingDate')}</Label>
                          <Input
                            id={`date-${reading.id}`}
                            type="date"
                            value={reading.readingDate}
                            onChange={(e) => handleMeterReadingChange(reading.id, 'readingDate', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {reading.photoUrl ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                              <Image
                                src={reading.photoUrl!}
                                alt="Meter photo"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              <Camera className="h-3 w-3 mr-1" />
                              {t('handover.meterReadings.photoAttached')}
                            </Badge>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(reading.id, file);
                              }}
                            />
                            <Button variant="outline" size="sm" asChild>
                              <span>
                                <Upload className="h-4 w-4 mr-2" />
                                {t('handover.meterReadings.upload')}
                              </span>
                            </Button>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nebenkosten Tab */}
            <TabsContent value="nebenkosten" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('handover.nebenkosten.title')}</CardTitle>
                  <CardDescription>
                    {t('handover.nebenkosten.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="period-from">{t('handover.nebenkosten.periodFrom')}</Label>
                      <Input
                        id="period-from"
                        type="date"
                        value={nebenkostenData.period.from}
                        onChange={(e) => setNebenkostenData(prev => ({
                          ...prev,
                          period: { ...prev.period, from: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="period-to">{t('handover.nebenkosten.periodTo')}</Label>
                      <Input
                        id="period-to"
                        type="date"
                        value={nebenkostenData.period.to}
                        onChange={(e) => setNebenkostenData(prev => ({
                          ...prev,
                          period: { ...prev.period, to: e.target.value }
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="prepaid">{t('handover.nebenkosten.prepaidAmountAnnual')}</Label>
                    <Input
                      id="prepaid"
                      type="number"
                      value={nebenkostenData.prepaidAmount}
                      onChange={(e) => setNebenkostenData(prev => ({
                        ...prev,
                        prepaidAmount: Number(e.target.value)
                      }))}
                      className="font-medium"
                    />
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">{t('handover.nebenkosten.actualCosts')}</h3>
                    {Object.entries(nebenkostenData.actualCosts).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-2 gap-4 items-center">
                        <Label htmlFor={`cost-${key}`} className="capitalize">
                          {t(`handover.nebenkosten.${key}`)}
                        </Label>
                        <Input
                          id={`cost-${key}`}
                          type="number"
                          value={value}
                          onChange={(e) => setNebenkostenData(prev => ({
                            ...prev,
                            actualCosts: {
                              ...prev.actualCosts,
                              [key]: Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('handover.nebenkosten.actualCosts')}:</span>
                      <span className="font-medium">€{totalActual.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('handover.nebenkosten.prepaidAmount')}:</span>
                      <span className="font-medium">€{nebenkostenData.prepaidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>{difference >= 0 ? t('handover.nebenkosten.refundDue') : t('handover.nebenkosten.additionalPaymentDue')}:</span>
                      <span className={difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                        €{Math.abs(difference).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Checklist Tab */}
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
                            <h3 className="font-medium">{t(`handover.checklist.${category.toLowerCase()}`)}</h3>
                            <Badge variant={checkedCount === categoryItems.length ? 'default' : 'secondary'}>
                              {checkedCount} / {categoryItems.length}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            {categoryItems.map(item => (
                              <div key={item.id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50">
                                <Checkbox
                                  id={`check-${item.id}`}
                                  checked={item.checked}
                                  onCheckedChange={() => handleChecklistToggle(item.id)}
                                />
                                <Label
                                  htmlFor={`check-${item.id}`}
                                  className="flex-1 cursor-pointer"
                                >
                                  {item.item}
                                  {item.required && <span className="text-red-500 ml-1">*</span>}
                                </Label>
                                {item.notes && (
                                  <span className="text-sm text-gray-500">{item.notes}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tenant Info Tab */}
            <TabsContent value="tenant" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('handover.tenant.title')}</CardTitle>
                  <CardDescription>
                    {t('handover.tenant.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tenant-name">{t('handover.tenant.fullName')}</Label>
                      <Input
                        id="tenant-name"
                        value={tenantInfo.name}
                        onChange={(e) => setTenantInfo(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('handover.tenant.enterTenantName')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenant-email">{t('handover.tenant.email')}</Label>
                      <Input
                        id="tenant-email"
                        type="email"
                        value={tenantInfo.email}
                        onChange={(e) => setTenantInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t('handover.tenant.emailPlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tenant-phone">{t('handover.tenant.phone')}</Label>
                      <Input
                        id="tenant-phone"
                        value={tenantInfo.phone}
                        onChange={(e) => setTenantInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t('handover.tenant.phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="move-in-date">{t('handover.tenant.moveInDate')}</Label>
                      <Input
                        id="move-in-date"
                        type="date"
                        value={tenantInfo.moveInDate}
                        onChange={(e) => setTenantInfo(prev => ({ ...prev, moveInDate: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">{t('handover.tenant.contractDetails')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="monthly-rent">{t('handover.tenant.monthlyRent')}</Label>
                        <Input
                          id="monthly-rent"
                          type="number"
                          value={tenantInfo.monthlyRent}
                          onChange={(e) => setTenantInfo(prev => ({ ...prev, monthlyRent: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="deposit">{t('handover.tenant.deposit')}</Label>
                        <Input
                          id="deposit"
                          type="number"
                          value={tenantInfo.deposit}
                          onChange={(e) => setTenantInfo(prev => ({ ...prev, deposit: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contract-start">{t('handover.tenant.contractStart')}</Label>
                        <Input
                          id="contract-start"
                          type="date"
                          value={tenantInfo.contractStartDate}
                          onChange={(e) => setTenantInfo(prev => ({ ...prev, contractStartDate: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contract-end">{t('handover.tenant.contractEndOptional')}</Label>
                        <Input
                          id="contract-end"
                          type="date"
                          value={tenantInfo.contractEndDate}
                          onChange={(e) => setTenantInfo(prev => ({ ...prev, contractEndDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">{t('handover.sepa.title')}</h3>
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <Checkbox
                        id="sepa-mandate"
                        checked={tenantInfo.sepaMandate}
                        onCheckedChange={(checked) => setTenantInfo(prev => ({ ...prev, sepaMandate: !!checked }))}
                      />
                      <Label htmlFor="sepa-mandate" className="flex-1 cursor-pointer">
                        {t('handover.tenant.sepaSignedLabel')}
                      </Label>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={generateHandoverProtocol}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('handover.documents.generateProtocol')}
                  </Button>
                  <Button variant="outline" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-2" />
                    {t('handover.documents.printFullPackage')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={sendToTenant}>
                    <Send className="h-4 w-4 mr-2" />
                    {t('handover.documents.sendToTenant')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (progress === 100) {
                        setHandoverComplete(true);
                      }
                    }}
                    disabled={progress < 100}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    {t('handover.actions.completeHandover')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </SidebarProvider>
  );
}