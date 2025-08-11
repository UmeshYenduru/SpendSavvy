import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { saveToLocalStorage, loadFromLocalStorage, isLocalStorageAvailable } from '@/lib/localStorage';
import { Budget, Transaction, Goal, FinancialData } from '@/types/budget';
import { toast } from 'sonner';

// Sample colors for categories
export const CATEGORY_COLORS: Record<string, string> = {
  // Expense categories
  'Housing': '#3b82f6', // Blue
  'Food': '#22c55e', // Green
  'Transportation': '#f59e0b', // Amber
  'Entertainment': '#8b5cf6', // Purple
  'Shopping': '#ec4899', // Pink
  'Utilities': '#06b6d4', // Cyan
  'Healthcare': '#ef4444', // Red
  'Personal': '#64748b', // Slate
  'Education': '#0ea5e9', // Sky blue
  'Travel': '#84cc16', // Lime
  'Debt': '#d97706', // Amber dark
  'Savings': '#059669', // Emerald
  
  // Income categories
  'Salary': '#10b981', // Green
  'Freelance': '#0ea5e9', // Sky blue
  'Investment': '#6366f1', // Indigo
  'Gifts': '#f43f5e', // Rose
  'Refunds': '#a855f7', // Purple
  'Rental': '#0891b2', // Cyan dark
  'Business': '#f97316', // Orange
  'Other Income': '#6b7280', // Gray
  
  // General category
  'Income': '#10b981', // Green
  'Other': '#6b7280', // Gray
};

// Default categories
export const DEFAULT_EXPENSE_CATEGORIES = [
  'Housing', 'Food', 'Transportation', 'Entertainment', 'Shopping', 
  'Utilities', 'Healthcare', 'Personal', 'Education', 'Travel', 
  'Debt', 'Savings', 'Other'
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Investment', 'Gifts', 'Refunds', 
  'Rental', 'Business', 'Other Income'
];

export const DEFAULT_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

// Sample mock data
const defaultBudgets: Budget[] = [
  {
    id: '1',
    category: 'Housing',
    amount: 1500,
    spent: 1200,
    period: 'monthly',
    color: CATEGORY_COLORS['Housing'],
  },
  {
    id: '2',
    category: 'Food',
    amount: 500,
    spent: 450,
    period: 'monthly',
    color: CATEGORY_COLORS['Food'],
  },
  {
    id: '3',
    category: 'Transportation',
    amount: 300,
    spent: 280,
    period: 'monthly',
    color: CATEGORY_COLORS['Transportation'],
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Grocery shopping',
    amount: 85.75,
    category: 'Food',
    date: '2025-04-15',
    type: 'expense',
  },
  {
    id: '2',
    description: 'Monthly salary',
    amount: 3000,
    category: 'Income',
    date: '2025-04-01',
    type: 'income',
  },
  {
    id: '3',
    description: 'Electric bill',
    amount: 120,
    category: 'Utilities',
    date: '2025-04-10',
    type: 'expense',
  },
];

const defaultGoals: Goal[] = [
  {
    id: '1',
    title: 'Vacation Fund',
    targetAmount: 2000,
    currentAmount: 500,
    deadline: '2025-08-01',
    category: 'Travel',
    color: CATEGORY_COLORS['Travel'],
  },
  {
    id: '2',
    title: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 3500,
    deadline: '2025-12-31',
    category: 'Savings',
    color: CATEGORY_COLORS['Savings'],
  },
];

// Initial state
const initialFinancialData: FinancialData = {
  budgets: [],
  transactions: [],
  goals: [],
};

// Context type
interface FinancialContextType {
  financialData: FinancialData;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  resetToMockData: () => void;
  predictGoalAchievement: (goal: Goal) => number;
}

// Create context
const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Helper function to calculate budget spending from transactions
const calculateBudgetSpending = (budgets: Budget[], transactions: Transaction[]): Budget[] => {
  // Create a copy of budgets to work with
  const updatedBudgets = [...budgets];
  
  // Get current month's transactions only (expenses)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthExpenses = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return (
      transaction.type === 'expense' && 
      transactionDate.getMonth() === currentMonth && 
      transactionDate.getFullYear() === currentYear
    );
  });
  
  // Reset all budgets' spent amount to 0
  updatedBudgets.forEach(budget => {
    budget.spent = 0;
  });
  
  // Sum up expenses by category
  currentMonthExpenses.forEach(transaction => {
    const budget = updatedBudgets.find(b => b.category === transaction.category);
    if (budget) {
      budget.spent += transaction.amount;
    }
  });
  
  return updatedBudgets;
};

// Provider component
export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [financialData, setFinancialData] = useState<FinancialData>(initialFinancialData);
  const [isStorageAvailable, setIsStorageAvailable] = useState<boolean>(false);

  // Check if localStorage is available
  useEffect(() => {
    const available = isLocalStorageAvailable();
    setIsStorageAvailable(available);
    
    if (!available) {
      console.warn('localStorage is not available. Data will not persist between sessions.');
    }
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (isStorageAvailable) {
      const storedData = loadFromLocalStorage<FinancialData>('financialData', {
        budgets: defaultBudgets,
        transactions: defaultTransactions,
        goals: defaultGoals,
      });
      
      // Calculate budget spending based on transactions
      const budgetsWithSpending = calculateBudgetSpending(
        storedData.budgets, 
        storedData.transactions
      );
      
      setFinancialData({
        ...storedData,
        budgets: budgetsWithSpending
      });
      
      console.log('Loaded data from localStorage:', storedData);
    } else {
      // If localStorage isn't available, use the default data
      const defaultDataWithSpending = {
        budgets: calculateBudgetSpending(defaultBudgets, defaultTransactions),
        transactions: defaultTransactions,
        goals: defaultGoals,
      };
      
      setFinancialData(defaultDataWithSpending);
    }
  }, [isStorageAvailable]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (isStorageAvailable && financialData.budgets.length > 0) {
      saveToLocalStorage('financialData', financialData);
      console.log('Saved data to localStorage:', financialData);
    }
  }, [financialData, isStorageAvailable]);

  // Budget functions
  const addBudget = (budget: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
    };
    setFinancialData((prev) => ({
      ...prev,
      budgets: [...prev.budgets, newBudget],
    }));
    toast.success('Budget added successfully');
  };

  const updateBudget = (budget: Budget) => {
    setFinancialData((prev) => ({
      ...prev,
      budgets: prev.budgets.map((b) => (b.id === budget.id ? budget : b)),
    }));
    toast.success('Budget updated successfully');
  };

  const deleteBudget = (id: string) => {
    setFinancialData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.id !== id),
    }));
    toast.success('Budget deleted successfully');
  };

  // Transaction functions
  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: uuidv4(),
    };
    
    setFinancialData((prev) => {
      const newTransactions = [...prev.transactions, newTransaction];
      const updatedBudgets = calculateBudgetSpending(prev.budgets, newTransactions);
      
      return {
        ...prev,
        transactions: newTransactions,
        budgets: updatedBudgets,
      };
    });
    
    toast.success('Transaction added successfully');
  };

  const updateTransaction = (transaction: Transaction) => {
    setFinancialData((prev) => {
      const updatedTransactions = prev.transactions.map((t) => 
        (t.id === transaction.id ? transaction : t)
      );
      
      const updatedBudgets = calculateBudgetSpending(prev.budgets, updatedTransactions);
      
      return {
        ...prev,
        transactions: updatedTransactions,
        budgets: updatedBudgets,
      };
    });
    
    toast.success('Transaction updated successfully');
  };

  const deleteTransaction = (id: string) => {
    setFinancialData((prev) => {
      const filteredTransactions = prev.transactions.filter((t) => t.id !== id);
      const updatedBudgets = calculateBudgetSpending(prev.budgets, filteredTransactions);
      
      return {
        ...prev,
        transactions: filteredTransactions,
        budgets: updatedBudgets,
      };
    });
    
    toast.success('Transaction deleted successfully');
  };

  // Goal functions
  const addGoal = (goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
    };
    setFinancialData((prev) => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
    toast.success('Goal added successfully');
  };

  const updateGoal = (goal: Goal) => {
    setFinancialData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goal.id ? goal : g)),
    }));
    toast.success('Goal updated successfully');
  };

  const deleteGoal = (id: string) => {
    setFinancialData((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
    toast.success('Goal deleted successfully');
  };

  // Reset to mock data function
  const resetToMockData = () => {
    const resetData = {
      budgets: calculateBudgetSpending(defaultBudgets, defaultTransactions),
      transactions: defaultTransactions,
      goals: defaultGoals,
    };
    setFinancialData(resetData);
    if (isStorageAvailable) {
      saveToLocalStorage('financialData', resetData);
    }
    toast.success('Reset to default data successfully');
  };

  // Goal Achievement Prediction function
  const predictGoalAchievement = (goal: Goal): number => {
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const timeLeft = deadline.getTime() - now.getTime();
    if (timeLeft <= 0) {
      // Deadline passed
      return goal.currentAmount >= goal.targetAmount ? 100 : 0;
    }

    const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
    const amountLeft = goal.targetAmount - goal.currentAmount;
    if (amountLeft <= 0) {
      return 100;
    }

    // Estimate average daily saving rate based on current progress and elapsed time
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1); // Assume 1 year ago as start for estimation
    const elapsedDays = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const averageDailySaving = goal.currentAmount / elapsedDays;

    // Predict if goal is achievable
    const requiredDailySaving = amountLeft / daysLeft;
    const likelihood = Math.min(100, (averageDailySaving / requiredDailySaving) * 100);

    return Math.round(likelihood);
  };

  return (
    <FinancialContext.Provider
      value={{
        financialData,
        addBudget,
        updateBudget,
        deleteBudget,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addGoal,
        updateGoal,
        deleteGoal,
        resetToMockData,
        predictGoalAchievement,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

// Hook for using the financial context
export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

