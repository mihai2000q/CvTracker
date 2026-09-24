import { defineContract, type ContractModelBuilder } from '@prisma/orm-postgres/contract-builder';

type BuilderFn = Parameters<typeof defineContract>[1];
type ExtractHelpers<T> = T extends (helpers: infer H) => unknown ? H : never;

export type ContractHelpers = ExtractHelpers<BuilderFn>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Model = ContractModelBuilder<string, any, any, any, any, any, any>;
