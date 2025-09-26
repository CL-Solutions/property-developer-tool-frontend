'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  User,
  Phone,

  Building,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { Property, NotaryAppointment } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface NotaryAppointmentManagerProps {
  property: Property;
  onUpdate?: (appointment: NotaryAppointment) => void;
}

export function NotaryAppointmentManager({ property, onUpdate }: NotaryAppointmentManagerProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [notaryName, setNotaryName] = useState('');
  const [notaryContact, setNotaryContact] = useState('');
  const [message, setMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isBlackVesto = property.developer_sales_partner === 'blackvesto';
  const appointment = property.notary_appointment;

  // Status Timeline Steps
  const getTimelineSteps = () => {
    const steps = [
      { 
        id: 'request', 
        label: 'Request Dates', 
        icon: CalendarIcon,
        completed: !!appointment?.proposed_dates?.length 
      },
      { 
        id: 'propose', 
        label: 'Send Proposals', 
        icon: Send,
        completed: !!appointment?.proposed_dates?.length 
      },
      { 
        id: 'confirm_customer', 
        label: 'Customer Confirms', 
        icon: User,
        completed: !!appointment?.customer_confirmed 
      },
      { 
        id: 'confirm_notary', 
        label: 'Notary Confirms', 
        icon: CheckCircle2,
        completed: !!appointment?.backoffice_confirmed 
      },
      { 
        id: 'prepare_docs', 
        label: 'Prepare Documents', 
        icon: FileText,
        completed: !!appointment?.documents_prepared 
      },
      { 
        id: 'complete', 
        label: 'Complete Sale', 
        icon: CheckCircle2,
        completed: appointment?.status === 'completed' 
      }
    ];

    return steps;
  };



  const handleSendProposals = () => {
    if (selectedDates.length !== 3) {
      alert('Please select exactly 3 date proposals');
      return;
    }

    // Mock update
    const newAppointment: NotaryAppointment = {
      id: `notary-${property.id}`,
      property_id: property.id,
      status: 'preparation',
      proposed_dates: selectedDates,
      notary_name: notaryName,
      notary_contact: notaryContact,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    onUpdate?.(newAppointment);
    setShowDatePicker(false);
  };

  // BlackVesto Read-Only View
  if (isBlackVesto) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notary Appointment Status</span>
            <Badge variant="outline">
              <Building className="h-3 w-3 mr-1" />
              Managed by BlackVesto
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time synchronization with BlackVesto sales platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="relative">
            <div className="flex justify-between items-center">
              {getTimelineSteps().map((step, index) => (
                <div key={step.id} className="flex-1 flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs mt-2 text-center">{step.label}</p>
                  {index < getTimelineSteps().length - 1 && (
                    <div className={`
                      absolute top-5 w-full h-0.5
                      ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                    `} style={{ left: '50%', width: 'calc(100% - 40px)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Appointment Details */}
          {appointment && (
            <div className="space-y-3 pt-4 border-t">
              {appointment.proposed_dates && appointment.proposed_dates.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Proposed Dates</Label>
                  <div className="mt-1 space-y-1">
                    {appointment.proposed_dates.map((date, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(date), 'PPP')}
                        </span>
                        {appointment.selected_date === date && (
                          <Badge variant="default" className="text-xs">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {appointment.confirmed_date && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <Label className="text-sm font-medium text-green-800">Confirmed Appointment</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">
                      {format(new Date(appointment.confirmed_date), 'PPP')}
                    </span>
                  </div>
                </div>
              )}

              {appointment.notary_name && (
                <div>
                  <Label className="text-sm font-medium">Notary</Label>
                  <p className="text-sm mt-1">{appointment.notary_name}</p>
                  {appointment.notary_contact && (
                    <p className="text-xs text-muted-foreground">{appointment.notary_contact}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {appointment.customer_confirmed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>Customer {appointment.customer_confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
                <div className="flex items-center gap-1">
                  {appointment.backoffice_confirmed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span>Backoffice {appointment.backoffice_confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
              </div>
            </div>
          )}

          {!appointment && (
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Waiting for BlackVesto to initiate notary process
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Internal Management View (Interactive)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notary Appointment Management</CardTitle>
        <CardDescription>
          Coordinate notary appointment with buyer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="relative">
          <div className="flex justify-between items-center">
            {getTimelineSteps().map((step, index) => (
              <div key={step.id} className="flex-1 flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center cursor-pointer
                  ${step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}
                `}>
                  <step.icon className="h-5 w-5" />
                </div>
                <p className="text-xs mt-2 text-center">{step.label}</p>
                {index < getTimelineSteps().length - 1 && (
                  <div className={`
                    absolute top-5 w-full h-0.5
                    ${step.completed ? 'bg-green-500' : 'bg-gray-200'}
                  `} style={{ left: '50%', width: 'calc(100% - 40px)' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons based on status */}
        {!appointment?.proposed_dates && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notary-name">Notary Name</Label>
                <Input
                  id="notary-name"
                  value={notaryName}
                  onChange={(e) => setNotaryName(e.target.value)}
                  placeholder="Dr. Schmidt"
                />
              </div>
              <div>
                <Label htmlFor="notary-contact">Contact Info</Label>
                <Input
                  id="notary-contact"
                  value={notaryContact}
                  onChange={(e) => setNotaryContact(e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
            </div>

            <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Request Available Dates from Notary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Select 3 Date Proposals</DialogTitle>
                  <DialogDescription>
                    Choose 3 possible dates to propose to the customer
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Calendar
                        mode="multiple"
                        selected={selectedDates}
                        onSelect={(dates) => setSelectedDates(dates || [])}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Selected Dates ({selectedDates.length}/3)</Label>
                      {selectedDates.map((date, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{format(date, 'PPP')}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedDates(selectedDates.filter((_, i) => i !== idx))}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {selectedDates.length === 0 && (
                        <p className="text-sm text-muted-foreground">No dates selected</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="message">Message to Customer</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please select your preferred appointment date..."
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDatePicker(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendProposals}
                    disabled={selectedDates.length !== 3}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Proposals to Customer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Display appointment details if exists */}
        {appointment && (
          <div className="space-y-3 pt-4 border-t">
            {appointment.proposed_dates && (
              <div>
                <Label className="text-sm font-medium">Proposed Dates to Customer</Label>
                <div className="mt-2 space-y-2">
                  {appointment.proposed_dates.map((date, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{format(new Date(date), 'PPP')}</span>
                      </div>
                      {!appointment.selected_date && (
                        <Button size="sm" variant="outline">
                          Mark as Selected
                        </Button>
                      )}
                      {appointment.selected_date === date && (
                        <Badge variant="default">Customer Selected</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appointment.selected_date && !appointment.confirmed_date && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">
                  Customer selected: {format(new Date(appointment.selected_date), 'PPP')}
                </p>
                <Button size="sm">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirm with Notary
                </Button>
              </div>
            )}

            {appointment.confirmed_date && (
              <div className="p-3 bg-green-50 rounded-lg">
                <Label className="text-sm font-medium text-green-800">✅ Appointment Confirmed</Label>
                <p className="text-lg font-medium text-green-900 mt-1">
                  {format(new Date(appointment.confirmed_date), 'PPP')}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-green-700">
                    <Building className="h-4 w-4 inline mr-1" />
                    {appointment.notary_name}
                  </p>
                  <p className="text-sm text-green-700">
                    <Phone className="h-4 w-4 inline mr-1" />
                    {appointment.notary_contact}
                  </p>
                </div>
                {!appointment.documents_prepared && (
                  <Button className="mt-3 w-full" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Mark Documents as Prepared
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}