
import React, { useMemo } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useRNN } from '@/context/RNNContext';
import OverviewCard from '@/components/dashboard/OverviewCard';
import BudgetOverview from '@/components/dashboard/BudgetOverview';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import GoalProgress from '@/components/dashboard/GoalProgress';
import FinancialAdvisor from '@/components/dashboard/FinancialAdvisor';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BrainCircuit, DollarSign, CreditCard, Target, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard: React.FC = () => {
  const { financialData } = useFinancial();
  const { isModelTrained, isTraining, trainModel } = useRNN();
  
  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const income = financialData.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = financialData.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBudget = financialData.budgets
      .reduce((sum, b) => sum + b.amount, 0);
    
    const totalSpent = financialData.budgets
      .reduce((sum, b) => sum + b.spent, 0);
    
    const savingsGoals = financialData.goals
      .reduce((sum, g) => sum + g.targetAmount, 0);
    
    const currentSavings = financialData.goals
      .reduce((sum, g) => sum + g.currentAmount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
      savingsGoals,
      currentSavings,
    };
  }, [financialData]);

  // Calculate month-over-month change (mocked for demo)
  const getRandomChange = () => {
    return ((Math.random() * 20) - 5).toFixed(1) + '%';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and insights
          </p>
        </div>
        
        <div className="flex gap-2">
          {!isModelTrained && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={trainModel}
              disabled={isTraining || financialData.transactions.length < 3}
              className="gap-2"
            >
              {isTraining ? (
                <Skeleton className="h-4 w-4 rounded-full" />
              ) : (
                <BrainCircuit className="h-4 w-4" />
              )}
              {isTraining ? 'Training...' : 'Train AI Model'}
            </Button>
          )}
          
          <Button asChild>
            <Link to="/transactions/new">Add Transaction</Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard
          title="Total Balance"
          value={`$${financialSummary.balance.toFixed(2)}`}
          change={getRandomChange()}
          isPositive={financialSummary.balance > 0}
          icon={<DollarSign className="h-5 w-5 text-budget-secondary" />}
        />
        <OverviewCard
          title="Monthly Income"
          value={`$${financialSummary.income.toFixed(2)}`}
          change={getRandomChange()}
          isPositive={true}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
        <OverviewCard
          title="Monthly Expenses"
          value={`$${financialSummary.expenses.toFixed(2)}`}
          change={getRandomChange()}
          isPositive={false}
          icon={<CreditCard className="h-5 w-5 text-red-500" />}
        />
        <OverviewCard
          title="Savings Progress"
          value={`$${financialSummary.currentSavings.toFixed(2)}`}
          change={`${((financialSummary.currentSavings / Math.max(financialSummary.savingsGoals, 1)) * 100).toFixed(0)}%`}
          isPositive={true}
          icon={<Target className="h-5 w-5 text-budget-accent" />}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetOverview budgets={financialData.budgets} />
        </div>
        <div className="space-y-6">
          <FinancialAdvisor />
          <RecentTransactions transactions={financialData.transactions} />
          <GoalProgress goals={financialData.goals} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
