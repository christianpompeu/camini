import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PATIENTS } from "@/data/nutre/mock-patients";
import { getPatientDetail } from "@/data/nutre/mock-patient-details";
import { PatientProfilePageClient } from "@/components/nutre/profile/patient-profile-page-client";

export function generateStaticParams() {
  return MOCK_PATIENTS.map((patient) => ({
    id: patient.id,
  }));
}

export default async function NutrePatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = getPatientDetail(id);

  if (!patient && !id.startsWith("demo-")) {
    notFound();
  }
  return <PatientProfilePageClient id={id} patient={patient} />;
}
