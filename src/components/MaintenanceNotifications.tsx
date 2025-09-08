import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Settings, Bell, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NotificationSettings {
  id?: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  email_address: string;
  phone_number: string;
  notify_monthly: boolean;
  notify_weekly: boolean;
  notify_due_date: boolean;
  created_at?: string;
  updated_at?: string;
}

interface MaintenanceNotificationsProps {
  selectedHomeId: string;
}

export function MaintenanceNotifications({ selectedHomeId }: MaintenanceNotificationsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    user_id: user?.id || '',
    email_enabled: true,
    sms_enabled: false,
    email_address: user?.email || '',
    phone_number: '',
    notify_monthly: true,
    notify_weekly: true,
    notify_due_date: true,
  });

  useEffect(() => {
    if (user?.id) {
      fetchNotificationSettings();
    }
  }, [user?.id]);

  const fetchNotificationSettings = async () => {
    setLoading(true);
    try {
      // Use direct SQL to avoid TypeScript issues with new table
      const { data, error } = await supabase
        .rpc('get_user_notification_settings', { user_uuid: user?.id });

      if (error && error.code !== 'PGRST116') {
        console.log('No notification settings found, using defaults');
      }

      if (data && data.length > 0) {
        setSettings(data[0]);
      } else {
        // Use default settings with user's email
        setSettings(prev => ({
          ...prev,
          email_address: user?.email || '',
        }));
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      // Use default settings on error
      setSettings(prev => ({
        ...prev,
        email_address: user?.email || '',
      }));
    } finally {
      setLoading(false);
    }
  };

  const saveNotificationSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase.rpc('upsert_notification_settings', {
        user_uuid: user.id,
        email_enabled: settings.email_enabled,
        sms_enabled: settings.sms_enabled,
        email_address: settings.email_address,
        phone_number: settings.phone_number,
        notify_monthly: settings.notify_monthly,
        notify_weekly: settings.notify_weekly,
        notify_due_date: settings.notify_due_date,
      });

      if (error) throw error;

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailNotification = async () => {
    if (!settings.email_address) return;

    try {
      const { error } = await supabase.functions.invoke('send-maintenance-reminder', {
        body: {
          type: 'test',
          email: settings.email_address,
          userName: user?.email?.split('@')[0] || 'User',
        },
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `Test notification sent to ${settings.email_address}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      });
    }
  };

  const showSMSNotAvailable = () => {
    toast({
      title: "SMS Not Available",
      description: "Text notifications are not yet available. Email notifications are fully supported.",
      variant: "destructive",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notification settings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-enabled"
              checked={settings.email_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_enabled: checked === true })
              }
            />
            <Label htmlFor="email-enabled" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Enable Email Notifications
            </Label>
            <Badge variant="secondary">Available</Badge>
          </div>
          
          {settings.email_enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <Label htmlFor="email-address">Email Address</Label>
                <Input
                  id="email-address"
                  type="email"
                  value={settings.email_address}
                  onChange={(e) =>
                    setSettings({ ...settings, email_address: e.target.value })
                  }
                  placeholder="Enter your email address"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testEmailNotification}
                disabled={!settings.email_address}
              >
                Send Test Email
              </Button>
            </div>
          )}
        </div>

        {/* SMS Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sms-enabled"
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => {
                if (checked) {
                  showSMSNotAvailable();
                } else {
                  setSettings({ ...settings, sms_enabled: false });
                }
              }}
            />
            <Label htmlFor="sms-enabled" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Enable SMS Notifications
            </Label>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
          
          {settings.sms_enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <Label htmlFor="phone-number">Phone Number</Label>
                <Input
                  id="phone-number"
                  type="tel"
                  value={settings.phone_number}
                  onChange={(e) =>
                    setSettings({ ...settings, phone_number: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  disabled
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                SMS notifications are not yet available
              </div>
            </div>
          )}
        </div>

        {/* Notification Timing */}
        <div className="space-y-4">
          <Label className="text-base font-medium">When to Send Reminders</Label>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-monthly"
                checked={settings.notify_monthly}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notify_monthly: checked === true })
                }
              />
              <Label htmlFor="notify-monthly">
                Tasks due in the upcoming month
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-weekly"
                checked={settings.notify_weekly}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notify_weekly: checked === true })
                }
              />
              <Label htmlFor="notify-weekly">
                Tasks due in the upcoming week
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify-due-date"
                checked={settings.notify_due_date}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notify_due_date: checked === true })
                }
              />
              <Label htmlFor="notify-due-date">
                Tasks due today
              </Label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={saveNotificationSettings} disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}