
import React, { useState, useEffect } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useRNN } from '@/context/RNNContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { BrainCircuit, Save, Database, Download, Cloud, Key } from 'lucide-react';
import { toast } from 'sonner';
import { loadFromLocalStorage, saveToLocalStorage } from '@/lib/localStorage';

const SettingsPage: React.FC = () => {
  const { resetToMockData } = useFinancial();
  const { isModelTrained, isTraining, trainModel } = useRNN();
  const [aiApiKey, setAiApiKey] = useState('');
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = loadFromLocalStorage('ai_api_key', '');
    setAiApiKey(savedApiKey);
  }, []);
  
  const handleSaveApiKey = () => {
    saveToLocalStorage('ai_api_key', aiApiKey);
    toast.success('API key saved successfully');
  };
  
  const handleExportData = () => {
    try {
      const data = localStorage.getItem('financialData');
      if (!data) {
        toast.error('No data to export');
        return;
      }
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `budget-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };
  
  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data to demo values? This cannot be undone.')) {
      resetToMockData();
      toast.success('Data reset to demo values');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application settings
        </p>
      </div>
      
      <div className="grid gap-6">
        {/* AI API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              AI API Configuration
            </CardTitle>
            <CardDescription>
              Configure your AI assistant API key
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <h4 className="font-medium">API Key</h4>
              <p className="text-sm text-muted-foreground">
                Enter your AI service API key to enable enhanced financial insights
              </p>
              <div className="flex gap-2">
                <Input 
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder="Enter your API key"
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey}>Save Key</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* AI Model Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              AI Model Settings
            </CardTitle>
            <CardDescription>
              Configure the behavior of the AI classification model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Automatic Category Prediction</h4>
                <p className="text-sm text-muted-foreground">
                  Let AI suggest categories for new transactions
                </p>
              </div>
              <Switch checked={isModelTrained} disabled={!isModelTrained} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Model Status</h4>
                <p className="text-sm text-muted-foreground">
                  {isModelTrained 
                    ? 'Model is trained and ready to use' 
                    : isTraining 
                      ? 'Model is currently training...' 
                      : 'Model needs to be trained'}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={trainModel}
                disabled={isTraining}
              >
                {isTraining ? 'Training...' : 'Train Model'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export, import, or reset your financial data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download all your financial data as a JSON file
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData} className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Reset to Demo Data</h4>
                <p className="text-sm text-muted-foreground">
                  Reset all data to demo values (cannot be undone)
                </p>
              </div>
              <Button variant="destructive" onClick={handleResetData}>
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Cloud Sync (Mocked - For future implementation) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Cloud Sync
            </CardTitle>
            <CardDescription>
              Sync your data across devices (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable Cloud Sync</h4>
                <p className="text-sm text-muted-foreground">
                  This feature is coming soon
                </p>
              </div>
              <Switch disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
