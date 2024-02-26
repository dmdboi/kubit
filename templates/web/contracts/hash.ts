/**
 * Contract source: https://git.io/Jfefs
 *
 * Feel free to let us know via PR, if you find something broken in this contract
 * file.
 */

import type { InferListFromConfig } from '@kubit/core/build/config';
import type hashConfig from '../config/hash';

declare module '@ioc:Kubit/Hash' {
  interface HashersList extends InferListFromConfig<typeof hashConfig> {}
}