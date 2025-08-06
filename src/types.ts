export interface Booking {
  id: string;
  date: string;
  period: 'morning' | 'evening' | 'both';
  customerName: string;
  phoneNumber: string;
  address: string;
  notes?: string; // حقل اختياري للملاحظات
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface DayBooking {
  morning?: Booking;
  evening?: Booking;
}

export interface MonthlyStats {
  totalPaid: number;
  totalRemaining: number;
  totalExpenses: number;
  profit: number;
  bookingsCount: number;
  expensesCount: number;
}