import {customElement, useView, bindable, bindingMode} from 'aurelia-framework';

@customElement('file-picker')
@useView('./file-picker.html')
export class FilePicker {

  @bindable accept = '';
  @bindable multiple = false;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) files;
}
