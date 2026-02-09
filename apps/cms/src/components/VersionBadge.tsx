"use client";

import { useField } from "@payloadcms/ui";

export const VersionBadge: React.FC = () => {
  const { value: version } = useField<number>({ path: "version" });

  if (!version) return null;

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
        border: "1px solid var(--theme-elevation-400)",
        color: "var(--theme-elevation-600)",
        backgroundColor: "transparent",
      }}
    >
      Version: {version}
    </span>
  );
};
