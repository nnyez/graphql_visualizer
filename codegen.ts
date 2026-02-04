import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:4000/graphql',
  documents: ['app/**/*.ts', 'app/**/*.tsx'],
  generates: {
    'app/lib/types/generated.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        enumsAsTypes: true,
        useIndexSignature: true,
      },
    },
  },
};

export default config;
