import {customAttribute, bindingMode, autoinject} from 'aurelia-framework';

@customAttribute('file-drop-target', bindingMode.twoWay)
@autoinject
export class FileDropTarget {

  value: FileList;
  
  constructor(private element: Element) {}

  attached() {
    this.element.addEventListener('dragover', this.onDragOver);
    this.element.addEventListener('drop', this.onDrop);
    this.element.addEventListener('dragend', this.onDragEnd);
  }

  private onDragOver = (e) => {
    e.preventDefault();
  };

  private onDrop = (e) => {
    e.preventDefault();
    this.value = e.dataTransfer.files;
  };

  private onDragEnd = (e) => {
    e.dataTransfer.clearData();
  };

  detached() {
    this.element.removeEventListener('dragend', this.onDragEnd);
    this.element.removeEventListener('drop', this.onDrop);
    this.element.removeEventListener('dragover', this.onDragOver);
  }
}
