import React, { useState } from 'react';
import { Plus, Receipt, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BridgetteAvatar from './BridgetteAvatar';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'medical' | 'education' | 'activities' | 'clothing' | 'other';
  date: Date;
  paidBy: 'mom' | 'dad';
  status: 'pending' | 'approved' | 'disputed' | 'paid';
  splitRatio: { mom: number; dad: number };
  receipt?: string;
}

const ExpenseTracker: React.FC = () => {
  const [expenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Soccer cleats and uniform',
      amount: 85.99,
      category: 'activities',
      date: new Date('2024-01-15'),
      paidBy: 'mom',
      status: 'approved',
      splitRatio: { mom: 50, dad: 50 },
      receipt: 'receipt1.jpg'
    },
    {
      id: '2',
      description: 'Dentist appointment',
      amount: 150.00,
      category: 'medical',
      date: new Date('2024-01-18'),
      paidBy: 'dad',
      status: 'pending',
      splitRatio: { mom: 50, dad: 50 }
    },
    {
      id: '3',
      description: 'School supplies',
      amount: 45.50,
      category: 'education',
      date: new Date('2024-01-20'),
      paidBy: 'mom',
      status: 'disputed',
      splitRatio: { mom: 50, dad: 50 }
    }
  ]);

  const categoryColors = {
    medical: 'bg-red-100 text-red-800',
    education: 'bg-blue-100 text-blue-800',
    activities: 'bg-green-100 text-green-800',
    clothing: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    disputed: 'bg-bridge-red text-white border-bridge-red',
    paid: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    disputed: AlertTriangle,
    paid: DollarSign
  };

  const getTotalOwed = (parentType: 'mom' | 'dad') => {
    return expenses
      .filter(expense => expense.paidBy !== parentType && expense.status === 'approved')
      .reduce((total, expense) => {
        const owedAmount = (expense.amount * expense.splitRatio[parentType]) / 100;
        return total + owedAmount;
      }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const disputedCount = expenses.filter(e => e.status === 'disputed').length;
  const pendingCount = expenses.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Bridgette Helper */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <BridgetteAvatar size="md" expression="encouraging" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">
                Hey Sarah, I'm here to help. Ask anything!
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Need help with expense tracking or splitting costs fairly? I've got you covered! 💰
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert for disputed expenses */}
      {disputedCount > 0 && (
        <Card className="border-2 border-bridge-red bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-bridge-red" />
              <div>
                <h3 className="font-semibold text-bridge-red">
                  {disputedCount} Disputed Expense{disputedCount > 1 ? 's' : ''} Need Resolution
                </h3>
                <p className="text-sm text-bridge-red">
                  Please review and resolve disputed expenses to maintain accurate records.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">You Owe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(getTotalOwed('mom'))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pending reimbursements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Owed to You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(getTotalOwed('dad'))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className={disputedCount > 0 ? "border-2 border-bridge-red" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Action Needed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${disputedCount > 0 ? 'text-bridge-red' : 'text-gray-900'}`}>
              {pendingCount + disputedCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {pendingCount} pending, {disputedCount} disputed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Expenses</CardTitle>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.map((expense) => {
              const StatusIcon = statusIcons[expense.status];
              const yourShare = (expense.amount * expense.splitRatio.mom) / 100;
              const partnerShare = (expense.amount * expense.splitRatio.dad) / 100;
              const isUrgent = expense.status === 'disputed' || expense.status === 'pending';

              return (
                <div 
                  key={expense.id} 
                  className={`border rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    expense.status === 'disputed' ? 'border-bridge-red bg-red-50' : 
                    expense.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium text-gray-900">{expense.description}</h3>
                        <Badge className={categoryColors[expense.category]}>
                          {expense.category}
                        </Badge>
                        <Badge className={`${statusColors[expense.status]} ${expense.status === 'disputed' ? 'animate-pulse' : ''}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {expense.status.toUpperCase()}
                        </Badge>
                        {isUrgent && (
                          <Badge className="bg-bridge-red text-white animate-pulse">
                            ACTION NEEDED
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Paid by: <span className="font-medium">{expense.paidBy === 'mom' ? 'You' : 'Partner'}</span></p>
                        <p>Date: {expense.date.toLocaleDateString()}</p>
                        <div className="flex items-center space-x-4">
                          <span>Your share: <span className="font-medium">{formatCurrency(yourShare)}</span></span>
                          <span>Partner share: <span className="font-medium">{formatCurrency(partnerShare)}</span></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </div>
                      {expense.receipt && (
                        <Button variant="outline" size="sm" className="mt-2">
                          <Receipt className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {expense.status === 'pending' && expense.paidBy !== 'mom' && (
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="default">Approve</Button>
                      <Button size="sm" variant="outline" className="border-bridge-red text-bridge-red hover:bg-red-50">
                        Dispute
                      </Button>
                    </div>
                  )}
                  
                  {expense.status === 'disputed' && (
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" className="bg-bridge-red hover:bg-red-600 text-white">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Resolve Dispute
                      </Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  )}
                  
                  {expense.status === 'approved' && expense.paidBy !== 'mom' && (
                    <div className="mt-3">
                      <Button size="sm">
                        <DollarSign className="w-4 h-4 mr-1" />
                        Mark as Paid
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseTracker;