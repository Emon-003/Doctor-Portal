export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export const TIME_SLOTS: TimeSlot[] = [
  { id: '1', time: '09:00 AM', available: true },
  { id: '2', time: '09:30 AM', available: true },
  { id: '3', time: '10:00 AM', available: true },
  { id: '4', time: '10:30 AM', available: true },
  { id: '5', time: '11:00 AM', available: true },
  { id: '6', time: '11:30 AM', available: true },
  { id: '7', time: '12:00 PM', available: true },
  { id: '8', time: '12:30 PM', available: true },
  { id: '9', time: '01:00 PM', available: true },
  { id: '10', time: '01:30 PM', available: true },
  { id: '11', time: '02:00 PM', available: true },
  { id: '12', time: '02:30 PM', available: true },
  { id: '13', time: '03:00 PM', available: true },
  { id: '14', time: '03:30 PM', available: true },
  { id: '15', time: '04:00 PM', available: true },
  { id: '16', time: '04:30 PM', available: true },
  { id: '17', time: '05:00 PM', available: true },
];

// Function to get the next 7 days starting from today
export const getNextSevenDays = () => {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      day: days[date.getDay()],
      date: date.getDate().toString()
    });
  }
  
  return dates;
};

// Export the dynamic dates
export const DATES = getNextSevenDays(); 