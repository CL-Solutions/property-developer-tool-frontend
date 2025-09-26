"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X,
  Download,
  Printer,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  File,
  History,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DocumentVersion {
  id: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  fileSize: string;
  changes?: string;
}

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    fileName: string;
    type: 'pdf' | 'image' | 'other';
    size: string;
    uploadedAt: string;
    uploadedBy: string;
    url?: string;
    pages?: number;
    versions?: DocumentVersion[];
  };
}

export function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState('preview');

  // Mock PDF pages for demonstration
  const totalPages = document.pages || 5;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Mock version history
  const versions: DocumentVersion[] = document.versions || [
    {
      id: '3',
      version: 'v3.0',
      uploadedBy: 'Max Mustermann',
      uploadedAt: '2024-01-18 14:30',
      fileSize: '2.4 MB',
      changes: 'Updated energy certificate values'
    },
    {
      id: '2',
      version: 'v2.0',
      uploadedBy: 'Anna Schmidt',
      uploadedAt: '2024-01-15 10:15',
      fileSize: '2.3 MB',
      changes: 'Added missing page 3'
    },
    {
      id: '1',
      version: 'v1.0',
      uploadedBy: 'Max Mustermann',
      uploadedAt: '2024-01-10 09:00',
      fileSize: '2.1 MB',
      changes: 'Initial upload'
    }
  ];

  const renderPreview = () => {
    if (document.type === 'pdf') {
      return (
        <div className="flex flex-col h-full">
          {/* PDF Toolbar */}
          <div className="border-b px-4 py-2 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {zoomLevel}%
              </span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* PDF Content Area */}
          <ScrollArea className="flex-1 p-4 bg-gray-100">
            <div 
              className="mx-auto bg-white shadow-lg"
              style={{
                width: `${8.5 * zoomLevel / 100}in`,
                minHeight: `${11 * zoomLevel / 100}in`,
                padding: '1in',
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {/* Mock PDF Content */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold">Energy Certificate</h1>
                <div className="border-b pb-2">
                  <p className="text-sm text-gray-600">Document ID: {document.id}</p>
                  <p className="text-sm text-gray-600">Page {currentPage}</p>
                </div>
                
                {currentPage === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Building Information</h3>
                        <p className="text-sm">Address: Leonardstraße 45</p>
                        <p className="text-sm">Year Built: 1975</p>
                        <p className="text-sm">Living Space: 1,245 m²</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Energy Data</h3>
                        <p className="text-sm">Energy Class: D</p>
                        <p className="text-sm">Primary Energy: 145 kWh/m²a</p>
                        <p className="text-sm">CO2 Emissions: 35 kg/m²a</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-8 rounded relative">
                      <div className="absolute top-10 left-[60%] transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-black"></div>
                        <div className="text-xs mt-1 font-bold">D</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Technical Details</h2>
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Heating System</td>
                          <td className="py-2 text-right">Gas Central Heating (2010)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Insulation</td>
                          <td className="py-2 text-right">External Wall Insulation (2015)</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Windows</td>
                          <td className="py-2 text-right">Double Glazed (2012)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {currentPage > 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Additional Information - Page {currentPage}</h2>
                    <p className="text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                      incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      );
    } else if (document.type === 'image') {
      return (
        <div className="flex flex-col h-full">
          {/* Image Toolbar */}
          <div className="border-b px-4 py-2 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-medium">{document.fileName}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {zoomLevel}%
              </span>
              <Button size="sm" variant="outline" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Content */}
          <ScrollArea className="flex-1 p-4 bg-gray-100">
            <div className="flex items-center justify-center min-h-full">
              <div 
                className="relative"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                {/* Mock Image Placeholder */}
                <div className="bg-white shadow-lg p-4">
                  <div className="w-[600px] h-[400px] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Floor Plan - Unit WE 001</p>
                      <p className="text-sm text-gray-400 mt-2">1200x800px • 2.3MB</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      );
    } else {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <File className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{document.fileName}</p>
            <p className="text-sm text-gray-500 mt-2">Preview not available</p>
            <Button className="mt-4" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download to View
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[85vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            {document.type === 'pdf' ? (
              <FileText className="h-5 w-5 text-red-500" />
            ) : document.type === 'image' ? (
              <ImageIcon className="h-5 w-5 text-blue-500" />
            ) : (
              <File className="h-5 w-5 text-gray-500" />
            )}
            <div>
              <h2 className="text-lg font-semibold">{document.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{document.fileName}</span>
                <span>•</span>
                <span>{document.size}</span>
                <span>•</span>
                <span>Uploaded {document.uploadedAt}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline">
              <Printer className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="default">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger 
              value="preview" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Preview
            </TabsTrigger>
            <TabsTrigger 
              value="details" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Details
            </TabsTrigger>
            <TabsTrigger 
              value="versions" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              Version History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 m-0">
            {renderPreview()}
          </TabsContent>

          <TabsContent value="details" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Document Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">File Name</dt>
                    <dd className="text-sm font-medium">{document.fileName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">File Size</dt>
                    <dd className="text-sm font-medium">{document.size}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Type</dt>
                    <dd className="text-sm font-medium">
                      <Badge variant="outline">{document.type.toUpperCase()}</Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Pages</dt>
                    <dd className="text-sm font-medium">{totalPages} pages</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Uploaded By</dt>
                    <dd className="text-sm font-medium">{document.uploadedBy}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Upload Date</dt>
                    <dd className="text-sm font-medium">{document.uploadedAt}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Document Status</h3>
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                  <Badge variant="outline">Valid until: 2025-01-18</Badge>
                  <Badge variant="outline">Phase 3 Document</Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Version History</h3>
                <Badge variant="outline">
                  {versions.length} version{versions.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div 
                    key={version.id} 
                    className={cn(
                      "p-4 rounded-lg border",
                      index === 0 && "border-green-200 bg-green-50"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <History className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{version.version}</span>
                            {index === 0 && (
                              <Badge className="text-xs bg-green-100 text-green-800">Current</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{version.changes}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {version.uploadedBy}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {version.uploadedAt}
                            </span>
                            <span>{version.fileSize}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {index === 0 ? (
                          <Button size="sm" variant="outline">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" variant="ghost">
                              View
                            </Button>
                            <Button size="sm" variant="ghost">
                              Restore
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}