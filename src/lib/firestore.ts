import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from './firebase';

const db = getFirestore();

type UserProgress = {
  stepsGoal: number;
  caloriesGoal: number;
  waterGoal: number;
  currentSteps: number;
  currentCalories: number;
  currentWater: number;
  date: string;
};

type UserGoals = {
  stepsGoal: number;
  caloriesGoal: number;
  waterGoal: number;
};

type UserCurrent = {
  steps: number;
  calories: number;
  water: number;
};

// Create user profile in db
export const createUserProfile = async (username: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      username,
      email: user.email,
      createdAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

// Save goals and current values to Firestore with date tracking
export const saveUserGoals = async (goals: UserGoals, current: UserCurrent) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const docRef = doc(db, 'users', user.uid, 'goalsAndProgress', date);

    await setDoc(docRef, {
      goals: goals,
      current: current,
      date: date, // Store current date for tracking
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user goals:', error);
    throw new Error('Failed to save user goals');
  }
};

// Save daily progress (steps, calories, water) to Firestore
export const saveDailyProgress = async (current: UserCurrent, date: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    const docRef = doc(db, 'users', user.uid, 'goalsAndProgress', date);

    await setDoc(docRef, {
      current: current,
      date: date, // Store current date for tracking
    }, { merge: true });
  } catch (error) {
    console.error('Error saving daily progress:', error);
    throw new Error('Failed to save daily progress');
  }
};

// Load goals and current values from Firestore (with date tracking)
export const loadUserGoals = async (): Promise<UserProgress | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const date = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
    const docRef = doc(db, 'users', user.uid, 'goalsAndProgress', date);

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const progress: UserProgress = {
        stepsGoal: data?.goals?.stepsGoal ?? 0,
        caloriesGoal: data?.goals?.caloriesGoal ?? 0,
        waterGoal: data?.goals?.waterGoal ?? 0,
        currentSteps: data?.current?.steps ?? 0,
        currentCalories: data?.current?.calories ?? 0,
        currentWater: data?.current?.water ?? 0,
        date: data?.date ?? '',
      };
    
      return progress;
    }
    return null;
    
  } catch (error) {
    console.error('Error loading user goals:', error);
    throw new Error('Failed to load user goals');
  }
};

// Load yesterday's progress from Firestore
export const loadYesterdayProgress = async (): Promise<UserProgress | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    // Get yesterday's date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];

    const docRef = doc(db, 'users', user.uid, 'goalsAndProgress', formattedDate);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const progress: UserProgress = {
        stepsGoal: data?.goals?.stepsGoal ?? 0,
        caloriesGoal: data?.goals?.caloriesGoal ?? 0,
        waterGoal: data?.goals?.waterGoal ?? 0,
        currentSteps: data?.current?.steps ?? 0,
        currentCalories: data?.current?.calories ?? 0,
        currentWater: data?.current?.water ?? 0,
        date: data?.date ?? '',
      };
    
      return progress;
    }

    return null;

  } catch (error) {
    console.error('Error loading yesterday progress:', error);
    throw new Error('Failed to load yesterday progress');
  }
};
