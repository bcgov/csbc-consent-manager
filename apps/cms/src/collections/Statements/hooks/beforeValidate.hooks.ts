import { randomUUID } from "crypto";
import { FieldHook } from "payload";

export const generateId: FieldHook = ({ value }) => value ?? randomUUID();
