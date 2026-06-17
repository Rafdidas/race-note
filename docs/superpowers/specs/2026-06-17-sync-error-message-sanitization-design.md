# Sync 실패 로그 안전 메시지 정제 설계

## 문제 정의

`src/lib/sync/source-runner.ts`의 실패 catch 블록이 `error.message`를 그대로
`syncLogs.message`에 저장한다. `applyNormalizedSchedule` 내부 D1 `batch()` 실패 시
SQL 전문과 바인딩 파라미터가 오류 메시지에 포함되며, 이 값이 `/admin/sync`
Execution history 테이블에 그대로 노출된다.

AI 콘텐츠 생성 경로의 `safeGenerationError()`는 이미 동일 패턴으로 정제를 처리하고
있으나, 일정 수집 경로에는 해당하는 정제 함수가 없다.

---

## 목표

- `syncLogs.message`에 SQL·바인딩 파라미터 등 내부 상세가 노출되지 않도록 한다.
- 운영 진단에 유용한 범주(HTTP 상태, 타임아웃, 크기 초과 등)는 그대로 보존한다.
- 원시 오류 전체는 Worker 콘솔(`console.error`)에만 남겨 디버깅 단서를 유지한다.
- 변경 범위를 `source-runner.ts` 단일 파일과 테스트로 최소화한다.

---

## 아키텍처

### 새 함수: `safeScheduleSyncError`

위치: `src/lib/sync/source-runner.ts` (export하여 테스트 가능)

```ts
export function safeScheduleSyncError(error: unknown, seriesCode: string): string
```

**보존하는 메시지 패턴** (실제 운영 원인 파악에 직접 유용한 경우):

| 패턴 | 예시 저장 메시지 |
|------|-----------------|
| `"... returned HTTP ${status}"` | `WRC source returned HTTP 403` |
| `"Schedule source response was too large"` | 그대로 보존 |
| `AbortError` 또는 `TimeoutError` (이름 기준) | `${seriesCode} schedule source request timed out` |
| `"Enabled sync source ... is missing"` | `${seriesCode} sync source is not configured` |

**모든 기타 오류** (D1 batch, 파싱 실패, 예상치 못한 런타임 오류 등):

```
${seriesCode} schedule sync failed
```

**최대 길이**: 160자 (AI 경로 `safeGenerationError`와 동일)

### catch 블록 수정

`source-runner.ts`의 기존 catch 블록:

```ts
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown schedule sync error";
  // ... insert syncLog with message
}
```

변경 후:

```ts
} catch (error) {
  console.error(`[sync] ${source.seriesCode} schedule sync error:`, error);
  const message = safeScheduleSyncError(error, source.seriesCode);
  // ... insert syncLog with message (동일 구조 유지)
  throw error; // 상위 runAllScheduleSync 집계 유지
}
```

`throw error`는 `all-sync.ts`의 `successes`/`failures` 집계에 필요하므로 유지한다.

---

## 변경 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/sync/source-runner.ts` | `safeScheduleSyncError` 추가, catch 블록 수정 |
| `src/lib/sync/source-runner.test.ts` | 신규: 정제 함수 단위 테스트 |

**변경 없는 영역:**

- DB 스키마·마이그레이션: `syncLogs.message` 컬럼 타입 그대로
- UI(`/admin/sync` 페이지): 표시 구조 그대로, 내용만 안전해짐
- AI 생성 경로(`safeGenerationError`): 이미 정제됨
- `all-sync.ts`, `f1-sync.ts`, `wec-sync.ts`, `wrc-sync.ts`: 변경 없음

---

## 테스트 설계

`src/lib/sync/source-runner.test.ts` (신규):

| 케이스 | 입력 | 기대 출력 |
|--------|------|-----------|
| HTTP 상태 오류 | `Error("WRC source returned HTTP 403")` | `"WRC source returned HTTP 403"` |
| 크기 초과 | `Error("Schedule source response was too large")` | 그대로 |
| AbortError 타임아웃 | `new DOMException("...", "AbortError")` | `"WEC schedule source request timed out"` |
| 소스 미설정 | `Error("Enabled sync source abc is missing")` | `"F1 sync source is not configured"` |
| D1 batch 오류(SQL 포함) | `Error("D1_ERROR: SQLITE_ERROR: ... VALUES (?, ?) ...")` | `"F1 schedule sync failed"` |
| 파싱 오류 | `Error("Unexpected token at position 12")` | `"WRC schedule sync failed"` |
| 비 Error 객체 | 문자열, null 등 | `"F1 schedule sync failed"` |
| 160자 초과 허용 메시지 | 161자 이상 HTTP 오류 문자열 | 160자로 자름 |

---

## 검증 계획

```bash
npm test          # 새 단위 테스트 포함 전체 테스트
npm run lint
npm run build
```

UI 확인은 필요 없음 (표시 구조 불변).  
원격 D1·배포 변경 없음.
