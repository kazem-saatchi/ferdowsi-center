// components/transactions/BankTransactionTable.tsx
'use client'; // This component uses hooks (useQuery) indirectly via its parent

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'; // Adjust import path as needed
import { Badge } from '@/components/ui/badge'; // For displaying type/category
import { BankTransaction, TransactionType, TransactionCategory } from '@prisma/client';
import { format } from 'date-fns'; // For date formatting
import { labels } from '@/utils/label';

// Helper function for currency formatting
const formatCurrency = (amount: number) => {
  // Assuming amount is in the smallest unit (like cents or rials)
  // Adjust the divisor and locale as needed for your currency
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD', // Change to your currency (e.g., 'IRR')
    minimumFractionDigits: 0, // Adjust if you store fractional units
  }).format(amount / 100); // Divide by 100 if amount is in cents/rials
};

// Helper to get display text for enums (optional, but good for readability)
const getCategoryText = (category: TransactionCategory | null) => {
    if (!category) return 'N/A';
    // Simple mapping, you might want a more robust solution
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

interface BankTransactionTableProps {
  transactions: BankTransaction[];
  isLoading: boolean;
  isError: boolean;
}

export function BankTransactionTable({
  transactions,
  isLoading,
  isError,
}: BankTransactionTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-4">
        <p>Loading transactions...</p>
        {/* You could add Skeleton loaders here for a better UX */}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-4 text-red-600">
        <p>Error loading transactions.</p>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="rounded-md border p-4">
        <p>No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border"> {/* Added border and rounding */}
      <Table dir='rtl'>
        <TableCaption>A list of your recent bank transactions.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] text-center">{labels.date}</TableHead>
            <TableHead className='text-right'>{labels.description}</TableHead>
            <TableHead className='text-center'>{labels.category}</TableHead>
            <TableHead className='text-center'>{labels.type}</TableHead>
            <TableHead className="text-right">{labels.amount}</TableHead>
            <TableHead className="text-right">{labels.balance}</TableHead>
            {/* Add other relevant columns if needed:
            <TableHead>Reference</TableHead>
            <TableHead>Bank Ref ID</TableHead>
            */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                {format(new Date(tx.date), 'yyyy-MM-dd')} {/* Format date */}
              </TableCell>
              <TableCell>{tx.description}</TableCell>
              <TableCell>
                {tx.category ? (
                    <Badge variant="outline">{getCategoryText(tx.category)}</Badge>
                ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    tx.type === TransactionType.INCOME ? 'default' : 'secondary'
                  }
                  className={
                    tx.type === TransactionType.INCOME
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : tx.type === TransactionType.PAYMENT
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : ''
                  }
                >
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-semibold ${
                  tx.type === TransactionType.INCOME
                    ? 'text-green-600 dark:text-green-400'
                    : tx.type === TransactionType.PAYMENT
                    ? 'text-red-600 dark:text-red-500'
                    : ''
                }`}
              >
                {tx.type === TransactionType.PAYMENT ? '-' : '+'}
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(tx.balance)}
              </TableCell>
               {/* Add other relevant cells if needed */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}