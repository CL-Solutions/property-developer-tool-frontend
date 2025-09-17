'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Home,
  Archive,
  MoreVertical,
  Trash2
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MockDataService } from '@/lib/mock-data';
import type { DeveloperNotification } from '@/lib/types';



interface NotificationListProps {
  notifications: DeveloperNotification[];
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ 
  notifications, 
  onMarkAsRead,
  onArchive 
}) => {
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const date = new Date(notification.created_at).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {} as Record<string, DeveloperNotification[]>);

  const getIcon = (type: DeveloperNotification['notification_type']) => {
    switch (type) {
      case 'document_request':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <Clock className="h-4 w-4" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <CheckCircle className="h-4 w-4" />;
      case 'reservation_status':
        return <Home className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex flex-col">
      {Object.entries(groupedNotifications).map(([date, dateNotifications], dateIndex) => (
          <div 
            key={date}
            className="notification-group animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${dateIndex * 50}ms` }}
          >
            <div className="px-6 py-2">
              <p className="text-xs font-semibold text-muted-foreground">
                {getDateLabel(date)}
              </p>
            </div>
            {dateNotifications.map((notification, index) => (
              <div
                key={notification.id}
                style={{ animationDelay: `${index * 50 + dateIndex * 50}ms` }}
                className={cn(
                  "group relative px-6 py-3 transition-all duration-200 hover:-translate-x-1 notification-item animate-in fade-in slide-in-from-right-5",
                  notification.read 
                    ? "hover:bg-accent/50 opacity-70" 
                    : "bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className={cn(
                      "text-xs",
                      notification.priority === 'high' && "bg-red-500 text-white",
                      notification.priority === 'medium' && "bg-amber-500 text-white",
                      notification.priority === 'low' && "bg-green-500 text-white"
                    )}>
                      {getIcon(notification.notification_type)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as read
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onArchive(notification.id)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {notification.property_name && (
                        <>
                          <Home className="h-3 w-3" />
                          <span>{notification.property_name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{getRelativeTime(new Date(notification.created_at))}</span>
                      {!notification.read && (
                        <>
                          <span>•</span>
                          <Badge className="h-4 px-1.5 text-[10px] bg-blue-500 text-white hover:bg-blue-500 animate-pulse">
                            NEW
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {dateIndex < Object.entries(groupedNotifications).length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}
    </div>
  );
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<DeveloperNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await MockDataService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, []);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        className="w-[450px] sm:max-w-[450px] p-0 gap-0 data-[state=closed]:duration-300 data-[state=open]:duration-500"
        side="right"
      >
        <div className="h-full flex flex-col animate-in fade-in duration-300">
          <SheetHeader className="border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Notifications</SheetTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-8 text-xs"
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <ToggleGroup 
                type="single" 
                value={filter} 
                onValueChange={(value) => value && setFilter(value as 'all' | 'unread')}
                className="justify-start w-full"
              >
                <ToggleGroupItem value="all" className="h-8 px-4 text-xs flex-1">
                  All
                </ToggleGroupItem>
                <ToggleGroupItem value="unread" className="h-8 px-4 text-xs flex-1 flex items-center justify-center gap-1.5">
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="h-5 min-w-[20px] px-1 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1 notification-scroll">
            {filteredNotifications.length > 0 ? (
              <NotificationList 
                notifications={filteredNotifications}
                onMarkAsRead={markAsRead}
                onArchive={archiveNotification}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium text-muted-foreground">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filter === 'unread' ? 'You\'re all caught up!' : 'Check back later for updates'}
                </p>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}