"use client";

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-0 border-b border-notion-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-[14px] font-medium transition-colors duration-150 -mb-px ${
            activeTab === tab.id
              ? "text-notion-text border-b-2 border-notion-text"
              : "text-notion-muted hover:text-notion-text"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 text-[11px] text-notion-muted">
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
