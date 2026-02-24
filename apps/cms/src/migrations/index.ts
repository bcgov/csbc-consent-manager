import * as migration_20260220_001020_initial from "./20260220_001020_initial";
import * as migration_20260224_221241_add_version_searchContent from "./20260224_221241_add_version_searchContent";

export const migrations = [
  {
    up: migration_20260220_001020_initial.up,
    down: migration_20260220_001020_initial.down,
    name: "20260220_001020_initial",
  },
  {
    up: migration_20260224_221241_add_version_searchContent.up,
    down: migration_20260224_221241_add_version_searchContent.down,
    name: "20260224_221241_add_version_searchContent",
  },
];
