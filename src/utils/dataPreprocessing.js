export const DAILY_TARGET = 200;
export const MIN_ACCURACY_TARGET = 70;
export const getDate = () => {
    return new Date().toISOString();
};
const getUTCMidnight = (date) => {
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};
export const calculateDailyAverage = (userData) => {
    if (!userData || userData.length === 0)
        return 0;
    const today = new Date();
    const todayUTCMidnight = getUTCMidnight(today);
    const nonSundayData = userData.filter(day => {
        if (!day?.date)
            return false;
        const date = new Date(day.date);
        const utcDay = date.getUTCDay();
        if (utcDay === 0)
            return false; // Exclude Sundays
        const dayUTCMidnight = getUTCMidnight(date);
        return dayUTCMidnight < todayUTCMidnight; // Exclude current day
    });
    if (nonSundayData.length === 0)
        return 0;
    const totalCompleted = nonSundayData.reduce((sum, day) => sum + (day?.completed || 0), 0);
    return Math.round(totalCompleted / nonSundayData.length);
};
export const calculateConsistencyAndStreak = (userData) => {
    if (!userData || userData.length === 0)
        return { consistency: 0, streak: 0 };
    const today = new Date();
    const todayUTCMidnight = getUTCMidnight(today);
    const validData = userData
        .filter(day => {
        if (!day?.date)
            return false;
        const date = new Date(day.date);
        const utcDay = date.getUTCDay();
        if (utcDay === 0)
            return false; // Exclude Sundays
        const dayUTCMidnight = getUTCMidnight(date);
        return dayUTCMidnight < todayUTCMidnight; // Exclude current day
    })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Descending order
    if (validData.length === 0)
        return { consistency: 0, streak: 0 };
    // Calculate consistency (unchanged)
    const consistentDays = validData.filter(day => {
        const accuracy = (day.correct / day.completed * 100).toFixed(2);
        return day.completed >= DAILY_TARGET * 0.5 && parseFloat(accuracy) >= MIN_ACCURACY_TARGET;
    });
    const consistency = Number((consistentDays.length / validData.length * 100).toFixed(2));
    // Calculate streak with Sunday skipping
    let streak = 0;
    let prevDateUTC = null;
    for (const day of validData) {
        const accuracy = Number((day.correct / day.completed * 100).toFixed(2));
        if (day.completed >= (DAILY_TARGET / 2) && accuracy >= MIN_ACCURACY_TARGET) {
            const currentDate = new Date(day.date);
            const currentUTCMidnight = getUTCMidnight(currentDate);
            if (prevDateUTC === null) {
                streak = 1;
                prevDateUTC = currentUTCMidnight;
            }
            else {
                // Calculate expected previous date, skipping Sundays
                let expectedDateUTC = prevDateUTC - 86400000; // Subtract one day
                let expectedDate = new Date(expectedDateUTC);
                // Keep subtracting days if the expected date is a Sunday
                while (expectedDate.getUTCDay() === 0) {
                    expectedDateUTC -= 86400000;
                    expectedDate = new Date(expectedDateUTC);
                }
                if (currentUTCMidnight === expectedDateUTC) {
                    streak++;
                    prevDateUTC = currentUTCMidnight;
                }
                else {
                    break; // Streak broken
                }
            }
        }
        else {
            break; // Streak broken
        }
    }
    return { consistency, streak };
};
export const calculateMetrics = (stats) => {
    const accuracy = Number((stats.correct / stats.completed * 100).toFixed(2)) || 0;
    const accuracyBonus = accuracy >= 80 ? (accuracy - 80) * 2 : 0;
    const points = Math.round(stats.completed + (accuracyBonus * stats.completed / 100));
    return { accuracy, points };
};
