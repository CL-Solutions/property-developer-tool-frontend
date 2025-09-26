"use client";

import { useState, useRef } from 'react';
import { DocumentPreview } from './document-preview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Eye,
  Plus,
  Building2,
  Home,
  MessageSquare,
  ChevronDown,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/lib/types';

// Project-level documents (shared across all units)
const PROJECT_DOCUMENTS = [
  // Legal Documents
  { name: 'WEG Protocols', key: 'weg_protocols', required: true, phase: 3, description: 'Homeowners association meeting minutes' },
  { name: 'Declaration of Division (Teilungserklärung)', key: 'teilungserklarung', required: true, phase: 3, description: 'Legal property division document' },
  { name: 'Land Registry Extract (Grundbuchauszug)', key: 'grundbuchauszug', required: true, phase: 3, description: 'Official land registry documentation' },
  { name: 'Building Insurance', key: 'building_insurance', required: false, phase: 2, description: 'Building insurance policies' },

  // Technical Documents
  { name: 'Energy Certificate', key: 'energy_certificate', required: true, phase: 1, description: 'Building energy efficiency certification' },
  { name: 'Building Plans', key: 'building_plans', required: true, phase: 3, description: 'Complete architectural drawings' },
  { name: 'Renovation Plans', key: 'renovation_plans', required: false, phase: 3, description: 'Planned building renovations' },
  { name: 'Technical Inspections', key: 'technical_inspections', required: false, phase: 2, description: 'Building condition reports' },

  // Financial Documents
  { name: 'HOA Annual Statement', key: 'hoa_statement', required: true, phase: 2, description: 'Annual financial statement from HOA' },
  { name: 'Maintenance Reserve Report', key: 'maintenance_reserve', required: true, phase: 2, description: 'Building maintenance fund status' },
  { name: 'Utility Contracts', key: 'utility_contracts', required: false, phase: 3, description: 'Building utility service agreements' },
];

// Unit-specific documents (per property)
const UNIT_DOCUMENTS = [
  { name: 'Unit Floor Plan', key: 'unit_floor_plan', required: true, phase: 1, description: 'Individual unit layout' },
  { name: 'Unit Photos', key: 'unit_photos', required: true, phase: 4, description: 'Professional property photos' },
  { name: 'Unit Renovation Plan', key: 'unit_renovation', required: false, phase: 3, description: 'Unit-specific renovations' },
  { name: 'Virtual Tour', key: 'virtual_tour', required: false, phase: 4, description: '360° virtual property tour' },
];

// After-sale documents (customer-specific, not synced with BlackVesto)
const AFTER_SALE_DOCUMENTS = [
  { name: 'Final Purchase Contract', key: 'final_purchase_contract', required: true, phase: 5, description: 'Buyer\'s purchase agreement' },
  { name: 'New Rental Contract', key: 'new_rental_contract', required: false, phase: 5, description: 'Post-sale tenant agreement' },
  { name: 'Notary Documents', key: 'notary_docs', required: true, phase: 5, description: 'Notarized transfer documents' },
  { name: 'Handover Protocol', key: 'handover_protocol', required: true, phase: 6, description: 'Property handover checklist' },
  { name: 'Key Documentation', key: 'key_docs', required: true, phase: 6, description: 'Key handover documentation' },
  { name: 'Utility Transfers', key: 'utility_transfers', required: true, phase: 6, description: 'Utility account transfers' },
  { name: 'Property Management Agreement', key: 'property_management', required: false, phase: 6, description: 'Management service contracts' },
  { name: 'New Owner Insurance', key: 'owner_insurance', required: false, phase: 6, description: 'Insurance policy transfer' },
  { name: 'Warranty Documents', key: 'warranties', required: false, phase: 6, description: 'Appliance and renovation warranties' },
];

interface DocumentItem {
  id: string;
  name: string;
  fileName?: string;
  type: string;
  size?: number;
  uploadedAt?: string;
  status: 'uploaded' | 'pending' | 'missing' | 'optional';
  url?: string;
  phase: number;
  required: boolean;
}

interface DocumentManagementProps {
  propertyId: string;
  property?: Property;
  currentPhase: number;
  documents?: DocumentItem[];
  onDocumentUpload?: (file: File, documentType: string) => Promise<void>;
  onDocumentDelete?: (documentId: string) => Promise<void>;
}

export function DocumentManagement({
  propertyId,
  property,
  currentPhase,
  onDocumentUpload
}: DocumentManagementProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    project: true,
    unit: true,
    afterSale: true,
    requests: true
  });
  const [previewDocument, setPreviewDocument] = useState<{
    id: string;
    name: string;
    fileName: string;
    type: 'pdf' | 'image' | 'other';
    size: string;
    uploadedAt: string;
    uploadedBy: string;
    pages?: number;
  } | null>(null);
  const requestsSectionRef = useRef<HTMLDivElement>(null);

  // Mock data for document status - in real app would come from API
  const getDocumentStatus = (docKey: string): 'uploaded' | 'pending' | 'missing' | 'optional' => {
    // Simulate some documents being uploaded
    const uploadedDocs = ['weg_protocols', 'teilungserklarung', 'energy_certificate', 'building_plans', 'unit_floor_plan'];
    const pendingDocs = ['hoa_statement'];

    if (uploadedDocs.includes(docKey)) return 'uploaded';
    if (pendingDocs.includes(docKey)) return 'pending';
    return 'missing';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'optional':
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent, documentType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0] && onDocumentUpload) {
      const file = e.dataTransfer.files[0];
      setUploadingFiles(prev => new Set(prev).add(documentType));
      await onDocumentUpload(file, documentType);
      setUploadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentType);
        return newSet;
      });
    }
  };

  // Calculate progress
  const requiredProjectDocs = PROJECT_DOCUMENTS.filter(doc => doc.required && doc.phase <= currentPhase);
  const requiredUnitDocs = UNIT_DOCUMENTS.filter(doc => doc.required && doc.phase <= currentPhase);
  const totalRequired = requiredProjectDocs.length + requiredUnitDocs.length;

  const uploadedProjectDocs = requiredProjectDocs.filter(doc => getDocumentStatus(doc.key) === 'uploaded').length;
  const uploadedUnitDocs = requiredUnitDocs.filter(doc => getDocumentStatus(doc.key) === 'uploaded').length;
  const totalUploaded = uploadedProjectDocs + uploadedUnitDocs;

  const progressPercentage = totalRequired > 0 ? (totalUploaded / totalRequired) * 100 : 0;

  // Mock BlackVesto requests
  const blackVestoRequests = property?.developer_sales_partner === 'blackvesto' ? [
    { id: '1', name: 'Updated HOA meeting minutes (2024)', status: 'pending', targetSection: 'project' },
    { id: '2', name: 'Professional exterior photos', status: 'pending', targetSection: 'unit' },
    { id: '3', name: 'Utility cost breakdown', status: 'uploaded', uploadedAt: '2024-01-18', targetSection: 'project' }
  ] : [];

  const pendingRequests = blackVestoRequests.filter(r => r.status === 'pending');

  const scrollToRequests = () => {
    requestsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      {/* Request Alert - Shows at top when there are pending requests */}
      {pendingRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle>Document Requests Pending</AlertTitle>
          <AlertDescription>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm">
                You have <strong>{pendingRequests.length} pending document request{pendingRequests.length > 1 ? 's' : ''}</strong> from BlackVesto that require immediate attention
              </span>
              <Button size="sm" variant="default" onClick={scrollToRequests} className="ml-4">
                <ChevronDown className="h-4 w-4 mr-1" />
                View Requests
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>
            Upload and manage all required documents for Phase {currentPhase}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {totalUploaded} of {totalRequired} required documents
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-500">
            All documents must be uploaded by the end of Phase 3 (Documentation & Preparation)
          </p>
        </CardContent>
      </Card>

      {/* Project-Level Documents */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(prev => ({ ...prev, project: !prev.project }))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Building Documents</CardTitle>
            </div>
            <Badge variant="outline">Shared across all units</Badge>
          </div>
          <CardDescription>
            Documents that apply to the entire building - {property?.project?.name || 'Project'}
          </CardDescription>
        </CardHeader>
        {expandedSections.project && (
          <CardContent className="space-y-3">
            {PROJECT_DOCUMENTS.map((doc) => {
              const status = doc.required ? getDocumentStatus(doc.key) : 'optional';
              const isOverdue = currentPhase >= doc.phase && status === 'missing' && doc.required;

              return (
                <div
                  key={doc.key}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isOverdue && "border-red-200 bg-red-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(status)}
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                      {status === 'uploaded' && (
                        <p className="text-xs text-gray-400 mt-1">{doc.key}.pdf • Uploaded 2 days ago</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isOverdue ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      Phase {doc.phase}
                    </Badge>
                    {status === 'uploaded' ? (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setPreviewDocument({
                          id: doc.key,
                          name: doc.name,
                          fileName: `${doc.key}.pdf`,
                          type: doc.key === 'energy_certificate' ? 'pdf' : 'pdf',
                          size: '2.4 MB',
                          uploadedAt: '2 days ago',
                          uploadedBy: 'Anna Schmidt',
                          pages: 8
                        })}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    ) : status !== 'optional' && (
                      <Button size="sm" variant="outline" disabled>
                        View in Project
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t">
              <Button variant="outline" size="sm" className="w-full">
                Go to Project Documents →
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Unit-Specific Documents */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(prev => ({ ...prev, unit: !prev.unit }))}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <CardTitle>Unit Documents</CardTitle>
            </div>
            <Badge variant="outline">{property?.unit_number || 'WE ' + propertyId.slice(-3)}</Badge>
          </div>
          <CardDescription>
            Documents specific to this individual unit
          </CardDescription>
        </CardHeader>
        {expandedSections.unit && (
          <CardContent className="space-y-3">
            {UNIT_DOCUMENTS.map((doc) => {
              const status = doc.required ? getDocumentStatus(doc.key) : 'optional';
              const isOverdue = currentPhase >= doc.phase && status === 'missing' && doc.required;

              return (
                <div
                  key={doc.key}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isOverdue && "border-red-200 bg-red-50",
                    dragActive && "border-blue-400 bg-blue-50"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={(e) => handleDrop(e, doc.key)}
                >
                  <div className="flex items-center gap-3">
                    {uploadingFiles.has(doc.key) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    ) : (
                      getStatusIcon(status)
                    )}
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                      {status === 'uploaded' && (
                        <p className="text-xs text-gray-400 mt-1">
                          {doc.key}_{property?.unit_number || propertyId.slice(-3)}.pdf • 2.3 MB
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {doc.required && (
                      <Badge
                        variant={isOverdue ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        Phase {doc.phase}
                      </Badge>
                    )}
                    {!doc.required && (
                      <Badge variant="outline" className="text-xs">
                        Optional
                      </Badge>
                    )}
                    {status === 'uploaded' ? (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => setPreviewDocument({
                            id: doc.key,
                            name: doc.name,
                            fileName: `${doc.key}_${property?.unit_number || propertyId.slice(-3)}.pdf`,
                            type: doc.key === 'unit_photos' ? 'image' : 'pdf',
                            size: '2.3 MB',
                            uploadedAt: '2024-01-16',
                            uploadedBy: 'Max Mustermann',
                            pages: 5
                          })}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : status !== 'optional' && (
                      <Button size="sm" variant="outline">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      {/* After-Sale Documents - Only visible in Phase 5+ */}
      {currentPhase >= 5 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(prev => ({ ...prev, afterSale: !prev.afterSale }))}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                <CardTitle>After-Sale Documents</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Private Documents
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  Not synced with BlackVesto
                </Badge>
              </div>
            </div>
            <CardDescription>
              Customer-specific documents for post-sale management
            </CardDescription>
          </CardHeader>
          {expandedSections.afterSale && (
            <CardContent className="space-y-3">
              {AFTER_SALE_DOCUMENTS.map((doc) => {
                const status = doc.required ? getDocumentStatus(doc.key) : 'optional';
                const isOverdue = currentPhase >= doc.phase && status === 'missing' && doc.required;

                return (
                  <div
                    key={doc.key}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      isOverdue && "border-red-200 bg-red-50",
                      dragActive && "border-blue-400 bg-blue-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => handleDrop(e, doc.key)}
                  >
                    <div className="flex items-center gap-3">
                      {uploadingFiles.has(doc.key) ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                      ) : (
                        getStatusIcon(status)
                      )}
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.description}</p>
                        {status === 'uploaded' && (
                          <p className="text-xs text-gray-400 mt-1">
                            {doc.key}.pdf • Uploaded privately
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.required && (
                        <Badge
                          variant={isOverdue ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          Phase {doc.phase}
                        </Badge>
                      )}
                      {!doc.required && (
                        <Badge variant="outline" className="text-xs">
                          Optional
                        </Badge>
                      )}
                      {status === 'uploaded' ? (
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : status !== 'optional' && (
                        <Button size="sm" variant="outline">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* BlackVesto Document Requests */}
      {blackVestoRequests.length > 0 && (
        <Card className="border-blue-200" ref={requestsSectionRef}>
          <CardHeader className="cursor-pointer" onClick={() => setExpandedSections(prev => ({ ...prev, requests: !prev.requests }))}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle>BlackVesto Requests</CardTitle>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {blackVestoRequests.filter(r => r.status === 'pending').length} pending
              </Badge>
            </div>
            <CardDescription>
              Additional documents requested by your BlackVesto sales partner
            </CardDescription>
          </CardHeader>
          {expandedSections.requests && (
            <CardContent>
              <Alert className="mb-4 border-blue-200 bg-blue-50/50">
                <MessageSquare className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Important: Requested documents will automatically appear in the appropriate section above once uploaded.</p>
                  <p className="text-sm">Your BlackVesto sales partner has requested these documents to support the sales process. Documents will be shared with all relevant properties if uploaded at project level.</p>
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                {blackVestoRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      {request.status === 'uploaded' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{request.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {request.targetSection === 'project' ? (
                              <>
                                <Building2 className="h-3 w-3 mr-1" />
                                Building Document
                              </>
                            ) : (
                              <>
                                <Home className="h-3 w-3 mr-1" />
                                Unit Document
                              </>
                            )}
                          </Badge>
                          {request.uploadedAt && (
                            <span className="text-xs text-gray-500">• Uploaded on {request.uploadedAt}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {request.status === 'pending' ? (
                      <Button size="sm" variant="outline">
                        <Upload className="h-3 w-3 mr-1" />
                        Upload
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Upload Zone */}
      <Card className={cn("border-dashed", dragActive && "border-blue-400 bg-blue-50")}>
        <CardContent className="py-8">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium mb-1">Drop files here to upload</p>
            <p className="text-xs text-gray-500">or click on any Upload button above</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      {previewDocument && (
        <DocumentPreview
          isOpen={!!previewDocument}
          onClose={() => setPreviewDocument(null)}
          document={previewDocument}
        />
      )}
    </div>
  );
}