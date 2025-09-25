"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConstructionDescription } from './pre-check/construction-description';
import { FurnitureCalculator } from './pre-check/furniture-calculator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Camera,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Upload,
  Eye,
  Download,
  Plus,
  Edit,
  Trash2,
  Users,
  HardHat,
  Wrench,
  PaintBucket,
  Zap,
  Droplets,
  Home,
  Sofa,
  Building,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  MapPin,
  Phone,
  Mail,
  Euro,
  CalendarDays,
  Lock,
  Unlock,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays, addDays } from 'date-fns';

interface Milestone {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  photos: Array<{
    id: string;
    url: string;
    caption: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  notes?: string;
  trades: string[];
  cost?: number;
  delayDays?: number;
  blockers?: string[];
}

interface TradeContractor {
  id: string;
  name: string;
  trade: string;
  tradeIcon: React.ReactNode;
  contact: {
    phone: string;
    email: string;
  };
  status: 'scheduled' | 'on-site' | 'completed';
  assignedMilestones: string[];
  rating?: number;
  cost?: number;
}

interface ConstructionTrackingProps {
  propertyId: string;
  currentPhase: number;
  salesPartner?: string;
  onVisibilityToggle?: (visible: boolean) => void;
}

export function ConstructionTracking({
  propertyId,
  currentPhase,
  salesPartner = 'blackvesto',
  onVisibilityToggle
}: ConstructionTrackingProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [showMilestoneDetail, setShowMilestoneDetail] = useState(false);
  const [isVisibleToPartner, setIsVisibleToPartner] = useState(currentPhase >= 8); // AFTERSALE status
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [constructionStarted, setConstructionStarted] = useState(false);
  const [showMilestoneSelector, setShowMilestoneSelector] = useState(false);
  const [showContractorSelector, setShowContractorSelector] = useState(false);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>([]);
  const [selectedContractors, setSelectedContractors] = useState<string[]>([]);
  const [milestoneCollapsed, setMilestoneCollapsed] = useState(false);
  const contractorSectionRef = useRef<HTMLDivElement>(null);

  // Construction planning state
  const [constructionDescription, setConstructionDescription] = useState('');
  const [furnishingBudget, setFurnishingBudget] = useState(0);

  // Predefined milestone templates
  const MILESTONE_TEMPLATES = [
    { id: 'demo', name: t('properties.demolitionPreparation'), duration: 7, trades: ['demolition'], description: t('properties.demolitionPreparationDesc') },
    { id: 'electric', name: t('properties.electricalPlumbing'), duration: 14, trades: ['electrical', 'plumbing'], description: t('properties.electricalPlumbingDesc') },
    { id: 'bathroom', name: t('properties.bathroomRenovation'), duration: 14, trades: ['plumbing', 'tiling'], description: t('properties.bathroomRenovationDesc') },
    { id: 'kitchen', name: t('properties.kitchenInstallation'), duration: 14, trades: ['carpentry', 'electrical', 'plumbing'], description: t('properties.kitchenInstallationDesc') },
    { id: 'walls', name: t('properties.wallRepairsInsulation'), duration: 7, trades: ['construction'], description: t('properties.wallRepairsInsulationDesc') },
    { id: 'windows', name: t('properties.windowReplacement'), duration: 5, trades: ['construction'], description: t('properties.windowReplacementDesc') },
    { id: 'painting', name: t('properties.paintingDecoration'), duration: 10, trades: ['painting'], description: t('properties.paintingDecorationDesc') },
    { id: 'flooring', name: t('properties.flooringInstallation'), duration: 7, trades: ['flooring'], description: t('properties.flooringInstallationDesc') },
    { id: 'heating', name: t('properties.heatingSystem'), duration: 5, trades: ['plumbing', 'electrical'], description: t('properties.heatingSystemDesc') },
    { id: 'furnishing', name: t('properties.furnishingStaging'), duration: 5, trades: ['furnishing'], description: t('properties.furnishingStagingDesc') },
    { id: 'exterior', name: t('properties.exteriorWork'), duration: 10, trades: ['construction', 'painting'], description: t('properties.exteriorWorkDesc') },
    { id: 'final', name: t('properties.finalTouchesCleaning'), duration: 3, trades: ['cleaning'], description: t('properties.finalTouchesCleaningDesc') }
  ];

  // Available contractors
  const AVAILABLE_CONTRACTORS = [
    { id: 'c1', name: 'Schmidt Elektro GmbH', trade: 'Electrical', rating: 4.8, hourlyRate: 65 },
    { id: 'c2', name: 'Müller Sanitär', trade: 'Plumbing', rating: 4.5, hourlyRate: 70 },
    { id: 'c3', name: 'Bau-Team Berlin', trade: 'General Construction', rating: 4.7, hourlyRate: 55 },
    { id: 'c4', name: 'Malermeister Weber', trade: 'Painting', rating: 4.9, hourlyRate: 45 },
    { id: 'c5', name: 'Parkett Profi', trade: 'Flooring', rating: 4.6, hourlyRate: 50 },
    { id: 'c6', name: 'Fliesen König', trade: 'Tiling', rating: 4.7, hourlyRate: 60 },
    { id: 'c7', name: 'Küchen Studio Berlin', trade: 'Carpentry', rating: 4.8, hourlyRate: 55 },
    { id: 'c8', name: 'Abbruch Express', trade: 'Demolition', rating: 4.4, hourlyRate: 50 },
    { id: 'c9', name: 'Möbel Montage Service', trade: 'Furnishing', rating: 4.5, hourlyRate: 40 },
    { id: 'c10', name: 'CleanPro Berlin', trade: 'Cleaning', rating: 4.9, hourlyRate: 35 }
  ];

  // Mock milestones data (only shown when construction is started)
  const milestones: Milestone[] = constructionStarted ? [
    {
      id: '1',
      name: 'Demolition & Preparation',
      description: 'Remove old fixtures, prepare surfaces for renovation',
      startDate: '2024-01-01',
      endDate: '2024-01-07',
      actualEndDate: '2024-01-08',
      progress: 100,
      status: 'completed',
      photos: [
        { id: '1', url: '/demo1.jpg', caption: 'Before demolition', uploadedAt: '2024-01-01', uploadedBy: 'Site Manager' },
        { id: '2', url: '/demo2.jpg', caption: 'After demolition', uploadedAt: '2024-01-08', uploadedBy: 'Site Manager' }
      ],
      trades: ['demolition'],
      cost: 5000,
      delayDays: 1
    },
    {
      id: '2',
      name: 'Electrical & Plumbing',
      description: 'Update electrical wiring and plumbing systems',
      startDate: '2024-01-08',
      endDate: '2024-01-21',
      progress: 75,
      status: 'in-progress',
      photos: [
        { id: '3', url: '/electrical1.jpg', caption: 'New wiring installation', uploadedAt: '2024-01-15', uploadedBy: 'Electrician' }
      ],
      trades: ['electrical', 'plumbing'],
      cost: 12000,
      notes: 'Waiting for special order switches to arrive'
    },
    {
      id: '3',
      name: 'Bathroom Renovation',
      description: 'Complete bathroom remodel with new fixtures',
      startDate: '2024-01-22',
      endDate: '2024-02-05',
      progress: 40,
      status: 'delayed',
      photos: [],
      trades: ['plumbing', 'tiling'],
      cost: 8000,
      delayDays: 5,
      blockers: ['Tiles on backorder', 'Plumber availability issue']
    },
    {
      id: '4',
      name: 'Kitchen Installation',
      description: 'Install new kitchen cabinets and appliances',
      startDate: '2024-02-06',
      endDate: '2024-02-20',
      progress: 0,
      status: 'not-started',
      photos: [],
      trades: ['carpentry', 'electrical', 'plumbing'],
      cost: 15000
    },
    {
      id: '5',
      name: 'Painting & Flooring',
      description: 'Paint all walls and install new flooring',
      startDate: '2024-02-21',
      endDate: '2024-03-05',
      progress: 0,
      status: 'not-started',
      photos: [],
      trades: ['painting', 'flooring'],
      cost: 10000
    },
    {
      id: '6',
      name: 'Furnishing & Final Touches',
      description: 'Furnish property and complete final details',
      startDate: '2024-03-06',
      endDate: '2024-03-15',
      progress: 0,
      status: 'not-started',
      photos: [],
      trades: ['furnishing'],
      cost: 12000
    }
  ] : [];

  // Mock trade contractors
  const tradeContractors: TradeContractor[] = [
    {
      id: '1',
      name: 'Schmidt Elektro GmbH',
      trade: 'Electrical',
      tradeIcon: Zap,
      contact: { phone: '+49 123 456789', email: 'info@schmidt-elektro.de' },
      status: 'on-site',
      assignedMilestones: ['2', '4'],
      rating: 4.8,
      cost: 8500
    },
    {
      id: '2',
      name: 'Müller Sanitär',
      trade: 'Plumbing',
      tradeIcon: Droplets,
      contact: { phone: '+49 123 456788', email: 'kontakt@mueller-sanitaer.de' },
      status: 'on-site',
      assignedMilestones: ['2', '3', '4'],
      rating: 4.5,
      cost: 9000
    },
    {
      id: '3',
      name: 'Bau-Team Berlin',
      trade: 'General Construction',
      tradeIcon: HardHat,
      contact: { phone: '+49 123 456787', email: 'info@bauteam-berlin.de' },
      status: 'completed',
      assignedMilestones: ['1'],
      rating: 4.7,
      cost: 5000
    },
    {
      id: '4',
      name: 'Malermeister Weber',
      trade: 'Painting',
      tradeIcon: PaintBucket,
      contact: { phone: '+49 123 456786', email: 'weber@maler-berlin.de' },
      status: 'scheduled',
      assignedMilestones: ['5'],
      rating: 4.9,
      cost: 4500
    },
    {
      id: '5',
      name: 'Parkett Profi',
      trade: 'Flooring',
      tradeIcon: Home,
      contact: { phone: '+49 123 456785', email: 'info@parkett-profi.de' },
      status: 'scheduled',
      assignedMilestones: ['5'],
      rating: 4.6,
      cost: 5500
    }
  ];

  // Calculate overall progress
  const totalProgress = Math.round(
    milestones.reduce((acc, m) => acc + m.progress, 0) / milestones.length
  );

  // Calculate delays
  const delayedMilestones = milestones.filter(m => m.status === 'delayed');
  const maxDelay = Math.max(...milestones.map(m => m.delayDays || 0));

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get trade icon
  const getTradeIcon = (trade: string) => {
    switch (trade.toLowerCase()) {
      case 'electrical':
        return Zap;
      case 'plumbing':
        return Droplets;
      case 'painting':
        return PaintBucket;
      case 'carpentry':
        return Wrench;
      case 'flooring':
        return Home;
      case 'furnishing':
        return Sofa;
      default:
        return HardHat;
    }
  };

  const handleVisibilityToggle = () => {
    const newVisibility = !isVisibleToPartner;
    setIsVisibleToPartner(newVisibility);
    onVisibilityToggle?.(newVisibility);
  };

  // Milestone Detail Modal Component
  const MilestoneDetailModal = ({ milestone }: { milestone: Milestone }) => {
    const [notes, setNotes] = useState(milestone.notes || '');
    const [blockers, setBlockers] = useState(milestone.blockers || []);
    const [newBlocker, setNewBlocker] = useState('');
    const [photos, setPhotos] = useState(milestone.photos || []);
    const [activeTab, setActiveTab] = useState('overview');

    const handleAddBlocker = () => {
      if (newBlocker.trim()) {
        setBlockers([...blockers, newBlocker.trim()]);
        setNewBlocker('');
      }
    };

    const handleRemoveBlocker = (index: number) => {
      setBlockers(blockers.filter((_, i) => i !== index));
    };

    const handleSave = () => {
      // In a real app, this would save to backend
      console.log('Saving milestone details:', {
        id: milestone.id,
        notes,
        blockers,
        photos
      });
      setShowMilestoneDetail(false);
    };

    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{milestone.name}</h2>
                <p className="text-gray-600 mt-1">{milestone.description}</p>
                <div className="flex items-center gap-4 mt-3">
                  <Badge className={cn(getStatusColor(milestone.status))}>
                    {milestone.status === 'delayed' && milestone.delayDays && `${milestone.delayDays}d late`}
                    {milestone.status === 'in-progress' && `${milestone.progress}%`}
                    {milestone.status === 'completed' && t('properties.completed')}
                    {milestone.status === 'not-started' && t('properties.notStarted')}
                  </Badge>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {milestone.startDate} - {milestone.endDate}
                  </span>
                  {milestone.cost && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {milestone.cost.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowMilestoneDetail(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
                <TabsTrigger value="photos">
                  {t('properties.photos')} ({photos.length})
                </TabsTrigger>
                <TabsTrigger value="notes">{t('properties.notes')}</TabsTrigger>
                <TabsTrigger value="blockers">
                  {t('properties.blockers')} ({blockers.length})
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">{t('properties.progress')}</h3>
                  <Progress value={milestone.progress} className="h-3 mb-2" />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{milestone.progress}% {t('properties.complete')}</span>
                    <span>{100 - milestone.progress}% {t('properties.remaining')}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">{t('properties.assignedTrades')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {milestone.trades.map(trade => {
                      const Icon = getTradeIcon(trade);
                      return (
                        <Badge key={trade} variant="outline">
                          <Icon className="h-3 w-3 mr-1" />
                          {trade}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {milestone.actualEndDate && (
                  <div>
                    <h3 className="font-medium mb-3">Timeline</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Planned End:</span>
                        <span>{milestone.endDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Actual End:</span>
                        <span className={milestone.delayDays && milestone.delayDays > 0 ? "text-red-600" : "text-green-600"}>
                          {milestone.actualEndDate}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos" className="p-6">
                <div className="space-y-4">
                  {/* Upload Zone */}
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="font-medium mb-1">Upload Progress Photos</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Document the progress of this milestone
                    </p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>

                  {/* Photo Grid */}
                  {photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map(photo => (
                        <div key={photo.id} className="group relative">
                          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-gray-400" />
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm mt-2">{photo.caption}</p>
                          <p className="text-xs text-gray-500">
                            {photo.uploadedBy} • {photo.uploadedAt}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="p-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes" className="mb-2 block">
                      Milestone Notes
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any important notes about this milestone..."
                      rows={6}
                      className="w-full"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </TabsContent>

              {/* Blockers Tab */}
              <TabsContent value="blockers" className="p-6">
                <div className="space-y-4">
                  {/* Add Blocker */}
                  <div className="flex gap-2">
                    <Input
                      value={newBlocker}
                      onChange={(e) => setNewBlocker(e.target.value)}
                      placeholder="Add a new blocker or issue..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddBlocker()}
                    />
                    <Button onClick={handleAddBlocker}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {/* Blockers List */}
                  {blockers.length > 0 ? (
                    <div className="space-y-2">
                      {blockers.map((blocker, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <span className="text-sm">{blocker}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveBlocker(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p>No blockers for this milestone</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setShowMilestoneDetail(false)}>
                Cancel
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {milestone.status === 'not-started' && (
                <Button variant="outline">
                  Start Milestone
                </Button>
              )}
              {milestone.status === 'in-progress' && (
                <Button variant="outline">
                  Mark Complete
                </Button>
              )}
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Photo Gallery Component
  const PhotoGallery = () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Construction Photos</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowPhotoGallery(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[70vh] p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {milestones.flatMap(m => 
              m.photos.map(photo => (
                <div key={photo.id} className="group relative cursor-pointer" onClick={() => setSelectedPhoto(photo)}>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-sm mt-2">{photo.caption}</p>
                  <p className="text-xs text-gray-500">{photo.uploadedAt}</p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  // Handle starting construction
  const handleStartConstruction = () => {
    setShowMilestoneSelector(true);
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    setSelectedMilestones(prev => 
      prev.includes(milestoneId) 
        ? prev.filter(id => id !== milestoneId)
        : [...prev, milestoneId]
    );
  };

  const handleContractorToggle = (contractorId: string) => {
    setSelectedContractors(prev => 
      prev.includes(contractorId) 
        ? prev.filter(id => id !== contractorId)
        : [...prev, contractorId]
    );
  };

  const handleConfirmConstruction = () => {
    setConstructionStarted(true);
    setShowMilestoneSelector(false);
    setShowContractorSelector(false);
    // In a real app, this would save the selected milestones and contractors
    console.log('Starting construction with:', {
      milestones: selectedMilestones,
      contractors: selectedContractors
    });
  };

  // If construction hasn't started, show start button
  if (!constructionStarted) {
    return (
      <div className="space-y-6">
        {/* Not Started State */}
        <Card className="border-dashed">
          <CardContent className="py-12">
            <div className="text-center">
              <HardHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('properties.constructionNotStarted')}</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {t('properties.beginPlanningRenovation')}
              </p>
              <Button size="lg" onClick={handleStartConstruction}>
                <Plus className="h-5 w-5 mr-2" />
                {t('properties.startConstructionPlanning')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Milestone Selection Dialog */}
        {showMilestoneSelector && (
          <Card>
            <Accordion 
              type="single" 
              collapsible 
              value={milestoneCollapsed ? "" : "milestones"}
              onValueChange={(value) => setMilestoneCollapsed(!value)}
            >
              <AccordionItem value="milestones" className="border-0">
                <AccordionTrigger className="hover:no-underline px-6 py-4">
                  <div className="flex items-center justify-between flex-1 mr-2">
                    <div className="text-left">
                      <div className="font-semibold text-base">{t('properties.selectMilestones')}</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        {milestoneCollapsed
                          ? t('properties.milestonesSelected', { count: selectedMilestones.length })
                          : t('properties.selectMilestonesDesc')
                        }
                      </div>
                    </div>
                    {selectedMilestones.length > 0 && !milestoneCollapsed && (
                      <div 
                        className="ml-4 px-3 py-1 text-sm border rounded-md hover:bg-gray-50 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowContractorSelector(true);
                          setMilestoneCollapsed(true);
                          // Smooth scroll to contractor section after accordion closes
                          setTimeout(() => {
                            contractorSectionRef.current?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                              inline: 'nearest'
                            });
                          }, 300);
                        }}>
                        {t('properties.nextAssignContractors')}
                        <ChevronRight className="h-4 w-4 ml-1 inline" />
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {MILESTONE_TEMPLATES.map(template => {
                  const isSelected = selectedMilestones.includes(template.id);
                  return (
                    <div
                      key={template.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        isSelected ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
                      )}
                      onClick={() => handleMilestoneToggle(template.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium flex items-center gap-2">
                            <div className={cn(
                              "h-5 w-5 rounded border-2",
                              isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                            )}>
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            {template.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.duration} days
                            </span>
                            <span className="flex items-center gap-1">
                              <Wrench className="h-3 w-3" />
                              {template.trades.join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedMilestones.length > 0 && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Selected Milestones: {selectedMilestones.length}</p>
                      <p className="text-sm text-gray-600">
                        Estimated Duration: {
                          MILESTONE_TEMPLATES
                            .filter(m => selectedMilestones.includes(m.id))
                            .reduce((acc, m) => acc + m.duration, 0)
                        } days
                      </p>
                    </div>
                  </div>
                </>
              )}
                  </CardContent>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        )}

        {/* Contractor Selection Dialog */}
        {showContractorSelector && (
          <Card ref={contractorSectionRef}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('properties.assignContractors')}</CardTitle>
                  <CardDescription>
                    {t('properties.selectContractorsForProject')}
                  </CardDescription>
                </div>
                {selectedContractors.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContractorSelector(false)}>
                      {t('properties.back')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleConfirmConstruction}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t('properties.startConstruction')}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show required trades based on selected milestones */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('properties.requiredTradesBasedOnMilestones')}: {
                    [...new Set(
                      MILESTONE_TEMPLATES
                        .filter(m => selectedMilestones.includes(m.id))
                        .flatMap(m => m.trades)
                    )].join(', ')
                  }
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_CONTRACTORS.map(contractor => {
                  const isSelected = selectedContractors.includes(contractor.id);
                  const Icon = getTradeIcon(contractor.trade.split(' ')[0].toLowerCase());
                  
                  return (
                    <div
                      key={contractor.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        isSelected ? "border-green-500 bg-green-50" : "hover:border-gray-400"
                      )}
                      onClick={() => handleContractorToggle(contractor.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center",
                          isSelected ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{contractor.name}</h4>
                          <p className="text-sm text-gray-600">{contractor.trade}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            <span className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < Math.floor(contractor.rating) ? "text-yellow-500" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                              <span className="text-gray-500 ml-1">{contractor.rating}</span>
                            </span>
                            <span className="text-gray-500">€{contractor.hourlyRate}/hr</span>
                          </div>
                        </div>
                        <div className={cn(
                          "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                          isSelected ? "bg-green-500 border-green-500" : "border-gray-300"
                        )}>
                          {isSelected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedContractors.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="font-medium">{t('properties.selectedContractorsCount', { count: selectedContractors.length })}</p>
                    <p className="text-sm text-gray-600">
                      {t('properties.readyToBeginConstruction')}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Visibility Control for BlackVesto */}
        {salesPartner === 'blackvesto' && (
          <Card className={cn(
            "border-2",
            isVisibleToPartner ? "border-blue-200 bg-blue-50/50" : "border-gray-200"
          )}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isVisibleToPartner ? (
                    <Unlock className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-600" />
                  )}
                  <CardTitle className="text-sm font-medium">{t('construction.partnerVisibility')}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-600 mb-3">
                {isVisibleToPartner
                  ? "Progress visible to BlackVesto"
                  : "Progress hidden from partners"}
              </p>
              <Button
                size="sm"
                variant={isVisibleToPartner ? "default" : "outline"}
                onClick={handleVisibilityToggle}
                className="w-full"
              >
                {isVisibleToPartner ? "Hide" : "Share"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Construction Delays */}
        <Card className={cn(
          delayedMilestones.length > 0 ? "border-red-200 bg-red-50/50" : ""
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-4 w-4",
                delayedMilestones.length > 0 ? "text-red-600" : "text-gray-400"
              )} />
              <CardTitle className="text-sm font-medium">Construction Delays</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {delayedMilestones.length > 0 ? (
              <>
                <p className="text-2xl font-bold text-red-600">
                  {delayedMilestones.length}
                </p>
                <p className="text-xs text-gray-600">
                  milestone{delayedMilestones.length > 1 ? 's' : ''} delayed
                </p>
                <p className="text-xs text-red-600 font-medium mt-1">
                  Max: {maxDelay} days
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-green-600">0</p>
                <p className="text-xs text-gray-600">On schedule</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Construction Progress */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">Construction Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {totalProgress}%
            </p>
            <Progress value={totalProgress} className="h-2 mt-2 mb-1" />
            <p className="text-xs text-gray-600">
              Overall completion
            </p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={() => setShowPhotoGallery(true)} className="flex-1">
                <Camera className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <FileText className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('construction.overview')}</TabsTrigger>
          <TabsTrigger value="planning">{t('construction.planning')}</TabsTrigger>
          <TabsTrigger value="milestones">{t('construction.milestones')}</TabsTrigger>
          <TabsTrigger value="contractors">{t('construction.contractors')}</TabsTrigger>
          <TabsTrigger value="photos">{t('construction.photos')}</TabsTrigger>
        </TabsList>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6">
          <div className="space-y-6">
            {/* Construction Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('construction.constructionPlanning')}</CardTitle>
                <CardDescription>
                  {t('construction.planYourRenovation')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Construction Description based on selected milestones */}
                <ConstructionDescription
                  selectedTrades={
                    [...new Set(
                      MILESTONE_TEMPLATES
                        .filter(m => selectedMilestones.includes(m.id))
                        .flatMap(m => m.trades)
                    )]
                  }
                  propertyType="single"
                  livingArea={72} // TODO: Get from property data
                  rooms={3} // TODO: Get from property data
                  bathrooms={1}
                  description={constructionDescription}
                  onDescriptionChange={setConstructionDescription}
                />
              </CardContent>
            </Card>

            {/* Furniture Calculator */}
            <FurnitureCalculator
              rooms={3} // TODO: Get from property data
              propertyType="single"
              isWG={false} // TODO: Get from property data
              totalBudget={furnishingBudget}
              onBudgetChange={setFurnishingBudget}
            />
          </div>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('construction.totalBudget')}</CardDescription>
                <CardTitle className="text-2xl">€62,000</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={75} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">€46,500 {t('construction.spent')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('construction.activeTrades')}</CardDescription>
                <CardTitle className="text-2xl">2 {t('construction.of')} 5</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-xs">Electrical</Badge>
                  <Badge variant="outline" className="text-xs">Plumbing</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>{t('construction.daysRemaining')}</CardDescription>
                <CardTitle className="text-2xl">52</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">{t('construction.untilExpectedCompletion')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('construction.currentActivities')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {milestones.filter(m => m.status === 'in-progress').map(milestone => (
                <div key={milestone.id} 
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => {
                    setSelectedMilestone(milestone);
                    setShowMilestoneDetail(true);
                  }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{milestone.name}</p>
                      <p className="text-sm text-gray-600">{milestone.trades.join(', ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-800">{milestone.progress}%</Badge>
                    <p className="text-xs text-gray-500 mt-1">Day {differenceInDays(new Date(), new Date(milestone.startDate))} of {differenceInDays(new Date(milestone.endDate), new Date(milestone.startDate))}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          {milestones.map(milestone => (
            <Card key={milestone.id} className={cn(
              "cursor-pointer hover:shadow-md transition-shadow",
              milestone.status === 'delayed' && "border-red-200"
            )} onClick={() => {
              setSelectedMilestone(milestone);
              setShowMilestoneDetail(true);
            }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      getStatusColor(milestone.status)
                    )}>
                      {milestone.status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : milestone.status === 'delayed' ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : milestone.status === 'in-progress' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{milestone.name}</CardTitle>
                      <CardDescription>{milestone.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {milestone.startDate} - {milestone.endDate}
                        </span>
                        {milestone.cost && (
                          <span className="flex items-center gap-1">
                            <Euro className="h-3 w-3" />
                            {milestone.cost.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={cn(getStatusColor(milestone.status))}>
                      {milestone.status === 'delayed' && milestone.delayDays && `${milestone.delayDays}d late`}
                      {milestone.status === 'in-progress' && `${milestone.progress}%`}
                      {milestone.status === 'completed' && 'Done'}
                      {milestone.status === 'not-started' && 'Pending'}
                    </Badge>
                    <div className="flex gap-1 mt-2">
                      {milestone.photos.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Camera className="h-3 w-3 mr-1" />
                          {milestone.photos.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={milestone.progress} className="h-2 mb-3" />
                
                {milestone.blockers && milestone.blockers.length > 0 && (
                  <Alert className="border-red-200 bg-red-50/50 mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Blockers</AlertTitle>
                    <AlertDescription className="text-xs">
                      <ul className="list-disc list-inside mt-1">
                        {milestone.blockers.map((blocker, i) => (
                          <li key={i}>{blocker}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {milestone.notes && (
                  <p className="text-sm text-gray-600 mt-3 italic">Note: {milestone.notes}</p>
                )}

                <div className="flex flex-wrap gap-1 mt-3">
                  {milestone.trades.map(trade => (
                    <Badge key={trade} variant="outline" className="text-xs">
                      {React.createElement(getTradeIcon(trade), { className: "h-3 w-3 mr-1" })}
                      {trade}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Contractors Tab */}
        <TabsContent value="contractors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tradeContractors.map(contractor => (
              <Card key={contractor.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <contractor.tradeIcon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{contractor.name}</CardTitle>
                        <CardDescription>{contractor.trade}</CardDescription>
                      </div>
                    </div>
                    <Badge className={cn(
                      contractor.status === 'on-site' && "bg-green-100 text-green-800",
                      contractor.status === 'scheduled' && "bg-blue-100 text-blue-800",
                      contractor.status === 'completed' && "bg-gray-100 text-gray-800"
                    )}>
                      {contractor.status === 'on-site' && t('construction.onSiteStatus')}
                      {contractor.status === 'scheduled' && t('construction.scheduledStatus')}
                      {contractor.status === 'completed' && t('construction.completedStatus')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{contractor.contact.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{contractor.contact.email}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned Milestones</p>
                    <div className="flex flex-wrap gap-1">
                      {contractor.assignedMilestones.map(id => {
                        const milestone = milestones.find(m => m.id === id);
                        return milestone ? (
                          <Badge key={id} variant="outline" className="text-xs">
                            {milestone.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={cn(
                          "h-3 w-3",
                          i < Math.floor(contractor.rating || 0) ? "text-yellow-500" : "text-gray-300"
                        )}>★</div>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">{contractor.rating}</span>
                    </div>
                    {contractor.cost && (
                      <span className="text-sm font-medium">€{contractor.cost.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="py-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Add Trade Contractor</p>
                <p className="text-xs text-gray-500 mb-4">Assign new contractors to your project</p>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contractor
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Construction Photos</h3>
              <p className="text-sm text-gray-500">Document progress with photos at each milestone</p>
            </div>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Button>
          </div>

          {milestones.map(milestone => 
            milestone.photos.length > 0 && (
              <Card key={milestone.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{milestone.name}</CardTitle>
                  <CardDescription>
                    {milestone.photos.length} photo{milestone.photos.length > 1 ? 's' : ''} • {milestone.startDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {milestone.photos.map(photo => (
                      <div key={photo.id} className="group relative cursor-pointer">
                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs mt-1 truncate">{photo.caption}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && <PhotoGallery />}
      
      {/* Milestone Detail Modal */}
      {showMilestoneDetail && selectedMilestone && (
        <MilestoneDetailModal milestone={selectedMilestone} />
      )}
    </div>
  );
}