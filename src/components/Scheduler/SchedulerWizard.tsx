import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { QuickSchedulePresets, SchedulePreset } from './QuickSchedulePresets';
import { 
  Target, 
  AlertTriangle, 
  Calendar, 
  Clock,
  ChevronDown,
  ChevronRight,
  Settings,
  Zap
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { PlanningMode, ScheduleTempo } from '@/interfaces/Scheduling';

interface SchedulerWizardProps {
  targetDate: string;
  setTargetDate: (date: string) => void;
  dropDeadDate: string;
  setDropDeadDate: (date: string) => void;
  planningMode: PlanningMode;
  setPlanningMode: (mode: PlanningMode) => void;
  scheduleTempo: ScheduleTempo;
  setScheduleTempo: (tempo: ScheduleTempo) => void;
  onPresetApply: (preset: SchedulePreset) => void;
}

export const SchedulerWizard: React.FC<SchedulerWizardProps> = ({
  targetDate,
  setTargetDate,
  dropDeadDate,
  setDropDeadDate,
  planningMode,
  setPlanningMode,
  scheduleTempo,
  setScheduleTempo,
  onPresetApply
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Quick Presets */}
      <Card>
        <CardContent className="p-4">
          <QuickSchedulePresets onPresetSelect={onPresetApply} />
        </CardContent>
      </Card>

      {/* Essential Settings */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Project Dates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Target Completion
                </Label>
                <Input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="mt-1 h-9"
                />
                <p className="text-xs text-muted-foreground mt-1">Your goal date</p>
              </div>
              
              <div>
                <Label className="text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                  Latest Acceptable Date
                </Label>
                <Input
                  type="date"
                  value={dropDeadDate}
                  onChange={(e) => setDropDeadDate(e.target.value)}
                  className="mt-1 h-9"
                />
                <p className="text-xs text-muted-foreground mt-1">Absolute deadline</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium mb-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Schedule Tempo
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={scheduleTempo === 'fast_track' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScheduleTempo('fast_track')}
                className="h-20 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105"
              >
                <Zap className="w-5 h-5" />
                <span className="text-xs font-semibold">Fast-Track</span>
                <span className="text-[10px] opacity-70">Tight schedule</span>
              </Button>
              <Button
                variant={scheduleTempo === 'steady' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScheduleTempo('steady')}
                className="h-20 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105"
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-semibold">Steady Pace</span>
                <span className="text-[10px] opacity-70">Balanced</span>
              </Button>
              <Button
                variant={scheduleTempo === 'extended' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setScheduleTempo('extended')}
                className="h-20 flex flex-col items-center justify-center gap-1.5 transition-all hover:scale-105"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-semibold">Extended</span>
                <span className="text-[10px] opacity-70">Extra buffer</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings (Collapsible) */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <Card>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-4 h-auto"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Advanced Options</span>
                {!showAdvanced && (
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>
              {showAdvanced ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 pb-4 px-4">
              <div className="space-y-3 pt-3 border-t">
                <div>
                  <Label className="text-xs font-medium mb-2">Planning Detail Level</Label>
                  <Select value={planningMode} onValueChange={(value) => setPlanningMode(value as PlanningMode)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quick">
                        <div className="py-1">
                          <div className="font-medium">Quick</div>
                          <div className="text-xs text-muted-foreground">Plan phases / major milestones</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="standard">
                        <div className="py-1">
                          <div className="font-medium">Standard (Recommended)</div>
                          <div className="text-xs text-muted-foreground">Plan daily tasks</div>
                        </div>
                      </SelectItem>
                      <SelectItem value="detailed">
                        <div className="py-1">
                          <div className="font-medium">Detailed</div>
                          <div className="text-xs text-muted-foreground">Hour-by-hour for each team member</div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
