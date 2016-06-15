import 'codemirror/mode/clike/clike';
import 'codemirror/mode/css/css';
import 'codemirror/mode/dockerfile/dockerfile';
import 'codemirror/mode/erlang/erlang';
import 'codemirror/mode/gfm/gfm';
import 'codemirror/mode/go/go';
import 'codemirror/mode/haskell/haskell';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/lua/lua';
import 'codemirror/mode/octave/octave';
import 'codemirror/mode/pascal/pascal';
import 'codemirror/mode/perl/perl';
import 'codemirror/mode/php/php';
import 'codemirror/mode/python/python';
import 'codemirror/mode/ruby/ruby';
import 'codemirror/mode/rust/rust';
import 'codemirror/mode/sass/sass';
import 'codemirror/mode/stex/stex';
import 'codemirror/mode/swift/swift';
import 'codemirror/mode/xml/xml';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/mode/htmlmixed/htmlmixed';

export const LANGUAGE_MODES = [
  { name: 'C', mimeType: 'text/x-csrc' },
  { name: 'C++', mimeType: 'text/x-c++src' },
  { name: 'C#', mimeType: 'text/x-csharp' },
  { name: 'CSS', mimeType: 'text/css' },
  { name: 'Erlang', mimeType: 'text/x-erlang' },
  { name: 'Dockerfile', mimeType: 'text/x-dockerfile' },
  { name: 'Go', mimeType: 'text/x-go' },
  { name: 'Haskell', mimeType: 'text/x-haskell' },
  { name: 'HTML', mimeType: 'text/html' },
  { name: 'LaTeX', mimeType: 'text/x-stex' },
  { name: 'Less', mimeType: 'text/x-less' },
  { name: 'Lua', mimeType: 'text/x-lua' },
  { name: 'Markdown', mimeType: 'text/x-gfm' },
  { name: 'Objective-C', mimeType: 'text/x-objectivec' },
  { name: 'Octave/MATLAB', mimeType: 'text/x-octave' },
  { name: 'Pascal', mimeType: 'text/x-pascal' },
  { name: 'Perl', mimeType: 'text/x-perl' },
  { name: 'PHP', mimeType: 'text/x-php' },
  { name: 'Plain Text', mimeType: 'text/plain' },
  { name: 'Python', mimeType: 'text/x-python' },
  { name: 'Java', mimeType: 'text/x-java' },
  { name: 'JavaScript', mimeType: 'text/javascript' },
  { name: 'JavaScript React', mimeType: 'text/jsx' },
  { name: 'Ruby', mimeType: 'text/x-ruby' },
  { name: 'Rust', mimeType: 'text/x-rustsrc' },
  { name: 'Sass', mimeType: 'text/x-sass' },
  { name: 'Scala', mimeType: 'text/x-scala' },
  { name: 'SCSS', mimeType: 'text/x-scss' },
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
