import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus, Target, Calendar } from 'lucide-react';
import { Goal } from '@/types/budget';
import { useFinancial } from '@/context/FinancialContext';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onContribute: (goal: Goal) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onContribute }) => {
  const { predictGoalAchievement } = useFinancial();

  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;
  const achievementLikelihood = predictGoalAchievement(goal);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft(goal.deadline);
  
  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: goal.color }} />
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-lg">{goal.title}</h3>
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Target className="h-3 w-3" />
              <span>{goal.category}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>
                <span className="font-medium">${goal.currentAmount.toFixed(2)}</span> of ${goal.targetAmount.toFixed(2)}
              </span>
              <span className="font-medium">
                {progress.toFixed(0)}%
              </span>
            </div>
            
            <Progress 
              value={progress} 
              className="h-2"
              style={{ 
                '--progress-indicator-color': goal.color 
              } as React.CSSProperties} 
            />
            
            <p className="text-sm text-muted-foreground">
              ${remaining.toFixed(2)} more to reach your goal
            </p>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {daysLeft > 0 
                  ? `${daysLeft} days left (${formatDate(goal.deadline)})` 
                  : `Deadline passed (${formatDate(goal.deadline)})`}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Target className="h-3 w-3" />
              <span>
                Goal Achievement Likelihood: {achievementLikelihood}%
              </span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => onContribute(goal)}
            className="gap-1 mt-2"
          >
            <Plus className="h-3 w-3" /> Add funds
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;

