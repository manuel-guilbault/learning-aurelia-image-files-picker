import {customAttribute, inject} from 'aurelia-framework';

@customAttribute('blob-src')
@inject(Element)
export class BlobSrc {

  private objectUrl: string;

  constructor(private element: HTMLImageElement) {}

  disposeObjectUrl() {
    if (this.objectUrl && URL) {
      this.element.src = '';
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  valueChanged(value) {
    this.disposeObjectUrl();

    if (Blob && URL && value instanceof Blob) {
      this.objectUrl = URL.createObjectURL(value);
      this.element.src = this.objectUrl;
    }
  }

  unbind() {
    this.disposeObjectUrl();
  }
}
