import {customElement, useView, bindable, bindingMode} from 'aurelia-framework';
import {AcceptValidator} from '../accept-validator';

@customElement('image-files-picker')
@useView('./image-files-picker.html')
export class ImageFilesPicker {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) files: File[] = [];
  @bindable accept = 'image/*';
  private acceptValidator: AcceptValidator = AcceptValidator.parse(this.accept);

  selectedFiles: FileList;

  acceptChanged() {
    this.acceptValidator = AcceptValidator.parse(this.accept);
  }

  add(files: FileList) {
    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      const isValid = this.acceptValidator.isValid(file);
      if (isValid) {
        this.files.push(file);
      }
    }
  }

  remove(index) {
    this.files.splice(index, 1);
  }

  addSelectedFiles() {
    this.add(this.selectedFiles);
    this.selectedFiles = null;
  }
}
