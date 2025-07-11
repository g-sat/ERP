export const isStatusConfirmed = (statusName?: string) => {
  return statusName?.toLowerCase() === "confirmed"
}
