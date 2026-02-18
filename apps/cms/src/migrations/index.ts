import * as migration_20260218_170247_initial from './20260218_170247_initial';

export const migrations = [
  {
    up: migration_20260218_170247_initial.up,
    down: migration_20260218_170247_initial.down,
    name: '20260218_170247_initial'
  },
];
