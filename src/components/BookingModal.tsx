import React, { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Booking } from '../types';
import { generateBookingMessage } from '../utils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Booking) => void;
  selectedDate: string;
  selectedPeriod: 'morning' | 'evening' | 'both';
  existingBooking?: Booking;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedPeriod,
  existingBooking,
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    address: '',
    notes: '',
    totalAmount: '',
    paidAmount: '',
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (existingBooking) {
      setFormData({
        customerName: existingBooking.customerName,
        phoneNumber: existingBooking.phoneNumber,
        address: existingBooking.address,
        notes: existingBooking.notes || '',
        totalAmount: existingBooking.totalAmount.toString(),
        paidAmount: existingBooking.paidAmount.toString(),
      });
    } else {
      setFormData({
        customerName: '',
        phoneNumber: '',
        address: '',
        notes: '',
        totalAmount: '',
        paidAmount: '',
      });
    }
  }, [existingBooking, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    // تقريب المبلغ المتبقي إلى رقمين عشريين لتجنب مشاكل الدقة العشرية
    const remainingAmount = Math.round((totalAmount - paidAmount) * 100) / 100;

    const booking: Booking = {
      id: existingBooking?.id || Date.now().toString(),
      date: selectedDate,
      period: selectedPeriod,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      notes: formData.notes,
      totalAmount,
      paidAmount,
      remainingAmount,
      createdAt: existingBooking?.createdAt || new Date().toISOString(),
    };

    onSave(booking);
    onClose();
  };

  const handleCopy = async () => {
    if (!formData.customerName) return;

    const totalAmount = parseFloat(formData.totalAmount) || 0;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    // تقريب المبلغ المتبقي إلى رقمين عشريين لتجنب مشاكل الدقة العشرية
    const remainingAmount = Math.round((totalAmount - paidAmount) * 100) / 100;

    const tempBooking: Booking = {
      id: '',
      date: selectedDate,
      period: selectedPeriod,
      customerName: formData.customerName,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      notes: formData.notes,
      totalAmount,
      paidAmount,
      remainingAmount,
      createdAt: new Date().toISOString(),
    };

    const message = generateBookingMessage(tempBooking);
    
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const remainingAmount = (parseFloat(formData.totalAmount) || 0) - (parseFloat(formData.paidAmount) || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-0">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto" style={{ backgroundColor: '#F0F2F5', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between p-2 sm:p-3 sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid #D1D7DB' }}>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {existingBooking ? 'تعديل الحجز' : 'حجز جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                style={{ borderColor: '#D1D7DB' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رقم الهاتف
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                style={{ borderColor: '#D1D7DB' }}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                العنوان
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                style={{ borderColor: '#D1D7DB' }}
                rows={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الملاحظات
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                style={{ borderColor: '#D1D7DB' }}
                rows={1}
                placeholder="أدخل أي ملاحظات إضافية (اختياري)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المبلغ الكامل
                </label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                  style={{ borderColor: '#D1D7DB' }}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  المبلغ المدفوع
                </label>
                <input
                  type="number"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00A884] bg-white"
                  style={{ borderColor: '#D1D7DB' }}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="p-3 rounded-md bg-white" style={{ border: '1px solid #D1D7DB' }}>
              <div className="text-sm text-gray-800">
                المبلغ المتبقي: <span className="font-semibold">{remainingAmount.toFixed(2)} دينار عراقي</span>
              </div>
            </div>

            <div className="p-3 rounded-md bg-white" style={{ border: '1px solid #D1D7DB' }}>
              <div className="text-sm text-gray-800">
                الفترة: <span className="font-semibold">
                  {selectedPeriod === 'morning' ? 'صباحي' : selectedPeriod === 'evening' ? 'مسائي' : 'يوم كامل'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="submit"
              className="flex-1 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
              style={{ backgroundColor: '#00A884', ':hover': { backgroundColor: '#008069' } }}
            >
              {existingBooking ? 'تحديث' : 'حفظ'}
            </button>
            
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 text-white py-2 px-4 rounded-md transition-colors text-sm sm:text-base"
              style={{ backgroundColor: '#00A884', ':hover': { backgroundColor: '#008069' } }}
              disabled={!formData.customerName}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 rounded-md transition-colors text-sm sm:text-base"
              style={{ backgroundColor: '#E8F0F2', ':hover': { backgroundColor: '#D1D7DB' } }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;