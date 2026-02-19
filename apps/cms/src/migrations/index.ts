import * as migration_20260219_225854_initial from './20260219_225854_initial';

export const migrations = [
  {
    up: migration_20260219_225854_initial.up,
    down: migration_20260219_225854_initial.down,
    name: '20260219_225854_initial'
  },
];
