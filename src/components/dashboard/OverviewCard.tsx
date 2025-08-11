
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';

interface OverviewCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon = <DollarSign className="h-5 w-5 text-budget-secondary" />,
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <div className="flex items-center mt-1">
            {isPositive ? (
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
            )}
            <p className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {change}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OverviewCard;
