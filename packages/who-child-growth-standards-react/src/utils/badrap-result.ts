import { Result } from "@badrap/result"

export function errorToResult<T, E>(e: E): Result<T, Error> {
  if (e instanceof Error) {
    return Result.err(e)
  }
  return Result.err(new Error(String(e)))
}
