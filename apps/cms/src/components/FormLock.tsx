"use client";

import { useDocumentInfo, useField } from "@payloadcms/ui";
import { useEffect, useState } from "react";

export const FormLock: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: publishedAt } = useField<string>({ path: "publishedAt" });
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const [hasStatements, setHasStatements] = useState<boolean | null>(null);

  const isArchived = Boolean(archivedAt);
  const isPublished = Boolean(publishedAt) && !isArchived;

  useEffect(() => {
    if (!id || !isPublished) return;
    fetch(`/api/statements?where[version][equals]=${id}&limit=1`)
      .then((res) => res.json())
      .then((data) => setHasStatements(data.totalDocs > 0))
      .catch(() => setHasStatements(null));
  }, [id, isPublished]);

  const isLocked = isArchived || (isPublished && hasStatements === true);
  const isEditablePublished = isPublished && hasStatements === false;

  if (!isLocked && !isEditablePublished) return null;

  if (isEditablePublished) {
    return (
      <div
        style={{
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: 4,
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid #3b82f6",
          color: "#2563eb",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        You can continue editing this version until a user accepts/rejects
        consent.
      </div>
    );
  }

  const message = isArchived
    ? "This version has been archived and can no longer be edited."
    : "This version has associated consent records and can no longer be edited.";

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
