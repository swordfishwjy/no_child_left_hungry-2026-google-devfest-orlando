import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SCHOOLS, getSchool } from "@/lib/data";

/** Prerender every school so the whole portal is static. */
export function generateSchoolParams() {
  return SCHOOLS.map((s) => ({ id: s.id }));
}

export async function resolveSchool(params: Promise<{ id: string }>) {
  const { id } = await params;
  const school = getSchool(decodeURIComponent(id));
  if (!school) notFound();
  return school;
}

export async function schoolMetadata(
  params: Promise<{ id: string }>,
  section: string,
): Promise<Metadata> {
  const { id } = await params;
  const school = getSchool(decodeURIComponent(id));
  return {
    title: school
      ? `${school.name} · ${section} · No Child Left Hungry`
      : "School not found · No Child Left Hungry",
  };
}
