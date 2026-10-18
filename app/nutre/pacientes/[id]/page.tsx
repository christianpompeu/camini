import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PATIENTS } from "@/data/nutre/mock-patients";
import { getPatientDetail } from "@/data/nutre/mock-patient-details";
import { PatientProfileHeader } from "@/components/nutre/profile/patient-profile-header";
import { PatientProfileTabs } from "@/components/nutre/profile/patient-profile-tabs";

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

  if (!patient) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PatientProfileHeader patient={patient} />
      <PatientProfileTabs patient={patient} />
    </div>
  );
}
