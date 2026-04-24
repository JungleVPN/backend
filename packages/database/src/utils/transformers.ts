/** TypeORM returns bigint as string — this converts it back to number on read. */
export const bigintTransformer = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};
