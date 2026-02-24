import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext";
import { CollectionBeforeChangeHook } from "payload";

export const populateSearchContent: CollectionBeforeChangeHook = async ({
  data,
}) => {
  if (data?.content) {
    data.searchContent = convertLexicalToPlaintext({ data: data.content });
  } else {
    data.searchContent = "";
  }

  return data;
};
