import * as migration_20260220_001020_initial from './20260220_001020_initial';

export const migrations = [
  {
    up: migration_20260220_001020_initial.up,
    down: migration_20260220_001020_initial.down,
    name: '20260220_001020_initial'
  },
];
