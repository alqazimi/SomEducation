export class AppError extends Error {
  constructor(
    message: string,
    public code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "VALIDATION"
      | "CONFLICT"
      | "RATE_LIMITED"
      | "MFA_REQUIRED"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function throwError(
  message: string,
  code: AppError["code"] = "VALIDATION"
): never {
  throw new AppError(message, code);
}
