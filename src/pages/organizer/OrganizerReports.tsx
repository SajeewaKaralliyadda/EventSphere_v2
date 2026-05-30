import React, { useState } from 'react';
import SidebarLayout from '../../components/ui/SidebarLayout';
import { 
  Calendar as CalendarIcon, 
  Activity, 
  DollarSign, 
  Ticket, 
  Download,
  Filter,
  BarChart2
} from 'lucide-react';
import DynamicButton from '../../components/ui/DynamicButton';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { listEvents } from '../../services/organizerService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function OrganizerReports() {
  const [searchParams] = useSearchParams();
  const initEventId = searchParams.get('eventId');
  const [filterType, setFilterType] = useState<'month' | 'event'>(initEventId ? 'event' : 'month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(initEventId || '');
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      listEvents(user.id)
        .then(data => setMyEvents(data))
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  // Determine if a filter is actively selected and valid
  const isFilterActive = (filterType === 'month' && selectedMonth !== '') || 
                         (filterType === 'event' && selectedEvent !== '');

  // Dynamic metrics based on filter type
  const relevantEvents = filterType === 'event' && selectedEvent 
      ? myEvents.filter(e => e.id === selectedEvent) 
      : myEvents;
  
  const totalBookings = relevantEvents.reduce((acc, ev) => acc + (ev.bookings || 0), 0);
  const totalRevenue = relevantEvents.reduce((acc, ev) => acc + parseFloat(ev.revenue?.toString().replace(/[^0-9.-]+/g, "") || "0"), 0);

  const metrics = [
    ...(filterType === 'month' ? [{ title: 'Total Events', value: myEvents.length.toString(), icon: CalendarIcon, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/20' }] : []),
    { title: 'Active Events', value: relevantEvents.filter(e => e.status === 'PUBLISHED').length.toString(), icon: Activity, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/20' },
    { title: 'Total Revenue', value: `Rs. ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/20' },
    { title: 'Total Bookings', value: totalBookings.toString(), icon: Ticket, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/20' },
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [30, 58, 138]; // #1e3a8a
    
    // 1. Header
    doc.setFontSize(28);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text("EventSphere", 14, 22);
    
    // 2. Subtitle
    doc.setFontSize(16);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    const title = filterType === 'month' 
      ? `Organizer Performance Report - ${selectedMonth || 'All Months'}` 
      : `Event Report - ${relevantEvents[0]?.title || 'Unknown Event'}`;
    doc.text(title, 14, 32);
    
    // 3. Metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
    
    // 4. Summary Table
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text("Performance Metrics Summary", 14, 52);
    
    const summaryData = metrics.map(m => [m.title, m.value]);
    autoTable(doc, {
      startY: 56,
      head: [["Metric", "Value"]],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6 }
    });

    // 5. Detailed Events Table
    if (relevantEvents.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY + 14;
      doc.setFont("helvetica", "bold");
      doc.text("Included Events Details", 14, finalY);

      const eventData = relevantEvents.map(e => [
        e.title || "Untitled",
        e.status || "DRAFT",
        (e.bookings || 0).toString(),
        `Rs. ${parseFloat(e.revenue?.toString().replace(/[^0-9.-]+/g, "") || "0").toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: finalY + 4,
        head: [["Event Title", "Status", "Bookings", "Revenue"]],
        body: eventData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 10, cellPadding: 6 }
      });
    }
    
    doc.save(`eventsphere-report.pdf`);
  };

  return (
    <SidebarLayout>
      <div className="max-w-6xl mx-auto pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View detailed performance metrics for your events.</p>
          </div>
          
          {isFilterActive && (
            <DynamicButton 
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 print:hidden"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </DynamicButton>
          )}
        </div>

        {/* Filter Section */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8 print:hidden">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
              <Filter className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Filter Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Filter By</label>
              <select 
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value as 'month' | 'event');
                  setSelectedMonth('');
                  setSelectedEvent('');
                }}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
              >
                <option value="month">Month</option>
                <option value="event">Specific Event</option>
              </select>
            </div>

            <div className="md:col-span-2">
              {filterType === 'month' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Month</label>
                  <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="">-- Choose a Month --</option>
                    {MONTHS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-2">Select Event</label>
                  <select 
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="">-- Choose an Event --</option>
                    {myEvents.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Display */}
        {isFilterActive ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${filterType === 'month' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4 md:gap-6`}>
            {metrics.map((metric, idx) => {
              const Icon = metric.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${metric.bg} ${metric.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{metric.title}</p>
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{metric.value}</h3>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 border-dashed rounded-3xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Data Selected</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Please select a filter criteria above to view the performance metrics and generate reports.
            </p>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
