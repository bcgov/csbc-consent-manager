"use client";

import { useDocumentInfo, useField } from "@payloadcms/ui";
import { useCallback, useState } from "react";

export const ArchiveButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const { value: status } = useField<string>({ path: "status" });
  const [loading, setLoading] = useState(false);

  const isArchived = Boolean(archivedAt);
  const isPublished = status === "published";

  const handleArchive = useCallback(async () => {
    if (!id || isArchived) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Failed to archive version: ${res.status}`);

      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id, isArchived]);

  return (
    <button
      type="button"
      className="btn btn--style-secondary btn--size-medium"
      disabled={isArchived || !isPublished || loading || !id}
      onClick={handleArchive}
    >
      {loading ? "Archiving..." : "Archive"}
    </button>
  );
};
