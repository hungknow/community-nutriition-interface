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
