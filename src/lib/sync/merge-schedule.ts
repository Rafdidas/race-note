import type {
  ScheduleChange,
  ScheduleEntityType,
  ScheduleFieldValue,
} from "@/lib/sync/types";

type ScheduleFields = Record<string, ScheduleFieldValue>;

export function mergeScheduleFields({
  entityType,
  entityId,
  current,
  incoming,
  protectedFields,
}: {
  entityType: ScheduleEntityType;
  entityId: string;
  current: ScheduleFields;
  incoming: ScheduleFields;
  protectedFields: ReadonlySet<string>;
}): {
  patch: ScheduleFields;
  changes: ScheduleChange[];
  needsReview: boolean;
  skippedCount: number;
} {
  const patch: ScheduleFields = {};
  const changes: ScheduleChange[] = [];
  let skippedCount = 0;

  for (const [fieldName, newValue] of Object.entries(incoming)) {
    const oldValue = current[fieldName] ?? null;
    if (oldValue === newValue) continue;
    const protectedField = protectedFields.has(fieldName);
    if (protectedField) {
      skippedCount += 1;
    } else {
      patch[fieldName] = newValue;
    }
    changes.push({
      entityType,
      entityId,
      fieldName,
      oldValue,
      newValue,
      changeStatus: protectedField ? "ignored" : "needs_review",
    });
  }

  return {
    patch,
    changes,
    needsReview: Object.keys(patch).length > 0,
    skippedCount,
  };
}

