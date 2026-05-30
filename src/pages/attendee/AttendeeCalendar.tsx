import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { getUpcomingTickets, getPastTickets } from '../../services/attendeeService';

export default function AttendeeCalendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = monthStart;
  const endDate = monthEnd;

  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  // Calculate padding days for the first week
  const startDayOfWeek = startDate.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }).map((_, i) => i);

  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getUpcomingTickets(), getPastTickets()])
      .then(([upcoming, past]) => {
        setTickets([...upcoming, ...past]);
      })
      .catch(err => console.error('Failed to load tickets for calendar', err));
  }, []);

  const getEventsForDay = (day: Date) => {
    return tickets.filter(ticket => isSameDay(parseISO(ticket.eventDate), day));
  };

  return (
    <SidebarLayout>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/attendee')}
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Calendar</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Your upcoming events schedule.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Days of week header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-4 text-center text-sm font-bold text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 auto-rows-[120px] sm:auto-rows-[160px]">
            {/* Empty padding cells */}
            {paddingDays.map(i => (
              <div key={`pad-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30" />
            ))}

            {/* Actual days */}
            {daysInMonth.map((day, i) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={`border-b border-r border-slate-100 dark:border-slate-800/50 p-2 sm:p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!isCurrentMonth ? 'opacity-50' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                      isTodayDate 
                        ? 'bg-blue-600 text-white' 
                        : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[70px] sm:max-h-[100px] no-scrollbar">
                    {dayEvents.map((event, index) => (
                      <Link 
                        key={`${event.eventId}-${index}`} 
                        to={`/events/${event.eventId}`}
                        className={`block px-2 py-1.5 text-xs font-medium text-white rounded-lg truncate transition-transform hover:scale-[1.02] bg-blue-500`}
                        title={event.eventTitle}
                      >
                        {event.eventTitle}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </SidebarLayout>
  );
}
