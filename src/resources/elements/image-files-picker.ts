import {
  customElement, autoinject, useView, bindable, 
  bindingMode, ObserverLocator, InternalPropertyObserver
} from 'aurelia-framework';
import {AcceptValidator} from '../accept-validator';

@customElement('image-files-picker')
@autoinject
@useView('./image-files-picker.html')
export class ImageFilesPicker {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) files: File[] = [];
  @bindable accept = 'image/*';
  private acceptValidator: AcceptValidator;

  selectedFiles: FileList;
  private selectedFilesObserver: InternalPropertyObserver;

  constructor(observerLocator: ObserverLocator) {
    this.selectedFilesObserver = observerLocator.getObserver(this, 'selectedFiles');
    this.acceptChanged();
  }

  attached() {
    this.selectedFilesObserver.subscribe(this.appendSelectedFiles);
  }

  acceptChanged() {
    this.acceptValidator = AcceptValidator.parse(this.accept);
  }

  detached() {
    this.selectedFilesObserver.unsubscribe(this.appendSelectedFiles);
  }

  private appendSelectedFiles = () => {
    if (this.selectedFiles) {
      for (let i = 0; i < this.selectedFiles.length; ++i) {
        const file = this.selectedFiles.item(i);
        const isValid = this.acceptValidator.isValid(file);
        if (isValid) {
          this.files.push(file);
        }
      }
      this.selectedFiles = null;
    }
  };

  removeFile(index) {
    this.files.splice(index, 1);
  }
}
