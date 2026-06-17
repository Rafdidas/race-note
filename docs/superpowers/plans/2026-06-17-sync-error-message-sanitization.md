# Sync 실패 로그 안전 메시지 정제 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `syncLogs.message`에 SQL·바인딩 파라미터 등 내부 상세가 노출되지 않도록, 일정 수집 실패 오류 메시지를 정제하는 `safeScheduleSyncError` 함수를 추가하고 catch 블록에 적용한다.

**Architecture:** `src/lib/sync/source-runner.ts`에 `safeScheduleSyncError(error, seriesCode)` 함수를 export로 추가하고, 기존 catch 블록에서 `error.message` 직접 사용을 이 함수 호출로 교체한다. 원시 오류 전체는 `console.error`로 Worker 로그에 남긴다. AI 생성 경로의 `safeGenerationError` 패턴과 동일한 구조다.

**Tech Stack:** Node.js `node:test` + `node:assert/strict` (기존 테스트 패턴 동일)

## Global Constraints

- 테스트 프레임워크: `node:test` + `node:assert/strict` (Vitest, Jest 사용 안 함)
- import alias: `@/lib/...` 형식
- TypeScript strict — `any` 사용 금지, 파라미터 타입 명시
- 최대 오류 메시지 길이: 160자
- `throw error` 유지 (상위 `runAllScheduleSync`의 failures 집계에 필요)
- DB 스키마·마이그레이션·UI 변경 없음

---

### Task 1: `safeScheduleSyncError` 함수 추가 (TDD)

**Files:**
- Modify: `src/lib/sync/source-runner.ts` (함수 추가, export)
- Modify: `src/lib/source-runner.test.ts` (테스트 추가)

**Interfaces:**
- Produces: `export function safeScheduleSyncError(error: unknown, seriesCode: string): string`

- [ ] **Step 1: 테스트 작성**

`src/lib/source-runner.test.ts` 파일 끝에 아래 테스트들을 추가한다 (기존 테스트는 그대로 유지).

```ts
import { safeScheduleSyncError } from "@/lib/sync/source-runner";

test("passes through HTTP status error messages", () => {
  const error = new Error("WRC source returned HTTP 403");
  assert.equal(safeScheduleSyncError(error, "WRC"), "WRC source returned HTTP 403");
});

test("passes through too-large response message", () => {
  const error = new Error("Schedule source response was too large");
  assert.equal(
    safeScheduleSyncError(error, "WEC"),
    "Schedule source response was too large",
  );
});

test("normalises AbortError timeout to safe message", () => {
  const error = new DOMException("The user aborted a request.", "AbortError");
  assert.equal(
    safeScheduleSyncError(error, "F1"),
    "F1 schedule source request timed out",
  );
});

test("normalises TimeoutError to safe message", () => {
  const error = new DOMException("Signal timed out.", "TimeoutError");
  assert.equal(
    safeScheduleSyncError(error, "WEC"),
    "WEC schedule source request timed out",
  );
});

test("normalises missing source error to safe message", () => {
  const error = new Error("Enabled sync source abc-123 is missing");
  assert.equal(
    safeScheduleSyncError(error, "F1"),
    "F1 sync source is not configured",
  );
});

test("sanitises D1 batch error containing SQL and parameters", () => {
  const error = new Error(
    "D1_ERROR: SQLITE_ERROR: no such table: sessions — executed SQL: INSERT INTO sessions (id, race_id) VALUES (?, ?) with params [\"abc\", \"def\"]",
  );
  assert.equal(safeScheduleSyncError(error, "F1"), "F1 schedule sync failed");
});

test("sanitises unexpected parse error", () => {
  const error = new Error("Unexpected token < at position 0");
  assert.equal(safeScheduleSyncError(error, "WRC"), "WRC schedule sync failed");
});

test("handles non-Error thrown values", () => {
  assert.equal(safeScheduleSyncError("string error", "WEC"), "WEC schedule sync failed");
  assert.equal(safeScheduleSyncError(null, "F1"), "F1 schedule sync failed");
  assert.equal(safeScheduleSyncError(42, "WRC"), "WRC schedule sync failed");
});

test("truncates allowed messages that exceed 160 characters", () => {
  const longUrl = "x".repeat(200);
  const error = new Error(`WEC source returned HTTP 503 from ${longUrl}`);
  const result = safeScheduleSyncError(error, "WEC");
  assert.ok(result.length <= 160);
  assert.ok(result.startsWith("WEC source returned HTTP 503"));
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
node --import tsx --test src/lib/source-runner.test.ts
```

기대 출력: `safeScheduleSyncError`를 찾을 수 없어 import 오류 또는 모든 새 테스트 FAIL

- [ ] **Step 3: 함수 구현**

`src/lib/sync/source-runner.ts`의 `scheduleSourceRequestHeaders` 함수 바로 위(파일 상단 상수 영역 아래)에 추가한다.

```ts
const SAFE_MESSAGE_MAX_LEN = 160;

export function safeScheduleSyncError(error: unknown, seriesCode: string): string {
  if (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  ) {
    return `${seriesCode} schedule source request timed out`;
  }

  if (error instanceof Error) {
    if (/returned HTTP \d+/.test(error.message)) {
      return error.message.slice(0, SAFE_MESSAGE_MAX_LEN);
    }
    if (error.message === "Schedule source response was too large") {
      return error.message;
    }
    if (
      error.message.startsWith("Enabled sync source") &&
      error.message.includes("is missing")
    ) {
      return `${seriesCode} sync source is not configured`;
    }
  }

  return `${seriesCode} schedule sync failed`;
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
node --import tsx --test src/lib/source-runner.test.ts
```

기대 출력: 모든 테스트(기존 2개 + 새 9개) PASS

- [ ] **Step 5: lint + build 확인**

```bash
npm run lint
npm run build
```

기대 출력: 오류 없음

- [ ] **Step 6: 커밋**

```bash
git add src/lib/sync/source-runner.ts src/lib/source-runner.test.ts
git commit -m "feat: add safeScheduleSyncError to sanitise sync failure messages"
```

---

### Task 2: catch 블록에 `safeScheduleSyncError` 적용

**Files:**
- Modify: `src/lib/sync/source-runner.ts:102-115` (catch 블록)

**Interfaces:**
- Consumes: `safeScheduleSyncError(error: unknown, seriesCode: string): string` (Task 1에서 추가됨)

- [ ] **Step 1: catch 블록 교체**

`src/lib/sync/source-runner.ts`의 catch 블록(102–115줄)을 아래로 교체한다.

```ts
  } catch (error) {
    const finishedAt = new Date().toISOString();
    console.error(`[sync] ${source.seriesCode} schedule sync error:`, error);
    const message = safeScheduleSyncError(error, source.seriesCode);
    await db.insert(syncLogs).values({
      id: logId,
      sourceId: source.id,
      seriesCode: source.seriesCode,
      status: "failed",
      message,
      startedAt,
      finishedAt,
    });
    throw error;
  }
```

기존 `const message = error instanceof Error ? error.message : "Unknown schedule sync error";` 줄이 사라지고 `safeScheduleSyncError` 호출로 대체된다.

- [ ] **Step 2: 전체 테스트 통과 확인**

```bash
node --import tsx --test src/lib/*.test.ts
```

기대 출력: 기존 테스트 개수 + 9 모두 PASS (숫자는 현재 45개 기준 → 54개)

- [ ] **Step 3: lint + build + cf:build 확인**

```bash
npm run lint
npm run build
npm run cf:build
```

기대 출력: 경고·오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/lib/sync/source-runner.ts
git commit -m "fix: sanitise sync failure messages before writing to syncLogs"
```
