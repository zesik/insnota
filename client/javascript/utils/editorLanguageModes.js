import 'codemirror/mode/clike/clike';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/go/go';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/python/python';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/stex/stex';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/htmlmixed/htmlmixed';

export const LANGUAGE_MODES = [
  { name: 'C', mimeType: 'text/x-csrc' },
  { name: 'C++', mimeType: 'text/x-c++src' },
  { name: 'C#', mimeType: 'text/x-csharp' },
  { name: 'Go', mimeType: 'text/x-go' },
  { name: 'Haskell', mimeType: 'text/x-haskell' },
  { name: 'HTML', mimeType: 'text/html' },
  { name: 'LaTeX', mimeType: 'text/x-stex' },
  { name: 'Markdown', mimeType: 'text/x-gfm' },
  { name: 'Objective-C', mimeType: 'text/x-objectivec' },
  { name: 'Plain Text', mimeType: 'text/plain' },
  { name: 'Python', mimeType: 'text/x-python' },
  { name: 'Java', mimeType: 'text/x-java' },
  { name: 'JavaScript', mimeType: 'text/javascript' },
  { name: 'JavaScript React', mimeType: 'text/jsx' },
  { name: 'Ruby', mimeType: 'text/x-ruby' },
  { name: 'Swift', mimeType: 'text/x-swift' },
  { name: 'XML', mimeType: 'application/xml' },
  { name: 'YAML', mimeType: 'text/x-yaml' }
];

export function getModeName(mimeType) {
  for (let i = 0; i < LANGUAGE_MODES.length; ++i) {
    if (LANGUAGE_MODES[i].mimeType === mimeType) {
      return LANGUAGE_MODES[i].name;
    }
  }
  return 'Unknown';
}
