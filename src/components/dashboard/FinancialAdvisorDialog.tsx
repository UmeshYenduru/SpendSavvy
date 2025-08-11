import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Lightbulb, Send } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { toast } from 'sonner';

const API_KEY = 'Your-open-router-api-key';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface FinancialAdvisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FinancialAdvisorDialog: React.FC<FinancialAdvisorDialogProps> = ({ open, onOpenChange }) => {
  const { financialData } = useFinancial();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content:
            "Hi there! I'm your financial advisor. How can I help you today? You can ask about budgeting, saving tips, or get insights on your spending habits.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const financialContext = {
      totalIncome: financialData.transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: financialData.transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      topExpenseCategories: getTopExpenseCategories(),
      budgetStatus: financialData.budgets.map(
        (b) => `${b.category}: ${((b.spent / b.amount) * 100).toFixed(0)}% used`
      ),
      savingsGoals: financialData.goals.map(
        (g) => `${g.title}: ${((g.currentAmount / g.targetAmount) * 100).toFixed(0)}% achieved`
      ),
    };

    try {
      const contextString = `
        Total Income: $${financialContext.totalIncome.toFixed(2)}
        Total Expenses: $${financialContext.totalExpenses.toFixed(2)}
        Top Expense Categories: ${financialContext.topExpenseCategories.join(', ')}
        Budget Status: ${financialContext.budgetStatus.join(', ')}
        Savings Goals: ${financialContext.savingsGoals.join(', ')}
      `;

      console.log('Sending request to OpenRouter API with body:', {
        model: 'mistralai/mixtral-8x7b',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful financial advisor. Use the financial data provided to give personalized, clear, and actionable responses.',
          },
          {
            role: 'user',
            content: `Here is my financial data:\n${contextString}`,
          },
          {
            role: 'user',
            content: input,
          },
        ],
      });

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful financial advisor. Use the financial data provided to give personalized, clear, and actionable responses.',
            },
            {
              role: 'user',
              content: `Here is my financial data:\n${contextString}`,
            },
            {
              role: 'user',
              content: input,
            },
          ],
        }),
      });

      console.log('OpenRouter API response status:', res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error('OpenRouter API error response:', errorText);
        throw new Error('Failed to fetch from OpenRouter API');
      }

      const data = await res.json();
      console.log('OpenRouter API response data:', data);

      const reply = data.choices?.[0]?.message?.content || "I'm not sure how to respond to that.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('API error:', error);
      toast.error('Failed to get a response. Please try again later.');

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error while processing your request.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTopExpenseCategories = () => {
    const expensesByCategory: Record<string, number> = {};

    financialData.transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    return Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl h-[80vh] max-h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <div className="flex items-center">
            <Avatar className="h-8 w-8 bg-budget-secondary/20 mr-2">
              <AvatarFallback>
                <Lightbulb className="h-4 w-4 text-budget-secondary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle>Financial Advisor</DialogTitle>
              <DialogDescription className="text-xs">
                AI-powered financial guidance with enhanced capabilities
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your finances..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1 px-2">Using enhanced AI capabilities</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialAdvisorDialog;

