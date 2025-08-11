
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/types/budget';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoalProgressProps {
  goals: Goal[];
}

const GoalProgress: React.FC<GoalProgressProps> = ({ goals }) => {
  // Sort goals by progress percentage (highest first)
  const sortedGoals = [...goals]
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
    .slice(0, 3);
  
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Goals Progress</CardTitle>
        <Link 
          to="/goals" 
          className="text-sm text-budget-secondary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {sortedGoals.length > 0 ? (
          <div className="space-y-6">
            {sortedGoals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysLeft = calculateDaysLeft(goal.deadline);
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm font-medium">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="h-2" 
                    style={{ 
                      "--progress-indicator-color": goal.color
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {daysLeft > 0 
                          ? `${daysLeft} days left` 
                          : 'Deadline passed'}
                      </span>
                    </div>
                    <span>
                      ${goal.currentAmount.toFixed(0)} of ${goal.targetAmount.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <p>No goals available</p>
            <Link 
              to="/goals" 
              className="text-sm text-budget-secondary hover:underline mt-2 block"
            >
              Create a goal
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalProgress;
