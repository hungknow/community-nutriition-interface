export function calculateMonthsSinceBirth(birthDate: Date): number {
    const today = new Date()
    const years = today.getFullYear() - birthDate.getFullYear()
    const months = today.getMonth() - birthDate.getMonth()
    const days = today.getDate() - birthDate.getDate()
    
    // Calculate total months
    let totalMonths = years * 12 + months
    
    // If the day of the month hasn't been reached yet, subtract one month
    if (days < 0) {
        totalMonths--
    }
    
    return totalMonths
}

export function calculateWeeksBetweenDates(fromDate: Date, toDate: Date): number {
    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    // Calculate difference in milliseconds
    const diffMs = toDate.getTime() - fromDate.getTime();
    // Calculate week difference (rounded down)
    return Math.floor(diffMs / msPerWeek);
}
