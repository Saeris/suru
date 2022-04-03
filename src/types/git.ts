import type git from "isomorphic-git";
import { areTuplesEqual } from "../utils/areTuplesEqual";
import type { Unwrap } from ".";

type RawStatus = Unwrap<Awaited<ReturnType<typeof git["statusMatrix"]>>>;

export type GitStatus = [
  /** The name of the file. */
  fileName: RawStatus[0],
  /**
   * Head Status of the file, either:
   *
   * - `0`: absent
   * - `1`: present
   */
  headStatus: RawStatus[1],
  /**
   * Head Status of the file, either:
   *
   * - `0`: absent
   * - `1`: unmodified
   * - `2`: modified
   */
  workDirStatus: RawStatus[2],
  /**
   * Head Status of the file, either:
   *
   * - `0`: absent
   * - `1`: unstaged
   * - `2`: staged
   * - `3`: modified
   */
  stageStatus: RawStatus[3]
];

const statusMatrix = {
  newUntracked: [0, 2, 0],
  addedStaged: [0, 2, 2],
  addedWithUnstagedChanges: [0, 2, 3],
  unmodified: [1, 1, 1],
  modifiedUnstaged: [1, 2, 1],
  modifiedStaged: [1, 2, 2],
  modifiedWithUnstagedChanges: [1, 2, 3],
  deletedUnstaged: [1, 0, 1],
  deletedStaged: [1, 0, 0]
};

export const isNew = ([, ...status]: GitStatus): boolean =>
  areTuplesEqual(status, statusMatrix.newUntracked) ||
  areTuplesEqual(status, statusMatrix.addedStaged) ||
  areTuplesEqual(status, statusMatrix.addedWithUnstagedChanges);

export const isClean = ([, ...status]: GitStatus): boolean =>
  areTuplesEqual(status, statusMatrix.unmodified);

export const wasDeleted = ([, ...status]: GitStatus): boolean =>
  areTuplesEqual(status, statusMatrix.deletedUnstaged) ||
  areTuplesEqual(status, statusMatrix.deletedStaged);
