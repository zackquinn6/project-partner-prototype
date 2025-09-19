import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { clearAndImportToolsFromFile } from '@/utils/directToolImport';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface DirectToolImporterProps {
  onComplete?: () => void;
}

export const DirectToolImporter: React.FC<DirectToolImporterProps> = ({ onComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setProgress(0);
      
      // Load the Excel file from assets
      const response = await fetch('/src/assets/enhanced-tool-list.xlsx');
      const blob = await response.blob();
      const file = new File([blob], 'enhanced-tool-list.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const success = await clearAndImportToolsFromFile(file, (current, total, step) => {
        setProgress(current);
        setCurrentStep(step || '');
      });

      if (success) {
        onComplete?.();
      }
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsImporting(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Direct Tool Import</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will clear all existing tools and import the enhanced tool list with proper variants.
        </p>
        
        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{currentStep}</p>
          </div>
        )}

        <Button 
          onClick={handleImport}
          disabled={isImporting}
          className="w-full"
        >
          {isImporting ? 'Importing...' : 'Clear & Import Tools'}
        </Button>
      </CardContent>
    </Card>
  );
};