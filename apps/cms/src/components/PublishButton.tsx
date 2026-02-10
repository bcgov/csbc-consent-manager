"use client";

import {
  ConfirmationModal,
  useDocumentInfo,
  useField,
  useFormModified,
  useModal,
} from "@payloadcms/ui";
import { useCallback, useState } from "react";

const PUBLISH_MODAL_SLUG = "confirm-publish-version";

export const PublishButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: publishedAt } = useField<string>({ path: "publishedAt" });
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const { value: documentId } = useField<string>({ path: "document" });
  const modified = useFormModified();
  const [loading, setLoading] = useState(false);
  const { openModal } = useModal();

  const isPublished = Boolean(publishedAt) && !Boolean(archivedAt);

  if (!id || isPublished) return null;

  const handlePublish = useCallback(async () => {
    if (!id || !documentId) return;

    setLoading(true);
    try {
      // Archive other published versions for this document
      const othersRes = await fetch(
        `/api/versions?where[document][equals]=${documentId}&where[id][not_equals]=${id}&where[status][equals]=published&limit=0`,
      );
      if (othersRes.ok) {
        const others = await othersRes.json();
        const now = new Date().toISOString();
        await Promise.all(
          others.docs.map((v: { id: string }) =>
            fetch(`/api/versions/${v.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ archivedAt: now }),
            }),
          ),
        );
      }

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
  }, [id, documentId]);

  const handleClick = useCallback(() => {
    if (!publishedAt) {
      openModal(PUBLISH_MODAL_SLUG);
    } else {
      handlePublish();
    }
  }, [publishedAt, handlePublish, openModal]);

  return (
    <>
      <button
        type="button"
        className="btn btn--size-medium"
        style={{
          backgroundColor: loading || modified ? undefined : "#16a34a",
          color: loading || modified ? undefined : "#ffffff",
        }}
        disabled={loading || modified}
        onClick={handleClick}
      >
        {loading ? "Publishing..." : "Publish"}
      </button>
      <ConfirmationModal
        modalSlug={PUBLISH_MODAL_SLUG}
        heading="Confirm Publish"
        body="You are about to publish this version. Once a user accepts/rejects consent, it can no longer be modified."
        confirmLabel="Publish"
        confirmingLabel="Publishing..."
        cancelLabel="Cancel"
        onConfirm={handlePublish}
      />
    </>
  );
};
