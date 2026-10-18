"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BellRing,
  CheckCircle,
  MessageCircle,
  FileText,
  ExternalLink,
  Check,
} from "lucide-react";
import { MOCK_CLINICAL_ALERTS } from "@/data/nutre/mock-alerts";

export function DashboardClinicalAlerts() {
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="rounded-xl bg-[#FFFFFF] shadow-2xs p-5 sm:p-6 border border-[#EAE5F2]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#EDE5FA]/70">
        <div className="flex items-center gap-2">
          <BellRing className="w-5 h-5 text-[#6846B5]" />
          <h2 className="font-heading text-lg font-semibold text-[#1D1928]">
            Diários &amp; Avisos
          </h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-[#FFDAD6] text-[#93000A] text-[11px] font-semibold">
          3 avisos demonstrativos
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 pt-3.5">
        {MOCK_CLINICAL_ALERTS.map((alert) => {
          const isAck = acknowledged[alert.id];

          return (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isAck
                  ? "bg-[#F8F1FF]/40 border-[#EAE5F2] opacity-60"
                  : "bg-[#F8F1FF] border-[#EDE5FA] hover:border-[#B8A1E3]"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    alert.type === "meta"
                      ? "bg-[#93AA91]"
                      : alert.type === "duvida"
                      ? "bg-[#6846B5]"
                      : "bg-[#BA1A1A]"
                  }`}
                />

                <div className="space-y-1 w-full min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[#1D1928] truncate">
                      {alert.patientName}
                    </span>
                    <span className="font-tabular text-[10px] text-[#7A7483] shrink-0">
                      {alert.time}
                    </span>
                  </div>

                  <p className="text-xs text-[#494552] leading-snug">
                    {alert.message}
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        alert.type === "meta"
                          ? "bg-[#D1E9CE] text-[#0C200F]"
                          : alert.type === "duvida"
                          ? "bg-[#EBDDFF] text-[#230E48]"
                          : "bg-[#FFDAD6] text-[#93000A]"
                      }`}
                    >
                      {alert.tag}
                    </span>

                    {isAck ? (
                      <span className="text-[11px] text-[#93AA91] font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ciente
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        type="button"
                        className="text-[#6846B5] hover:underline text-xs font-semibold cursor-pointer"
                      >
                        Marcar ciente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
