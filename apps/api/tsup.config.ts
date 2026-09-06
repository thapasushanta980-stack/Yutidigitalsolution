import { defineConfig } from 'tsup';

// Production bundle: compile TS (incl. workspace @yukti/* source) to dist/.
// node_modules (express, prisma client, bcrypt, pino, …) stay external.
export default defineConfig({
  entry: ['src/server.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  clean: true,
  sourcemap: true,
  noExternal: [/^@yukti\//], // bundle workspace TS packages…
  // …but keep the Prisma client external (CJS + generated engine files;
  // it must be required from node_modules at runtime, not inlined).
  external: ['@prisma/client', '.prisma/client'],
  splitting: false,
  minify: false,
});
