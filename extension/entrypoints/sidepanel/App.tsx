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

export default function App() {
  const [section, setSection] = useState<PanelSection>("application");

  useEffect(() => {
    getLastPanelSection().then(setSection);
  }, []);

  const select = (s: PanelSection) => {
    setSection(s);
    void setLastPanelSection(s);
  };

  let content = <ApplicationSection />;
  if (section === "profile") content = <ProfileSection />;
  if (section === "resume") content = <ResumeSection />;
  if (section === "ai") content = <AiSettingsSection />;

  return (
    <div className="layout">
      <AppSidebar active={section} onSelect={select} />
      <main className="main">{content}</main>
    </div>
  );
}
