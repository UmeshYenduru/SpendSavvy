
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_INCOME_CATEGORIES, 
  CATEGORY_COLORS 
} from '@/context/FinancialContext';
import { Transaction } from '@/types/budget';
import { useRNN } from '@/context/RNNContext';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  description: z.string().min(2, { message: 'Description is required' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  category: z.string().min(1, { message: 'Category is required' }),
  date: z.string().min(1, { message: 'Date is required' }),
  type: z.enum(['income', 'expense']),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id'> | Transaction) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const { predictCategory, isModelTrained } = useRNN();
  const [isPredicting, setIsPredicting] = useState(false);
  
  const today = new Date().toISOString().split('T')[0];
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { ...initialData }
      : {
          description: '',
          amount: 0,
          category: '',
          date: today,
          type: 'expense',
        },
  });

  const description = form.watch('description');
  const transactionType = form.watch('type');
  
  // Reset category when transaction type changes
  useEffect(() => {
    if (!initialData) {
      form.setValue('category', '');
    }
  }, [transactionType, form, initialData]);
  
  // Predict category when description changes
  useEffect(() => {
    const predictTransactionCategory = async () => {
      if (description && description.length > 3 && isModelTrained && !initialData && transactionType === 'expense') {
        setIsPredicting(true);
        try {
          const category = await predictCategory(description);
          if (category && DEFAULT_EXPENSE_CATEGORIES.includes(category)) {
            form.setValue('category', category);
          }
        } catch (error) {
          console.error('Error predicting category:', error);
        } finally {
          setIsPredicting(false);
        }
      }
    };

    // Use a debounce to avoid too many predictions
    const timer = setTimeout(predictTransactionCategory, 500);
    return () => clearTimeout(timer);
  }, [description, isModelTrained, predictCategory, form, initialData, transactionType]);

  const handleSubmit = (data: FormData) => {
    // Ensure all required fields are present
    const transactionData: Transaction | Omit<Transaction, 'id'> = {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date,
      type: data.type,
      ...(initialData && { id: initialData.id }),
    };
    
    onSubmit(transactionData);
  };

  // Get the appropriate categories based on transaction type
  const availableCategories = transactionType === 'income' 
    ? DEFAULT_INCOME_CATEGORIES 
    : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Grocery shopping" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Category
                {isPredicting && <Loader2 className="h-3 w-3 animate-spin" />}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[category] }}
                          />
                          {category}
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {isModelTrained && transactionType === 'expense' && (
                <FormDescription>
                  Categories are automatically suggested based on the description
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? 'Update Transaction' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TransactionForm;
