"use client";

import { useField } from "@payloadcms/ui";

export const FormLock: React.FC = () => {
  const { value: publishedAt } = useField<string>({ path: "publishedAt" });
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const isArchived = Boolean(archivedAt);
  const isPublished = Boolean(publishedAt) && !isArchived;

  const isLocked = isArchived || isPublished;

  if (!isLocked) return null;

  const message = isArchived
    ? "This version has been archived and can no longer be edited."
    : "This version has been published and can no longer be edited.";

  return (
    <div
      style={{
        padding: "12px 16px",
        marginBottom: 16,
        borderRadius: 4,
        backgroundColor: isArchived
          ? "rgba(239, 68, 68, 0.1)"
          : "rgba(34, 197, 94, 0.1)",
        border: `1px solid ${isArchived ? "#ef4444" : "#22c55e"}`,
        color: isArchived ? "#ef4444" : "#16a34a",
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {message}
      <style>{`
        .render-fields {
          pointer-events: none;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};
