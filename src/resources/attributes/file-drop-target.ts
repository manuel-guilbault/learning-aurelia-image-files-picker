import {customAttribute, bindingMode, autoinject} from 'aurelia-framework';

@customAttribute('file-drop-target', bindingMode.twoWay)
@autoinject
export class FileDropTarget {

  value: FileList | (({files: FileList}) => void);
  
  constructor(private element: Element) {}

  attached() {
    this.element.addEventListener('dragover', this.onDragOver);
    this.element.addEventListener('drop', this.onDrop);
    this.element.addEventListener('dragend', this.onDragEnd);
  }

  private onDragOver = (e) => {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy';
  };

  private onDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (typeof this.value === 'function') {
      this.value({ files: e.dataTransfer.files });
    } else {
      this.value = e.dataTransfer.files;
    }
  };

  private onDragEnd = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    e.dataTransfer.clearData();
  };

  detached() {
    this.element.removeEventListener('dragend', this.onDragEnd);
    this.element.removeEventListener('drop', this.onDrop);
    this.element.removeEventListener('dragover', this.onDragOver);
  }
}
