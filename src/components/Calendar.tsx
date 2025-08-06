import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Copy, Edit2, Trash2, Check } from 'lucide-react';
import { Booking, DayBooking } from '../types';
import { getDaysInMonth, getFirstDayOfMonth, months, weekDays, generateBookingMessage } from '../utils';
import BookingModal from './BookingModal';

interface CalendarProps {
  bookings: Booking[];
  onAddBooking: (booking: Booking) => void;
  onUpdateBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  bookings,
  onAddBooking,
  onUpdateBooking,
  onDeleteBooking,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'morning' | 'evening' | 'both'>('morning');
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>();
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const bookingsByDate = useMemo(() => {
    const result: Record<string, DayBooking> = {};
    
    bookings.forEach(booking => {
      const date = booking.date;
      if (!result[date]) {
        result[date] = {};
      }

      if (booking.period === 'both') {
        result[date] = { morning: booking, evening: booking };
      } else {
        if (!result[date].morning || !result[date].evening || Object.values(result[date]).every(b => b.period !== 'both')) {
          result[date][booking.period] = booking;
        }
      }
    });
    
    return result;
  }, [bookings]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(month - 1);
    } else {
      newDate.setMonth(month + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number, period: 'morning' | 'evening' | 'both') => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBooking = bookingsByDate[dateStr];

    if (period === 'both' && dayBooking?.morning && dayBooking?.evening && !editingBooking) {
      alert('هذا اليوم محجوز بالكامل. يرجى تعديل الحجوزات الحالية.');
      return;
    }

    // التحقق من الحجوزات السابقة وحذفها إذا لزم الأمر
    if (!editingBooking) {
      if (period === 'morning' && dayBooking?.morning) {
        if (confirm('سيتم حذف الحجز الصباحي القديم وجميع الحسابات المتعلقة به. هل تؤكد؟')) {
          onDeleteBooking(dayBooking.morning.id);
        } else {
          return; // إلغاء العملية إذا رفض المستخدم
        }
      }
      if (period === 'evening' && dayBooking?.evening) {
        if (confirm('سيتم حذف الحجز المسائي القديم وجميع الحسابات المتعلقة به. هل تؤكد؟')) {
          onDeleteBooking(dayBooking.evening.id);
        } else {
          return; // إلغاء العملية إذا رفض المستخدم
        }
      }
      if (period === 'both' && (dayBooking?.morning || dayBooking?.evening)) {
        if (confirm('سيتم حذف الحجوزات السابقة (صباحي و/أو مسائي) وجميع الحسابات المتعلقة بها. هل تؤكد؟')) {
          if (dayBooking?.morning) onDeleteBooking(dayBooking.morning.id);
          if (dayBooking?.evening && (!dayBooking.morning || dayBooking.morning.id !== dayBooking.evening.id)) {
            onDeleteBooking(dayBooking.evening.id);
          }
        } else {
          return; // إلغاء العملية إذا رفض المستخدم
        }
      }
    }

    if ((period === 'morning' || period === 'evening') && dayBooking && dayBooking[period] && !editingBooking) {
      setEditingBooking(dayBooking[period]);
      setSelectedDate(dateStr);
      setSelectedPeriod(period);
      setIsModalOpen(true);
      return;
    }

    setSelectedDate(dateStr);
    setSelectedPeriod(period);
    setEditingBooking(undefined);
    setIsModalOpen(true);
  };

  const handleBookingSave = (booking: Booking) => {
    if (editingBooking) {
      onUpdateBooking(booking);
    } else {
      onAddBooking(booking);
    }
    setIsModalOpen(false);
  };

  const handleCopyBooking = async (booking: Booking) => {
    const message = generateBookingMessage(booking);
    
    try {
      await navigator.clipboard.writeText(message);
      setCopiedBookingId(booking.id);
      setTimeout(() => setCopiedBookingId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getDayColor = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayBooking = bookingsByDate[dateStr];
    
    if (!dayBooking) return 'bg-green-35';
    
    const hasMorning = !!dayBooking.morning;
    const hasEvening = !!dayBooking.evening;
    
    if (hasMorning && hasEvening) return 'bg-red-100 border-red-200';
    if (hasMorning) return 'bg-blue-100 border-blue-200';
    if (hasEvening) return 'bg-orange-100 border-orange-200';
    
    return 'bg-white';
  };

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-16 sm:h-24"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBooking = bookingsByDate[dateStr];
      
      days.push(
        <div
          key={day}
          className={`h-16 sm:h-24 border border-gray-300 ${getDayColor(day)} relative group cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => handleDayClick(day, 'both')}
        >
          <div className="p-1">
            <div className="text-xs sm:text-sm font-bold text-gray-900">{day}</div>
          </div>
          
          {/* Morning slot with remaining amount indicator */}
          <div
            className={`absolute top-5 sm:top-6 left-1 right-1 h-3 sm:h-4 rounded text-xs text-center leading-3 sm:leading-4 ${
              dayBooking?.morning 
                ? dayBooking.morning.period === 'both' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-blue-200'
            } transition-colors`}
            style={{ fontSize: '10px', lineHeight: '12px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleDayClick(day, 'morning');
            }}
          >
            صباحي
            {dayBooking?.morning && dayBooking.morning.period !== 'both' && dayBooking.morning.remainingAmount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 bg-white text-[6px] sm:text-[8px] text-green-500 rounded-full border border-green-500">
                {dayBooking.morning.remainingAmount}
              </span>
            )}
          </div>
          
          {/* Evening slot with remaining amount indicator */}
          <div
            className={`absolute top-9 sm:top-12 left-1 right-1 h-3 sm:h-4 rounded text-xs text-center leading-3 sm:leading-4 ${
              dayBooking?.evening 
                ? dayBooking.evening.period === 'both' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-orange-500 text-white'
                : 'bg-gray-200 hover:bg-orange-200'
            } transition-colors`}
            style={{ fontSize: '10px', lineHeight: '12px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleDayClick(day, 'evening');
            }}
          >
            مسائي
            {dayBooking?.evening && dayBooking.evening.period !== 'both' && dayBooking.evening.remainingAmount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 bg-white text-[6px] sm:text-[8px] text-green-500 rounded-full border border-green-500">
                {dayBooking.evening.remainingAmount}
              </span>
            )}
          </div>
          
          {/* Full day remaining amount indicator */}
          {dayBooking?.morning && dayBooking.morning.period === 'both' && dayBooking.morning.remainingAmount > 0 && (
            <span className="absolute top-1 left-1 flex items-center justify-center w-3 h-3 sm:w-4 sm:h-4 bg-white text-[6px] sm:text-[8px] text-green-500 rounded-full border border-green-500">
              {dayBooking.morning.remainingAmount}
            </span>
          )}
          
          {/* Booking actions - Hide on mobile, show on hover for larger screens */}
          {(dayBooking?.morning || dayBooking?.evening) && (
            <>
              {/* Morning booking actions */}
              {dayBooking.morning && (
                <div className="absolute top-1 right-1 hidden sm:opacity-0 sm:group-hover:opacity-100 sm:flex transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyBooking(dayBooking.morning!);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 rounded text-xs"
                      title="نسخ تفاصيل الحجز الصباحي"
                    >
                      {copiedBookingId === dayBooking.morning.id ? <Check size={8} className="sm:w-10 sm:h-10" /> : <Copy size={8} className="sm:w-10 sm:h-10" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBooking(dayBooking.morning);
                        setSelectedDate(dateStr);
                        setSelectedPeriod(dayBooking.morning.period);
                        setIsModalOpen(true);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded text-xs"
                      title="تعديل الحجز الصباحي"
                    >
                      <Edit2 size={8} className="sm:w-10 sm:h-10" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('هل أنت متأكد من حذف الحجز الصباحي؟')) {
                          onDeleteBooking(dayBooking.morning!.id);
                        }
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded text-xs"
                      title="حذف الحجز الصباحي"
                    >
                      <Trash2 size={8} className="sm:w-10 sm:h-10" />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Evening booking actions */}
              {dayBooking.evening && (!dayBooking.morning || dayBooking.morning.id !== dayBooking.evening.id) && (
                <div className="absolute top-[3.2rem] sm:top-[4.1rem] right-1 hidden sm:opacity-0 sm:group-hover:opacity-100 sm:flex transition-opacity">
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyBooking(dayBooking.evening!);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-1 rounded text-xs border border-yellow-400"
                      title="نسخ تفاصيل الحجز المسائي"
                    >
                      {copiedBookingId === dayBooking.evening.id ? <Check size={8} className="sm:w-10 sm:h-10" /> : <Copy size={8} className="sm:w-10 sm:h-10" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBooking(dayBooking.evening);
                        setSelectedDate(dateStr);
                        setSelectedPeriod(dayBooking.evening.period);
                        setIsModalOpen(true);
                      }}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white p-1 rounded text-xs border border-yellow-400"
                      title="تعديل الحجز المسائي"
                    >
                      <Edit2 size={8} className="sm:w-10 sm:h-10" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('هل أنت متأكد من حذف الحجز المسائي؟')) {
                          onDeleteBooking(dayBooking.evening!.id);
                        }
                      }}
                      className="bg-rose-500 hover:bg-rose-600 text-white p-1 rounded text-xs border border-yellow-400"
                      title="حذف الحجز المسائي"
                    >
                      <Trash2 size={8} className="sm:w-10 sm:h-10" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      );
    }
    
    return days;
  };

  return (
    <div className="h-full flex flex-col">
      {/* رأس التقويم المصحح */}
      <div className="flex justify-center p-2 bg-white border-b">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth('prev')} // التالي (يسارًا)
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="sm:w-5 sm:h-5" />
          </button>
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 w-48 text-center">
            {months[month]} {year}
          </h2>
          <button
            onClick={() => navigateMonth('next')} // السابق (يمينًا)
            className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 p-1 bg-gray-50 border-b text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>صباحي</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>مسائي</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>يوم كامل</span>
        </div>
      </div>

      <div className="grid grid-cols-7 bg-gray-50 border-b">
        {weekDays.map(day => (
          <div key={day} className="p-1 sm:p-3 text-center text-xs sm:text-sm font-medium text-gray-700 border-r border-gray-200">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 flex-1 overflow-auto">
        {renderCalendarDays()}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleBookingSave}
        selectedDate={selectedDate}
        selectedPeriod={selectedPeriod}
        existingBooking={editingBooking}
      />
    </div>
  );
};

export default Calendar;