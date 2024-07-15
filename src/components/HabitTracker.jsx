import React, { useState, useEffect } from 'react';
import { PlusCircle, CheckCircle, XCircle, Trash2, Save, RotateCcw } from 'lucide-react';

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    loadHabits();
  }, []);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      saveHabits();
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [habits]);

  const loadHabits = () => {
    const storedHabits = localStorage.getItem('habits');
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
      showSavedMessage('Habits loaded from local storage');
    }
  };

  const saveHabits = () => {
    localStorage.setItem('habits', JSON.stringify(habits));
    showSavedMessage('Habits saved to local storage');
  };

  const showSavedMessage = (message) => {
    setSavedMessage(message);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const addHabit = () => {
    if (newHabit.trim() !== '') {
      setHabits([...habits, { name: newHabit, completedDates: [] }]);
      setNewHabit('');
    }
  };

  const toggleHabit = (index, date) => {
    const updatedHabits = [...habits];
    const habit = updatedHabits[index];
    const dateString = date.toISOString().split('T')[0];
    
    if (habit.completedDates.includes(dateString)) {
      habit.completedDates = habit.completedDates.filter(d => d !== dateString);
    } else {
      habit.completedDates.push(dateString);
    }

    setHabits(updatedHabits);
  };

  const deleteHabit = (index) => {
    const updatedHabits = habits.filter((_, i) => i !== index);
    setHabits(updatedHabits);
  };

  const getLastWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
    return dates;
  }; 

  const calculateStreak = (completedDates) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sortedDates = [...new Set(completedDates)]
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a);

    for (let i = 0; i <= sortedDates.length; i++) {
      const currentDate = i < sortedDates.length ? new Date(sortedDates[i]) : new Date(today);
      currentDate.setHours(0, 0, 0, 0);

      if (i === 0 && currentDate.getTime() !== today.getTime()) {
        break;  // Break if the most recent date is not today
      }

      if (i === 0 || currentDate.getTime() === today.getTime() - streak * 86400000) {
        streak++;
      } else {
        break;
      }
    }

    return streak - 1;  // Subtract 1 as we don't count today in the streak
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Enhanced Habit Tracker</h1>
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter a new habit"
          className="flex-grow border p-2 mr-2"
        />
        <button onClick={addHabit} className="bg-blue-500 text-white p-2 rounded flex items-center mr-2">
          <PlusCircle size={24} />
          <span className="ml-2">Add Habit</span>
        </button>
        <button onClick={saveHabits} className="bg-green-500 text-white p-2 rounded flex items-center mr-2">
          <Save size={24} />
          <span className="ml-2">Save</span>
        </button>
        <button onClick={loadHabits} className="bg-yellow-500 text-white p-2 rounded flex items-center">
          <RotateCcw size={24} />
          <span className="ml-2">Reload</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Habit</th>
              {getLastWeekDates().map((date) => (
                <th key={date.toISOString()} className="border p-2">
                  {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </th>
              ))}
              <th className="border p-2">Streak</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit, index) => (
              <tr key={index}>
                <td className="border p-2">{habit.name}</td>
                {getLastWeekDates().map((date) => {
                  const dateString = date.toISOString().split('T')[0];
                  const completed = habit.completedDates.includes(dateString);
                  return (
                    <td key={dateString} className="border p-2 text-center">
                      <button onClick={() => toggleHabit(index, date)}>
                        {completed ? (
                          <CheckCircle size={24} className="text-green-500" />
                        ) : (
                          <XCircle size={24} className="text-red-500" />
                        )}
                      </button>
                    </td>
                  );
                })}
                <td className="border p-2 text-center">
                  {calculateStreak(habit.completedDates)} days
                </td>
                <td className="border p-2 text-center">
                  <button onClick={() => deleteHabit(index)} className="text-red-500">
                    <Trash2 size={24} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {savedMessage && (
        <div className="fixed bottom-4 right-4 p-2 bg-green-100 text-green-700 rounded shadow">
          {savedMessage}
        </div>
      )}
    </div>
  );
};

export default HabitTracker;