import { Booking, Expense, MonthlyStats } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    style: 'currency',
    currency: 'IQD',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string): string => {
return new Intl.DateTimeFormat('en-CA', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const generateBookingMessage = (booking: Booking): string => {
  const periodText = booking.period === 'morning' ? 'صباحي' : 
                    booking.period === 'evening' ? 'مسائي' : 'يوم كامل';
  
  const notesText = booking.notes ? `الملاحظات: ${booking.notes}` : '';

  return `
تأكيد الحجز لدى مزرعة DeeNoor
---------
التاريخ: ${formatDate(booking.date)}
الفترة: ${periodText}
الاسم: ${booking.customerName}
رقم الهاتف: ${booking.phoneNumber}
العنوان: ${booking.address}
${notesText}
تفاصيل الدفع:
المبلغ الكامل: ${formatCurrency(booking.totalAmount)}
المبلغ المدفوع: ${formatCurrency(booking.paidAmount)}
المبلغ المتبقي: ${formatCurrency(booking.remainingAmount)}
شكراً لثقتكم بنا
  `.trim();
};

export const calculateMonthlyStats = (
  bookings: Booking[],
  expenses: Expense[],
  year: number,
  month: number
): MonthlyStats => {
  const monthBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate.getFullYear() === year && bookingDate.getMonth() === month;
  });

  const monthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
  });

  const totalPaid = monthBookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const totalRemaining = monthBookings.reduce((sum, booking) => sum + booking.remainingAmount, 0);
  const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = totalPaid - totalExpenses;

  return {
    totalPaid,
    totalRemaining,
    totalExpenses,
    profit,
    bookingsCount: monthBookings.length,
    expensesCount: monthExpenses.length,
  };
};

export const calculateYearlyStats = (
  bookings: Booking[],
  expenses: Expense[],
  year: number
): MonthlyStats => {
  const yearBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return bookingDate.getFullYear() === year;
  });

  const yearExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getFullYear() === year;
  });

  const totalPaid = yearBookings.reduce((sum, booking) => sum + booking.paidAmount, 0);
  const totalRemaining = yearBookings.reduce((sum, booking) => sum + booking.remainingAmount, 0);
  const totalExpenses = yearExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = totalPaid - totalExpenses;

  return {
    totalPaid,
    totalRemaining,
    totalExpenses,
    profit,
    bookingsCount: yearBookings.length,
    expensesCount: yearExpenses.length,
  };
};

export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay();
};

export const months = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const weekDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];