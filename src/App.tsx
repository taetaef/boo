import React, { useState } from 'react';
import { CalendarDays, Calculator } from 'lucide-react';
import Calendar from './components/Calendar';
import Accounts from './components/Accounts';
import { useStorage } from './hooks/useStorage';

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'accounts'>('calendar');
  const {
    bookings,
    expenses,
    addBooking,
    updateBooking,
    deleteBooking,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useStorage();

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#F0F2F5' }} dir="rtl">
      {/* Responsive Meta Tag */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      {/* Header */}
      <header className="bg-blue-190 shadow-sm p-2 md:p-3" style={{ borderBottom: '1px solid #D1D7DB' }}>
        <div className="px-1 py-1 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 text-center sm:text-right mb-2 sm:mb-0">نظام إدارة الحجوزات والحسابات في مزرعة DeeNoor</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-green-190 overflow-x-auto" style={{ borderBottom: '1px solid #D1D7DB' }}>
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-2 py-2 md:px-3 md:py-3 text-sm font-medium border-b-2 transition-colors flex-1 justify-center ${
              activeTab === 'calendar'
                ? 'text-[#00A884] bg-[#E8F0F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            style={activeTab === 'calendar' ? { borderBottomColor: '#00A884' } : {}}
          >
            <CalendarDays size={20} />
            التقويم
          </button>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-2 py-2 md:px-3 md:py-3 text-sm font-medium border-b-2 transition-colors flex-1 justify-center ${
              activeTab === 'accounts'
                ? 'text-[#00A884] bg-[#E8F0F2]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            style={activeTab === 'accounts' ? { borderBottomColor: '#00A884' } : {}}
          >
            <Calculator size={20} />
            الحسابات
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto" style={{ backgroundColor: '#F0F2F5' }}>
        {activeTab === 'calendar' ? (
          <Calendar
            bookings={bookings}
            onAddBooking={addBooking}
            onUpdateBooking={updateBooking}
            onDeleteBooking={deleteBooking}
          />
        ) : (
          <Accounts
            expenses={expenses}
            bookings={bookings}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onDeleteExpense={deleteExpense}
          />
        )}
      </main>
    </div>
  );
}

export default App;