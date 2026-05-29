export const isFutureDate = (value: string) => {
  const date = new Date(value)
  return !Number.isNaN(date.getTime()) && date > new Date()
}

export const isExpiryAfterIssue = (issue?: string, expiry?: string) =>
  !issue || !expiry || new Date(expiry) > new Date(issue)
