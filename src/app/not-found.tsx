import { EmptyState } from "@/components/EmptyState/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      actionHref="/"
      actionLabel="Back to briefing"
      description="요청한 페이지나 공개된 레이스를 찾을 수 없습니다. 홈에서 이번 주 브리핑을 확인해 주세요."
      eyebrow="Page not found"
      index="E/404"
      title="Off track"
    />
  );
}
