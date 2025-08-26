import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, RotateCcw, Search, GitBranch, HelpCircle, Info } from 'lucide-react';

const flowTypes = [
  {
    value: 'prime',
    label: 'Prime',
    icon: CheckCircle,
    color: 'bg-green-500',
    description: 'Required one-time step - must be 100% complete to proceed',
    progress: 'Binary: 0% until complete, then 100%'
  },
  {
    value: 'repeat',
    label: 'Repeat', 
    icon: RotateCcw,
    color: 'bg-blue-500',
    description: 'Can be partially completed and updated over time',
    progress: 'Incremental: 20%, 50%, 80%, etc.'
  },
  {
    value: 'inspection',
    label: 'Inspection',
    icon: Search,
    color: 'bg-orange-500', 
    description: 'Quality check that ensures standards are met',
    progress: 'Pass/fail - may loop back for rework'
  },
  {
    value: 'alternate',
    label: 'Alternate',
    icon: GitBranch,
    color: 'bg-purple-500',
    description: 'Choose one path from several options',
    progress: 'Only selected branch executes'
  },
  {
    value: 'if-necessary',
    label: 'If Necessary',
    icon: HelpCircle,
    color: 'bg-gray-500',
    description: 'Conditional step - only appears when criteria met',
    progress: 'Skipped if condition not met'
  }
];

interface FlowTypeLegendProps {
  compact?: boolean;
  showDescriptions?: boolean;
}

export const FlowTypeLegend: React.FC<FlowTypeLegendProps> = ({ 
  compact = false, 
  showDescriptions = true 
}) => {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {flowTypes.map((type) => (
          <div key={type.value} className="flex items-center gap-1 text-xs" title={type.description}>
            <div className={`w-2 h-2 rounded-full ${type.color}`} />
            <type.icon className="w-3 h-3" />
            <span>{type.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="w-4 h-4" />
          Workflow Step Types
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flowTypes.map((type) => (
          <div key={type.value} className="flex items-start gap-3 p-2 rounded-md bg-muted/30">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-3 h-3 rounded-full ${type.color} flex-shrink-0`} />
              <type.icon className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium text-sm">{type.label}</span>
            </div>
            
            {showDescriptions && (
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">{type.description}</div>
                <div className="text-xs text-muted-foreground mt-1 opacity-75">
                  <strong>Progress:</strong> {type.progress}
                </div>
              </div>
            )}
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Why this matters:</strong> Step types help you understand the workflow logic, 
            track progress accurately, and identify potential process improvements.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const getStepIcon = (flowType?: string, className: string = "w-4 h-4") => {
  const type = flowTypes.find(t => t.value === flowType);
  if (!type) return null;
  
  const IconComponent = type.icon;
  return <IconComponent className={className} />;
};

export const getStepIndicator = (flowType?: string) => {
  const type = flowTypes.find(t => t.value === flowType);
  if (!type) return null;
  
  return (
    <div className="flex items-center gap-1" title={`${type.label}: ${type.description}`}>
      <div className={`w-2 h-2 rounded-full ${type.color}`} />
      <type.icon className="w-3 h-3" />
    </div>
  );
};