type ComparableFields = Record<string, string | number | boolean | null>;

export function findChangedFields(
  current: ComparableFields,
  incoming: ComparableFields,
): string[] {
  return Object.keys(incoming).filter((field) => current[field] !== incoming[field]);
}

