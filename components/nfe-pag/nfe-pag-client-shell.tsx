"use client";

import React, { useState } from "react";
import { NfePagHeader } from "@/components/nfe-pag/nfe-pag-header";
import { NfePagTabsNav, TabKey } from "@/components/nfe-pag/nfe-pag-tabs-nav";
import { SourceModal } from "@/components/nfe-pag/nfe-pag-source-modal";
import { TabEvolution } from "@/components/nfe-pag/tabs/tab-evolution";
import { TabStructure } from "@/components/nfe-pag/tabs/tab-structure";
import { TabDomains } from "@/components/nfe-pag/tabs/tab-domains";
import { TabValidations } from "@/components/nfe-pag/tabs/tab-validations";
import { TabSimulator } from "@/components/nfe-pag/tabs/tab-simulator";
import { TabGuidelines } from "@/components/nfe-pag/tabs/tab-guidelines";

export function NfePagClientShell() {
  const [activeTab, setActiveTab] = useState<TabKey>("evolution");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const handleOpenSourceModal = (title: string, description: string) => {
    setModalState({
      isOpen: true,
      title,
      description,
    });
  };

  const handleCloseSourceModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleResetFilters = () => {
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Header with search & quick stats */}
      <NfePagHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* Tabs navigation */}
      <NfePagTabsNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Tab Content */}
      <div className="min-h-[480px]">
        {activeTab === "evolution" && (
          <TabEvolution onOpenSourceModal={handleOpenSourceModal} />
        )}
        {activeTab === "structure" && (
          <TabStructure
            searchQuery={searchQuery}
            onOpenSourceModal={handleOpenSourceModal}
          />
        )}
        {activeTab === "domains" && (
          <TabDomains
            searchQuery={searchQuery}
            onOpenSourceModal={handleOpenSourceModal}
          />
        )}
        {activeTab === "validations" && (
          <TabValidations
            searchQuery={searchQuery}
            onOpenSourceModal={handleOpenSourceModal}
          />
        )}
        {activeTab === "simulator" && <TabSimulator />}
        {activeTab === "guidelines" && (
          <TabGuidelines onOpenSourceModal={handleOpenSourceModal} />
        )}
      </div>

      {/* Normative Source Modal */}
      <SourceModal
        isOpen={modalState.isOpen}
        onClose={handleCloseSourceModal}
        title={modalState.title}
        description={modalState.description}
      />
    </div>
  );
}
