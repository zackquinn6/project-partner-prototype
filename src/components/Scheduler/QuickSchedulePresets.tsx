import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Moon, Sun, Zap, Clock } from 'lucide-react';

interface QuickSchedulePresetsProps {
  onPresetSelect: (preset: SchedulePreset) => void;
}

export interface SchedulePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: {
    weekendsOnly: boolean;
    weekdaysAfterFivePm: boolean;
    hoursPerWeek: number;
    workingHours: {
      start: string;
      end: string;
    };
  };
}

const presets: SchedulePreset[] = [
  {
    id: 'weekends',
    name: 'Weekends Only',
    description: 'Work Saturday & Sunday, 8 hours/day',
    icon: <Calendar className="w-5 h-5" />,
    settings: {
      weekendsOnly: true,
      weekdaysAfterFivePm: false,
      hoursPerWeek: 16,
      workingHours: { start: '09:00', end: '17:00' }
    }
  },
  {
    id: 'evenings',
    name: 'Evenings & Weekends',
    description: 'Weekdays after 5pm + full weekends',
    icon: <Moon className="w-5 h-5" />,
    settings: {
      weekendsOnly: false,
      weekdaysAfterFivePm: true,
      hoursPerWeek: 26,
      workingHours: { start: '17:00', end: '21:00' }
    }
  },
  {
    id: 'fulltime',
    name: 'Full Time',
    description: 'Work daily, regular business hours',
    icon: <Sun className="w-5 h-5" />,
    settings: {
      weekendsOnly: false,
      weekdaysAfterFivePm: false,
      hoursPerWeek: 40,
      workingHours: { start: '08:00', end: '17:00' }
    }
  },
  {
    id: 'sprint',
    name: 'Sprint Mode',
    description: 'Maximum hours, every day possible',
    icon: <Zap className="w-5 h-5" />,
    settings: {
      weekendsOnly: false,
      weekdaysAfterFivePm: false,
      hoursPerWeek: 60,
      workingHours: { start: '07:00', end: '19:00' }
    }
  }
];

export const QuickSchedulePresets: React.FC<QuickSchedulePresetsProps> = ({ onPresetSelect }) => {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium mb-2">Quick Setup</h3>
        <p className="text-xs text-muted-foreground">Choose a schedule that fits your availability</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {presets.map((preset) => (
          <Card 
            key={preset.id}
            className="group cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200"
            onClick={() => onPresetSelect(preset)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover:scale-110 transition-transform">
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      <Clock className="w-3 h-3 mr-1" />
                      {preset.settings.hoursPerWeek} hrs/week
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
