export function calculateMonthsSinceBirth(birthDate: Date): number {
    const today = new Date()
    const months = today.getMonth() - birthDate.getMonth()
    return months
}
