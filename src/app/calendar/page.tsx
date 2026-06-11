import type { Metadata } from "next";
import { CalendarSchedule } from "@/components/CalendarSchedule/CalendarSchedule";
import { PageHeader } from "@/components/PageHeader/PageHeader";

export const metadata: Metadata = {
  title: "Calendar",
  description: "F1, WEC, WRC 통합 일정",
};

export default function CalendarPage() {
  return (
    <div className="public-page">
      <PageHeader
        description="F1, WEC, WRC의 주요 세션을 날짜순으로 모았습니다. 모든 시간은 한국 표준시입니다."
        eyebrow="Unified race schedule"
        index="C/01"
        meta="F1 · WEC · WRC / KST"
        title="Calendar"
      />
      <section className="public-page__content container">
        <CalendarSchedule />
      </section>
    </div>
  );
}
