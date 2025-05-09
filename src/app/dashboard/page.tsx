'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { loadUserGoals, saveUserGoals, saveDailyProgress, loadYesterdayProgress } from '@/lib/firestore';
import { getDoc, doc } from "firebase/firestore";
import ProgressBar from '@/components/ProgressBar';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('')
  const [steps, setSteps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [water, setWater] = useState(0);

  // Goals from Firestore
  const [stepsGoal, setStepsGoal] = useState(10000);
  const [caloriesGoal, setCaloriesGoal] = useState(700);
  const [waterGoal, setWaterGoal] = useState(2.0);

  const [loadingGoals, setLoadingGoals] = useState(true);
  const [saving, setSaving] = useState(false);
  const [yesterdayProgress, setYesterdayProgress] = useState<{
    stepsGoal: number;
    caloriesGoal: number;
    waterGoal: number;
    currentSteps: number;
    currentCalories: number;
    currentWater: number;
    date: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null); // Add error state

  // Fetch user goals and daily progress on load
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
    } else {
      // ✅ Load user goals
      loadUserGoals()
        .then((goals) => {
          if (goals) {
            setStepsGoal(goals.stepsGoal);
            setCaloriesGoal(goals.caloriesGoal);
            setWaterGoal(goals.waterGoal);
            setSteps(goals.currentSteps);
            setCalories(goals.currentCalories);
            setWater(goals.currentWater);
          }
          setLoadingGoals(false);
        })
        .catch((error) => {
          console.error('Error loading user goals:', error);
          setLoadingGoals(false);
          setError('Failed to load your goals. Please try again later.');
        });

      // Load yesterday progress
      loadYesterdayProgress()
        .then((yesterdayData) => {
          console.log('DATA', yesterdayData);
          setYesterdayProgress(yesterdayData);
        })
        .catch((error) => {
          console.error('Error loading daily progress:', error);
          setError('Failed to load yesterday\'s progress. Please try again later.');
        });

      // Fetch username from Firestore
      const fetchUsername = async () => {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUsername(data.username); // <-- useState required
        } else {
          console.log("No user profile found");
        }
      };

      fetchUsername();
    }
  }, [user, authLoading]);

  // Handle saving goals and progress
  const handleSaveGoals = async () => {
    setSaving(true);
    try {
      await saveUserGoals(
        {
          stepsGoal,
          caloriesGoal,
          waterGoal,
        },
        {
          steps,
          calories,
          water,
        }
      );
      console.log('Goals and current values saved successfully');

      const date = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      await saveDailyProgress(
        {
          steps,
          calories,
          water,
        },
        date
      );
    } catch (err) {
      console.error('Error saving goals:', err);
      setError('Failed to save your goals. Please try again later.');
    }
    setSaving(false);
  };

  if (!user || loadingGoals) return <p>Loading...</p>;

  return (
    <main className="p-8 relative">
      <button
        onClick={() => signOut(auth)}
        className="ml-4 text-red-500 text-lg absolute right-0 mr-8"
      >
        Logout
      </button>
      <h1 className="text-3xl font-bold mb-4 capitalize">Welcome back {username}</h1>
      
      {/* Display error if there's any */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display previous day's progress */}
      <div className="my-5">
        {yesterdayProgress === null ? (
          <p>No progress data for yesterday</p>
        ) : (
            <div  className="p-4 border rounded shadow-sm">
              <h3 className="font-semibold text-lg">{`Yesterday's progress `}({yesterdayProgress.date}) </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                <ProgressBar
                  title="Steps"
                  currentValue={yesterdayProgress.currentSteps}
                  goalValue={stepsGoal}
                  unit="steps"
                  progressColor="bg-blue-500"
                  setCurrentValue={() => {}}
                  setGoalValue={() => {}}
                />
                <ProgressBar
                  title="Calories"
                  currentValue={yesterdayProgress.currentCalories}
                  goalValue={caloriesGoal}
                  unit="kcal"
                  progressColor="bg-orange-500"
                  setCurrentValue={() => {}}
                  setGoalValue={() => {}}
                />
                <ProgressBar
                  title="Water"
                  currentValue={yesterdayProgress.currentWater}
                  goalValue={waterGoal}
                  unit="L"
                  progressColor="bg-cyan-500"
                  setCurrentValue={() => {}}
                  setGoalValue={() => {}}
                />
              </div>
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ProgressBar
          title="Steps Today"
          currentValue={steps}
          goalValue={stepsGoal}
          unit="steps"
          progressColor="bg-blue-500"
          setCurrentValue={setSteps}
          setGoalValue={setStepsGoal}
        />

        <ProgressBar
          title="Calories Burned"
          currentValue={calories}
          goalValue={caloriesGoal}
          unit="kcal"
          progressColor="bg-orange-500"
          setCurrentValue={setCalories}
          setGoalValue={setCaloriesGoal}
        />

        <ProgressBar
          title="Water Intake"
          currentValue={water}
          goalValue={waterGoal}
          unit="L"
          progressColor="bg-cyan-500"
          setCurrentValue={setWater}
          setGoalValue={setWaterGoal}
        />
      </div>

      <button
        onClick={handleSaveGoals}
        className="bg-green-500 text-white px-4 py-2 rounded shadow"
      >
        {saving ? 'Saving...' : 'Save Goals'}
      </button>
    </main>
  );
}
