import React, { useState } from 'react';
import { useFinancial } from '../context/FinancialContext';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';
import ContributeForm from '../components/goals/ContributeForm';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertCircle, Plus } from 'lucide-react';
import { Goal } from '../types/budget';
import { toast } from 'sonner';

const GoalsPage: React.FC = () => {
  const { financialData, addGoal, updateGoal, deleteGoal, predictGoalAchievement } = useFinancial();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | undefined>(undefined);
  
  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };
  
  const handleAddGoal = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedGoal(undefined);
  };
  
  const handleContributeDialogOpen = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsContributeDialogOpen(true);
  };
  
  const handleContributeDialogClose = () => {
    setIsContributeDialogOpen(false);
  };
  
  const handleFormSubmit = (data: Omit<Goal, 'id'> | Goal) => {
    if ('id' in data) {
      updateGoal(data as Goal);
    } else {
      addGoal(data);
    }
    handleDialogClose();
  };
  
  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
  };
  
  const handleContribute = (id: string, amount: number) => {
    const goal = financialData.goals.find(g => g.id === id);
    if (!goal) return;
    
    const updatedGoal = {
      ...goal,
      currentAmount: goal.currentAmount + amount
    };
    
    updateGoal(updatedGoal);
    setIsContributeDialogOpen(false);
    toast.success(`Added $${amount.toFixed(2)} to ${goal.title}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
          <p className="text-muted-foreground">
            Track progress towards your financial goals
          </p>
        </div>
        <Button onClick={handleAddGoal} className="gap-1">
          <Plus className="h-4 w-4" /> Add Goal
        </Button>
      </div>
      
      {financialData.goals.length === 0 ? (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>No goals yet</AlertTitle>
    <AlertDescription>
      Create your first savings goal to start tracking your progress
    </AlertDescription>
  </Alert>
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {financialData.goals.map((goal) => (
      <GoalCard
        key={goal.id}
        goal={goal}
        onEdit={handleEditGoal}
        onDelete={handleDeleteGoal}
        onContribute={handleContributeDialogOpen}
      />
    ))}
  </div>
)}

      
      {/* Goal Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedGoal ? 'Edit Goal' : 'Create Goal'}
            </DialogTitle>
          </DialogHeader>
          <GoalForm
            initialData={selectedGoal}
            onSubmit={handleFormSubmit}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
      
      {/* Contribute Form Dialog */}
      <Dialog open={isContributeDialogOpen} onOpenChange={setIsContributeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <ContributeForm
              goal={selectedGoal}
              onSubmit={handleContribute}
              onCancel={handleContributeDialogClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GoalsPage;
