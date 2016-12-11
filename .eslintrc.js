module.exports = {
  'extends': 'airbnb',
  'env': {
    'browser': true,
    'node': true
  },
  'rules': {
    'comma-dangle': ['error', 'never'],
    'func-names': ['off'],
    'max-len': ['error', 120, 2, { 'ignoreUrls': true }],
    'no-console': ['warn', { 'allow': ['warn', 'error'] }],
    'no-multiple-empty-lines': ['warn', { 'max': 1 }],
    'no-param-reassign': ['error', { 'props': false }],
    'no-unused-vars': ['warn'],
    'no-underscore-dangle': ['off'],
    'no-bitwise': ['off'],
    'no-plusplus': ['off'],
    'prefer-arrow-callback': ['off'],
    'react/prefer-stateless-function': ['warn'],
    'react/no-did-mount-set-state': ['off']
  }
};
