
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Budget } from '@/types/budget';

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget, onEdit, onDelete }) => {
  const percentSpent = (budget.spent / budget.amount) * 100;
  const remaining = budget.amount - budget.spent;
  
  return (
    <Card className="overflow-hidden">
      <div className="h-2" style={{ backgroundColor: budget.color }} />
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-medium text-lg">{budget.category}</h3>
            <p className="text-muted-foreground text-sm">{budget.period}</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(budget)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(budget.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>
              <span className="font-medium">${budget.spent.toFixed(2)}</span> of ${budget.amount.toFixed(2)}
            </span>
            <span className={`font-medium ${percentSpent > 90 ? 'text-red-500' : ''}`}>
              {percentSpent.toFixed(0)}%
            </span>
          </div>
          
          <Progress 
            value={percentSpent} 
            className={percentSpent > 90 ? "bg-red-100" : "bg-gray-100"}
            style={{ 
              background: percentSpent > 90 ? "#fee2e2" : "#f3f4f6",
              backgroundColor: percentSpent > 90 ? "#fee2e2" : "#f3f4f6",
              "--progress-indicator-color": percentSpent <= 75 ? budget.color : 
                percentSpent > 90 ? "#ef4444" : "#f59e0b"
            } as React.CSSProperties} 
          />
          
          <p className={`text-sm ${remaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {remaining < 0 
              ? `Over budget by $${Math.abs(remaining).toFixed(2)}` 
              : `$${remaining.toFixed(2)} remaining`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetCard;
