import {
  customElement, inject, useView,
  bindable, bindingMode, DOM
} from 'aurelia-framework';

@customElement('file-picker')
@inject(Element)
@useView('./file-picker.html')
export class FilePicker {

  @bindable accept = '';
  @bindable multiple = false;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) files;

  input: HTMLInputElement;

  constructor(private element: HTMLElement) {
    element.focus = () => this.input.click();
  }

  filesChanged() {
    this.element.dispatchEvent(DOM.createCustomEvent('blur', { bubbles: true, cancelable: false }));
  }
}
