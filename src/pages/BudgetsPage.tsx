
import React, { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import BudgetCard from '@/components/budgets/BudgetCard';
import BudgetForm from '@/components/budgets/BudgetForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { Budget } from '@/types/budget';

const BudgetsPage: React.FC = () => {
  const { financialData, addBudget, updateBudget, deleteBudget } = useFinancial();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  
  const handleEditBudget = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDialogOpen(true);
  };
  
  const handleAddBudget = () => {
    setSelectedBudget(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedBudget(undefined);
  };
  
  const handleFormSubmit = (data: Omit<Budget, 'id'> | Budget) => {
    if ('id' in data) {
      updateBudget(data as Budget);
    } else {
      addBudget(data);
    }
    handleDialogClose();
  };
  
  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Manage your budget allocations
          </p>
        </div>
        <Button onClick={handleAddBudget} className="gap-1">
          <Plus className="h-4 w-4" /> Add Budget
        </Button>
      </div>
      
      {financialData.budgets.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No budgets yet</AlertTitle>
          <AlertDescription>
            Create your first budget to start tracking your expenses
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialData.budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBudget ? 'Edit Budget' : 'Create Budget'}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm
            initialData={selectedBudget}
            onSubmit={handleFormSubmit}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BudgetsPage;
