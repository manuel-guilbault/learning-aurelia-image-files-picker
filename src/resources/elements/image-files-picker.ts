import {customElement, useView, bindable, bindingMode, observable} from 'aurelia-framework';
import {AcceptValidator} from '../accept-validator';

@customElement('image-files-picker')
@useView('./image-files-picker.html')
export class ImageFilesPicker {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) files: File[] = [];
  @bindable accept = 'image/*';
  private acceptValidator: AcceptValidator = AcceptValidator.parse(this.accept);

  @observable() selectedFiles: FileList;

  acceptChanged() {
    this.acceptValidator = AcceptValidator.parse(this.accept);
  }

  selectedFilesChanged() {
    if (this.selectedFiles) {
      this.add(this.selectedFiles);
      this.selectedFiles = null;
    }
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
}
