import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminRaceEditor } from "@/components/admin/AdminRaceEditor/AdminRaceEditor";
import { getAdminRaceById } from "@/lib/admin-data";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const race = await getAdminRaceById(id);
  return race ? { title: `Edit ${race.title}` } : {};
}

export default async function AdminRaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; status?: string }>;
}) {
  const { id } = await params;
  const actionResult = await searchParams;
  const race = await getAdminRaceById(id);
  if (!race) notFound();

  return <AdminRaceEditor race={race} {...actionResult} />;
}
