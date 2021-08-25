export default {
  typescript: {
    rewritePaths: {
      'src/': 'build/',
    },
    compile: true,
  },
  files: [
    'test/**/*.ts',
    '!test/browser-env.d.ts',
    '!test/mock/**/*.ts',
    '!test/data/**/*.ts',
    '!test/polyfill/**/*.ts',
  ],
  ingoredByWatcher: ['src/**/*.ts'],
  verbose: true,
  timeout: '20s',
  extensions: ['ts'],
};
