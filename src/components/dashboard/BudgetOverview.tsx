
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Budget } from '@/types/budget';
import { cn } from '@/lib/utils';

interface BudgetOverviewProps {
  budgets: Budget[];
}

// Custom tooltip component for pie chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded shadow text-sm">
        <p className="font-medium">{data.category}</p>
        <p>{`$${data.spent.toFixed(2)} of $${data.amount.toFixed(2)}`}</p>
        <p>{`${((data.spent / data.amount) * 100).toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const BudgetOverview: React.FC<BudgetOverviewProps> = ({ budgets }) => {
  // Sort budgets by percentage spent (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount));
  
  // Format data for pie chart - only include budgets with spent > 0 to avoid graph issues
  const pieData = budgets
    .filter(budget => budget.spent > 0)
    .map((budget) => ({
      category: budget.category,
      amount: budget.amount,
      spent: budget.spent,
      value: budget.spent,
      color: budget.color,
    }));

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Pie Chart */}
          <div className="md:col-span-2 h-52">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    dataKey="value"
                    nameKey="category"
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No spending data available</p>
              </div>
            )}
          </div>
          
          {/* Budget Progress Bars */}
          <div className="md:col-span-3 space-y-4">
            {sortedBudgets.slice(0, 5).map((budget) => {
              const percentSpent = (budget.spent / budget.amount) * 100;
              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.category}</span>
                    <span>{`$${budget.spent.toFixed(2)} / $${budget.amount.toFixed(2)}`}</span>
                  </div>
                  <Progress 
                    value={percentSpent} 
                    className={cn(
                      "h-2",
                      percentSpent > 90 ? "bg-red-200" : "bg-gray-200"
                    )}
                    indicatorClassName={cn(
                      percentSpent > 90 ? "bg-red-500" : 
                      percentSpent > 75 ? "bg-amber-500" : 
                      "bg-budget-secondary"
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetOverview;
