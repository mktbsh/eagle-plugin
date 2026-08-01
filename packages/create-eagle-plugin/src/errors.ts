export class UsageError extends Error {
  override readonly name = "UsageError";
}

export class CancellationError extends Error {
  override readonly name = "CancellationError";
}

export class GenerationError extends Error {
  override readonly name = "GenerationError";
}
