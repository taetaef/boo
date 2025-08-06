import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Expense, Booking } from '../types';
import { formatCurrency, calculateMonthlyStats, calculateYearlyStats, months } from '../utils';
import ExpenseModal from './ExpenseModal';

interface AccountsProps {
  expenses: Expense[];
  bookings: Booking[];
  onAddExpense: (expense: Expense) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const Accounts: React.FC<AccountsProps> = ({
  expenses,
  bookings,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const monthlyStats = useMemo(
    () => calculateMonthlyStats(bookings, expenses, selectedYear, selectedMonth),
    [bookings, expenses, selectedYear, selectedMonth]
  );

  const yearlyStats = useMemo(
    () => calculateYearlyStats(bookings, expenses, selectedYear),
    [bookings, expenses, selectedYear]
  );

  const monthlyExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() === selectedMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, selectedYear, selectedMonth]);

  const handleExpenseSave = (expense: Expense) => {
    if (editingExpense) {
      onUpdateExpense(expense);
    } else {
      onAddExpense(expense);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    [...bookings, ...expenses].forEach(item => {
      const date = new Date('date' in item ? item.date : item.createdAt);
      years.add(date.getFullYear());
    });
    years.add(new Date().getFullYear());
    return Array.from(years).sort((a, b) => b - a);
  }, [bookings, expenses]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-white-125 border-b">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">الحسابات</h2>
        <button
          onClick={() => {
            setEditingExpense(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-2 bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus size={14} className="sm:size-16" />
          إضافة مصروف
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-4">
        {/* Date Filters */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">السنة</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">الشهر</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Monthly Stats */}
          <div className="bg-blue-50 p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">الإحصائيات الشهرية</h3>
              <Calendar className="text-blue-500" size={16} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المدفوع:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(monthlyStats.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المتبقي:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(monthlyStats.totalRemaining)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المصاريف:</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(monthlyStats.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-xs font-semibold text-gray-500">الربح:</span>
                <span className={`text-sm font-bold ${monthlyStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(monthlyStats.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Yearly Stats */}
          <div className="bg-blue-100 p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">الإحصائيات السنوية</h3>
              <TrendingUp className="text-purple-500" size={16} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المدفوع:</span>
                <span className="text-sm font-semibold text-green-600">
                  {formatCurrency(yearlyStats.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المتبقي:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {formatCurrency(yearlyStats.totalRemaining)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-gray-500">المصاريف:</span>
                <span className="text-sm font-semibold text-red-600">
                  {formatCurrency(yearlyStats.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-xs font-semibold text-gray-500">الربح:</span>
                <span className={`text-sm font-bold ${yearlyStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(yearlyStats.profit)}
                </span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-green-500 to-green-500 p-4 sm:p-6 rounded-lg text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium opacity-90">إجمالي الإيرادات</h3>
              <DollarSign size={16} />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(monthlyStats.totalPaid + monthlyStats.totalRemaining)}
            </div>
            <div className="text-xs opacity-75">
              {monthlyStats.bookingsCount} حجز هذا الشهر
            </div>
          </div>

          {/* Net Profit */}
          <div className={`p-4 sm:p-6 rounded-lg text-white ${
            monthlyStats.profit >= 0 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium opacity-90">صافي الربح</h3>
              {monthlyStats.profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {formatCurrency(monthlyStats.profit)}
            </div>
            <div className="text-xs opacity-75">
              {monthlyStats.expensesCount} مصروف هذا الشهر
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div className="bg-white-250 rounded-lg shadow-sm border">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              مصاريف {months[selectedMonth]} {selectedYear}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            {monthlyExpenses.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      اسم المصروف
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المبلغ
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {expense.name}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-red-600 font-semibold">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString('en-CA')}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
                                onDeleteExpense(expense.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                لا توجد مصاريف لهذا الشهر
              </div>
            )}
          </div>
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleExpenseSave}
        existingExpense={editingExpense}
      />
    </div>
  );
};

export default Accounts;