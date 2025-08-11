
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFinancial } from '@/context/FinancialContext';
import { useRNN } from '@/context/RNNContext';
import { 
  Lightbulb, 
  ArrowRight, 
  Loader2, 
  TrendingDown, 
  PiggyBank, 
  CreditCard, 
  BadgeAlert,
  MessageSquare
} from 'lucide-react';
import FinancialAdvisorDialog from './FinancialAdvisorDialog';

type Advice = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionUrl?: string;
};

const FinancialAdvisor: React.FC = () => {
  const { financialData } = useFinancial();
  const { isModelTrained } = useRNN();
  const [advices, setAdvices] = useState<Advice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Generate advice based on financial data
  const generateAdvice = () => {
    setIsGenerating(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const newAdvices: Advice[] = [];
      
      // Check for overspending in categories
      const overspentBudgets = financialData.budgets.filter(budget => 
        budget.spent > budget.amount
      );
      
      if (overspentBudgets.length > 0) {
        newAdvices.push({
          id: 'overspending',
          title: 'Budget Alert',
          description: `You've exceeded your budget in ${overspentBudgets.length} categor${overspentBudgets.length === 1 ? 'y' : 'ies'}: ${overspentBudgets.map(b => b.category).join(', ')}. Consider adjusting your spending habits.`,
          icon: <BadgeAlert className="h-5 w-5 text-red-500" />,
          action: 'Review Budgets',
          actionUrl: '/budgets'
        });
      }
      
      // Check savings rate
      const income = financialData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = financialData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      
      if (savingsRate < 20 && income > 0) {
        newAdvices.push({
          id: 'savings-rate',
          title: 'Savings Opportunity',
          description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
          icon: <PiggyBank className="h-5 w-5 text-budget-secondary" />,
          action: 'Set a Savings Goal',
          actionUrl: '/goals'
        });
      }
      
      // Check largest expense category
      const expensesByCategory: Record<string, number> = {};
      financialData.transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
      
      if (Object.keys(expensesByCategory).length > 0) {
        const largestCategory = Object.entries(expensesByCategory)
          .sort((a, b) => b[1] - a[1])[0];
        
        const percentOfTotal = expenses > 0 ? (largestCategory[1] / expenses) * 100 : 0;
        
        if (percentOfTotal > 30) {
          newAdvices.push({
            id: 'large-expense',
            title: 'Spending Distribution',
            description: `${largestCategory[0]} represents ${percentOfTotal.toFixed(1)}% of your total expenses. Consider if you can reduce spending in this category.`,
            icon: <TrendingDown className="h-5 w-5 text-amber-500" />
          });
        }
      }
      
      // Check for recurring expense opportunities
      if (financialData.transactions.filter(t => t.type === 'expense').length > 5) {
        newAdvices.push({
          id: 'subscriptions',
          title: 'Subscription Review',
          description: 'Consider reviewing your recurring subscriptions. You might find services you no longer use or could downgrade.',
          icon: <CreditCard className="h-5 w-5 text-budget-accent" />
        });
      }
      
      // AI model training suggestion
      if (!isModelTrained && financialData.transactions.length >= 3) {
        newAdvices.push({
          id: 'train-ai',
          title: 'Enable Smart Categorization',
          description: 'Train the AI model to automatically categorize your transactions based on their descriptions.',
          icon: <Lightbulb className="h-5 w-5 text-indigo-500" />,
          action: 'Train AI',
          actionUrl: '/'
        });
      }
      
      // If we have no specific advice, provide a generic one
      if (newAdvices.length === 0) {
        newAdvices.push({
          id: 'generic',
          title: 'Financial Health',
          description: 'Continue tracking your expenses and income regularly. Consistent monitoring is key to financial success.',
          icon: <Lightbulb className="h-5 w-5 text-green-500" />
        });
      }
      
      setAdvices(newAdvices);
      setCurrentAdviceIndex(0);
      setIsGenerating(false);
    }, 1500);
  };
  
  // Generate advice on component mount
  useEffect(() => {
    if (financialData.transactions.length > 0) {
      generateAdvice();
    }
  }, []);
  
  // Cycle through available advice
  const showNextAdvice = () => {
    setCurrentAdviceIndex((prevIndex) => 
      prevIndex === advices.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const currentAdvice = advices[currentAdviceIndex];

  return (
    <>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Financial Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-8 w-8 text-budget-secondary animate-spin mb-2" />
              <p className="text-muted-foreground text-sm">Analyzing your financial data...</p>
            </div>
          ) : advices.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{currentAdvice.icon}</div>
                <div>
                  <h3 className="font-medium">{currentAdvice.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentAdvice.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">No advice available yet. Add more financial data to get personalized insights.</p>
              <Button onClick={generateAdvice} size="sm">
                Generate Advice
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between pt-0">
          {currentAdvice?.action ? (
            <Button variant="outline" size="sm" asChild>
              <a href={currentAdvice.actionUrl}>
                {currentAdvice.action}
              </a>
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-2">
            {advices.length > 1 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={showNextAdvice}
                className="gap-1"
              >
                Next Tip
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setDialogOpen(true)}
              className="gap-1"
            >
              <MessageSquare className="h-3 w-3" />
              Chat
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <FinancialAdvisorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export default FinancialAdvisor;
