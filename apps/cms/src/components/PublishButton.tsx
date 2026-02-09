"use client";

import { useDocumentInfo, useField } from "@payloadcms/ui";
import { useCallback, useState } from "react";

export const PublishButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: publishedAt } = useField<string>({ path: "publishedAt" });
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const { value: documentId } = useField<string>({ path: "document" });
  const [loading, setLoading] = useState(false);

  const isDisabled = Boolean(publishedAt) && !Boolean(archivedAt);

  const handlePublish = useCallback(async () => {
    if (!id || !documentId || isDisabled) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publishedAt: new Date().toISOString(),
          archivedAt: null,
        }),
      });
      if (!res.ok) throw new Error(`Failed to publish version: ${res.status}`);

      const docRes = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishedVersion: id }),
      });
      if (!docRes.ok)
        throw new Error(`Failed to update document: ${docRes.status}`);

      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id, documentId, isDisabled]);

  return (
    <button
      type="button"
      className="btn btn--style-primary btn--size-medium"
      disabled={isDisabled || loading || !id}
      onClick={handlePublish}
    >
      {loading ? "Publishing..." : "Publish"}
    </button>
  );
};
