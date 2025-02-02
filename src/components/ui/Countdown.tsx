import React, { useState, useEffect } from 'react';
import {Clock } from 'lucide-react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const examDate = new Date('2025-05-18T07:00:00');
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Clock className="text-blue-500" size={20} />
        <span className="font-medium">INICET Countdown</span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-2xl font-bold text-blue-600">{timeLeft.days}</div>
          <div className="text-xs text-slate-600">Days</div>
        </div>
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
          <div className="text-xs text-slate-600">Hours</div>
        </div>
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
          <div className="text-xs text-slate-600">Minutes</div>
        </div>
        <div className="bg-slate-50 p-2 rounded">
          <div className="text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
          <div className="text-xs text-slate-600">Seconds</div>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;