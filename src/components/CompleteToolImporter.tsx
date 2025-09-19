import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { completeToolImportFromAssets } from '@/utils/completeToolImport';
import { CheckCircle, Upload } from 'lucide-react';

interface CompleteToolImporterProps {
  onComplete?: () => void;
}

export const CompleteToolImporter: React.FC<CompleteToolImporterProps> = ({ onComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleCompleteImport = async () => {
    try {
      setIsImporting(true);
      setIsComplete(false);
      setProgress(0);
      
      const success = await completeToolImportFromAssets((current, total, step) => {
        setProgress(current);
        setCurrentStep(step || '');
      });

      if (success) {
        setIsComplete(true);
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Complete Tool Import & Web Scraping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This will clear all existing tools and import the enhanced tool list with automatic variant detection, 
          web scraping for product models, and estimation of weight, cost, and rental lifespan.
        </p>
        
        {isImporting && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground">{currentStep}</p>
          </div>
        )}

        {isComplete && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800">
              Import completed successfully with web scraping initiated
            </span>
          </div>
        )}

        <Button 
          onClick={handleCompleteImport}
          disabled={isImporting}
          className="w-full"
          size="lg"
        >
          {isImporting ? 'Processing...' : 'Start Complete Import'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Clears existing tool data</p>
          <p>• Parses Excel file for tool variants</p>
          <p>• Creates database entries with proper relationships</p>
          <p>• Initiates web scraping for product models and pricing</p>
          <p>• Estimates weight, cost, and rental lifespan for each variant</p>
        </div>
      </CardContent>
    </Card>
  );
};