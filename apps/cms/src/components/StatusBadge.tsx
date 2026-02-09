"use client";

import { useField } from "@payloadcms/ui";

const styles: Record<string, React.CSSProperties> = {
  draft: {
    border: "1px solid var(--theme-elevation-400)",
    color: "var(--theme-elevation-600)",
    backgroundColor: "transparent",
  },
  published: {
    border: "1px solid #22c55e",
    color: "#fff",
    backgroundColor: "#22c55e",
  },
  archived: {
    border: "1px solid #ef4444",
    color: "#fff",
    backgroundColor: "#ef4444",
  },
};

const labels: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export const StatusBadge: React.FC = () => {
  const { value: status } = useField<string>({ path: "status" });
  const key = status || "draft";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 12px",
        borderRadius: "9999px",
        fontSize: "13px",
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        ...styles[key],
      }}
    >
      {labels[key] || key}
    </span>
  );
};
