
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Goal } from '@/types/budget';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
});

interface ContributeFormProps {
  goal: Goal;
  onSubmit: (id: string, amount: number) => void;
  onCancel: () => void;
}

const ContributeForm: React.FC<ContributeFormProps> = ({ goal, onSubmit, onCancel }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    onSubmit(goal.id, data.amount);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">{goal.title}</h3>
        <p className="text-sm text-muted-foreground">
          Current amount: ${goal.currentAmount.toFixed(2)} of ${goal.targetAmount.toFixed(2)}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contribution Amount</FormLabel>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add to Goal</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ContributeForm;
