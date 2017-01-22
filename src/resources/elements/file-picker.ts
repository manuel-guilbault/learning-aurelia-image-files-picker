import {customElement, useView, bindable, bindingMode} from 'aurelia-framework';

@customElement('file-picker')
@useView('./file-picker.html')
export class FilePicker {

  @bindable accept = '';
  @bindable multiple = false;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) files: FileList;

  input: HTMLInputElement;

  filesChanged() {
    if (!this.files) {
      this.clearSelection();
    }
  }

  private clearSelection() {
      this.input.type = '';
      this.input.type = 'file';
  }
}
