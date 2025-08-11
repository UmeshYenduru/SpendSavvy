
import React, { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { useRNN } from '@/context/RNNContext';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionForm from '@/components/transactions/TransactionForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DEFAULT_CATEGORIES } from '@/context/FinancialContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Plus, BrainCircuit, Search, Filter } from 'lucide-react';
import { Transaction } from '@/types/budget';
import { useNavigate, useLocation } from 'react-router-dom';

const TransactionsPage: React.FC = () => {
  const { financialData, addTransaction, updateTransaction, deleteTransaction } = useFinancial();
  const { isModelTrained, isTraining, trainModel } = useRNN();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all-categories');
  const [typeFilter, setTypeFilter] = useState('all-types');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    // Check if we should open the dialog for a new transaction
    if (location.pathname === '/transactions/new') {
      setSelectedTransaction(undefined);
      setIsDialogOpen(true);
    }
  }, [location]);
  
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };
  
  const handleAddTransaction = () => {
    setSelectedTransaction(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedTransaction(undefined);
    // Remove the /new path segment if it exists
    if (location.pathname === '/transactions/new') {
      navigate('/transactions');
    }
  };
  
  const handleFormSubmit = (data: Omit<Transaction, 'id'> | Transaction) => {
    if ('id' in data) {
      updateTransaction(data as Transaction);
    } else {
      addTransaction(data);
    }
    handleDialogClose();
  };
  
  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };
  
  // Filter transactions based on search and filters
  const filteredTransactions = financialData.transactions.filter((transaction) => {
    const matchesSearch = searchTerm === '' || 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all-categories' || 
      transaction.category === categoryFilter;
    
    const matchesType = typeFilter === 'all-types' || 
      transaction.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });
  
  // Sort by date (newest first)
  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex gap-2">
          {!isModelTrained && (
            <Button 
              variant="outline" 
              onClick={trainModel}
              disabled={isTraining || financialData.transactions.length < 3}
              className="gap-1"
            >
              <BrainCircuit className="h-4 w-4" />
              {isTraining ? 'Training...' : 'Train AI Model'}
            </Button>
          )}
          <Button onClick={handleAddTransaction} className="gap-1">
            <Plus className="h-4 w-4" /> Add Transaction
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center relative flex-1">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="w-40">
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                {DEFAULT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-40">
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Type" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Transaction List */}
      {financialData.transactions.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No transactions yet</AlertTitle>
          <AlertDescription>
            Add your first transaction to start tracking your finances
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <TransactionList
            transactions={sortedTransactions}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
          />
          
          {sortedTransactions.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No transactions found matching your filters
            </div>
          )}
        </>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm
            initialData={selectedTransaction}
            onSubmit={handleFormSubmit}
            onCancel={handleDialogClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
