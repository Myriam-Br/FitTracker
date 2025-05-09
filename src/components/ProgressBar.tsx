interface ProgressBarProps {
    title: string;
    currentValue: number;
    goalValue: number;
    unit: string;
    progressColor: string;
    setCurrentValue: React.Dispatch<React.SetStateAction<number>>;
    setGoalValue: React.Dispatch<React.SetStateAction<number>>;
  }
  
  export default function ProgressBar({
    title,
    currentValue,
    goalValue,
    unit,
    progressColor,
    setCurrentValue,
    setGoalValue,
  }: ProgressBarProps) {
    const getPercentage = (current: number, goal: number) => Math.min(100, Math.round((current / goal) * 100));
  
    return (
      <div className="text-black p-4 bg-white rounded shadow">
        <h2 className="font-semibold mb-1">{title}</h2>
        <input
          type="number"
          value={currentValue}
          onChange={(e) => setCurrentValue(Number(e.target.value))}
          className={`w-full p-2 border rounded mb-2 ${(title === 'Water' || title === 'Calories'|| title === 'Steps') ? 'hidden':'block'}`}
          min="0"
        />
        <input
          type="number"
          value={goalValue}
          onChange={(e) => setGoalValue(Number(e.target.value))}
          className={`w-full p-2 border rounded mb-2 ${(title === 'Water' || title === 'Calories'|| title === 'Steps') ? 'hidden':'block'}`}
          placeholder="Goal"
          min="0"
        />
        <div className="text-sm mb-1">
          {currentValue} / {goalValue} {unit}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded">
          <div
            className={`h-full ${progressColor} rounded`}
            style={{ width: `${getPercentage(currentValue, goalValue)}%` }}
          />
        </div>
      </div>
    );
  }
  