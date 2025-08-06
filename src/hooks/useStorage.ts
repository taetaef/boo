import { useState, useEffect } from 'react';
import { Booking, Expense } from '../types';

export const useStorage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const storedBookings = localStorage.getItem('bookings');
    const storedExpenses = localStorage.getItem('expenses');

    if (storedBookings) {
      setBookings(JSON.parse(storedBookings));
    }

    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  }, []);

  const saveBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
  };

  const addBooking = (booking: Booking) => {
    const updatedBookings = [...bookings, booking];
    saveBookings(updatedBookings);
  };

  const updateBooking = (updatedBooking: Booking) => {
    const updatedBookings = bookings.map(booking =>
      booking.id === updatedBooking.id ? updatedBooking : booking
    );
    saveBookings(updatedBookings);
  };

  const deleteBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    saveBookings(updatedBookings);
  };

  const addExpense = (expense: Expense) => {
    const updatedExpenses = [...expenses, expense];
    saveExpenses(updatedExpenses);
  };

  const updateExpense = (updatedExpense: Expense) => {
    const updatedExpenses = expenses.map(expense =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    );
    saveExpenses(updatedExpenses);
  };

  const deleteExpense = (expenseId: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    saveExpenses(updatedExpenses);
  };

  return {
    bookings,
    expenses,
    addBooking,
    updateBooking,
    deleteBooking,
    addExpense,
    updateExpense,
    deleteExpense,
  };
};