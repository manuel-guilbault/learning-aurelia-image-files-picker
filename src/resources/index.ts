import {FrameworkConfiguration} from 'aurelia-framework';

export function configure(config: FrameworkConfiguration) {
  config.globalResources([
    './attributes/blob-src',
    './attributes/file-drop-target',
    './elements/file-picker',
    './elements/image-files-picker',
    './value-converters/chunk',
  ]);
}
