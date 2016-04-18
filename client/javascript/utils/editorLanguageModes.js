import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/jsx/jsx';

const LANGUAGE_MODES = [
  { name: 'Plain Text', mimeType: 'text/plain' },
  { name: 'Markdown', mimeType: 'text/x-gfm' },
  { name: 'JavaScript', mimeType: 'text/javascript' },
  { name: 'JavaScript React', mimeType: 'text/jsx' }
];

export default LANGUAGE_MODES;
