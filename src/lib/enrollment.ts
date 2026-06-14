export function formatEnrollmentCount(count: number) {
  return `${count} ${count === 1 ? "student enrolled" : "students enrolled"}`;
}
