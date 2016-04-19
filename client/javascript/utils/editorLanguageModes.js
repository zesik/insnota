import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/jsx/jsx';

export const LANGUAGE_MODES = [
  { name: 'Plain Text', mimeType: 'text/plain' },
  { name: 'Markdown', mimeType: 'text/x-gfm' },
  { name: 'JavaScript', mimeType: 'text/javascript' },
  { name: 'JavaScript React', mimeType: 'text/jsx' }
];

export function getModeName(mimeType) {
  for (let i = 0; i < LANGUAGE_MODES.length; ++i) {
    if (LANGUAGE_MODES[i].mimeType === mimeType) {
      return LANGUAGE_MODES[i].name;
    }
  }
  return 'Unknown';
}
