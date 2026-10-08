import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import ProfileSection from "@/components/sections/ProfileSection";
import ResumeSection from "@/components/sections/ResumeSection";
import ApplicationSection from "@/components/sections/ApplicationSection";
import AiSettingsSection from "@/components/sections/AiSettingsSection";
import {
  getLastPanelSection,
  setLastPanelSection,
  type PanelSection,
} from "@/lib/storage/config";
import type { MergeConflict } from "@/lib/profile/merge-from-pdf";
import type { CandidateProfile } from "@/lib/profile/schema";

export default function App() {
  const [section, setSection] = useState<PanelSection>("application");
  const [pendingMerge, setPendingMerge] = useState<{
    profile: CandidateProfile;
    incoming: CandidateProfile;
    conflicts: MergeConflict[];
  } | null>(null);

  useEffect(() => {
    getLastPanelSection().then(setSection);
  }, []);

  const select = (s: PanelSection) => {
    setSection(s);
    void setLastPanelSection(s);
  };

  let content = <ApplicationSection />;
  if (section === "profile") {
    content = (
      <ProfileSection
        pendingMerge={pendingMerge}
        onClearPendingMerge={() => setPendingMerge(null)}
      />
    );
  }
  if (section === "resume") {
    content = (
      <ResumeSection
        onNavigateToProfile={() => select("profile")}
        onStructuredDraft={(profile, conflicts, incoming) => {
          if (conflicts.length > 0) {
            setPendingMerge({ profile, incoming, conflicts });
          } else {
            setPendingMerge(null);
          }
          select("profile");
        }}
      />
    );
  }
  if (section === "ai") {
    content = (
      <AiSettingsSection
        onDeleted={() => {
          setPendingMerge(null);
          select("application");
        }}
      />
    );
  }

  return (
    <div className="layout">
      <AppSidebar active={section} onSelect={select} />
      <main className="main">{content}</main>
    </div>
  );
}
