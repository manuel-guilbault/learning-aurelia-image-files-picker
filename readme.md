In my book [Learning Aurelia](https://www.packtpub.com/web-development/learning-aurelia),
you can see how to build an image file picker component, supporting drag and drop and 
showing a preview of the selected image.

In this post, we'll use the techniques described in the book to build a multi-select
image file picker, still supporting drag and drop, with a gallery-style preview feature.

## Picking files

Let's first start by creating a custom `file-picker` element, which will encapsulate 
an `<input type="file">` element:

`resources/elements/file-picker.ts`:
```ts
import {customElement, useView, bindable, bindingMode} from 'aurelia-framework';

@customElement('file-picker')
@useView('./file-picker.html')
export class FilePicker {

  @bindable accept = '';
  @bindable multiple = false;
  @bindable({ defaultBindingMode: bindingMode.twoWay }) files;
}
```

This view-model declares three properties:
* `accept`: will be bound to the `input`'s `accept` attribute, which is used
  to limit the type of files the browser's dialog will show to the user.
* `multiple`: will be bound to the `input`'s `multiple` attribute, which
  tells the browser's dialog if it should support multiple file selection or
  not.
* `files`: will be bound to the `input`'s `files` attribute. This property is
  bound two way by default, so the file(s) selected by the user are assigned
  back to the bound property.

`resources/elements/file-picker.html`:
```html
<template>
  <input style="visibility: hidden; width: 0; height: 0;"
         type="file" accept.bind="accept" multiple.bind="multiple" 
         files.bind="files" ref="input">
  <button class="btn btn-primary" click.delegate="input.click()">
    <slot>Select</slot>
  </button>
</template>
```

The `file-picker`'s template defines an `<input type="file">` element,
styled so it is invisible and occupies no space in the rendered DOM.
It's `accept`, `multiple`, and `files` attributes are also properly
bound to their matching property on the view-model. Lastly, it 
assigns a reference of the `input` on the binding context as a new 
property named `input`.

The template also declares a `button`, styled using Bootstrap's 
classes. Inside it, a default content projection slot, with the 
'Select' text as its default content. Additionally, the `button`'s
`click` event calls the `input`'s `click` method. Thanks to this, 
the browser's file dialog will show up when the user clicks the 
button.

This component basically just replaces the ugly native file picker
with a sexier button.

## Adding a file drop target

Next, let's create a custom attribute allowing to transform any
element into a file drop target:

`resources/attributes/file-drop-target.ts`:
```ts
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
```

This custom element is bound two way by default, so the file(s) 
assigned to its `value` when a user drops them on the target element
are assigned back to the bounded property, if any.

Additionally, the view-model expects its target element to be injected
in its constructor. When the attribute is `attached` to the DOM, it 
starts listening for the `dragover`, `drop`, and `dragend` events on
the target element, and assigns any dropped files to its `value`. Of
course, when the attribute is `detached` from the DOM, the event
listeners are removed.

## Chunking an array

In order to display the selected images as a gallery, we'll use 
Bootstrap's grid system. This means we'll need to break the image
array down in chunks of the same size, so we can iterate on chunks
to render rows, then on a chunk's images to render columns.

The best way to do this in Aurelia is a value converter:
`resources/value-converters/chunk.ts`:
```ts
import {valueConverter} from 'aurelia-framework';

@valueConverter('chunk')
export class Chunk {
  toView(array: any[], size: number): any[][] {
    let result = [];
    let nbChunks = Math.ceil(array.length / size);
    for (let i = 0; i < nbChunks; ++i) {
      result.push(array.slice(i * size, i * size + size));
    }
    return result;
  }
}
```

The `chunk` value converter expects an array and the chunks' size 
as its parameter and returns an array of array.

## Displaying a Blob object as an image

The last part we'll need is some way to display a `File` instance
in an `img` element. To do this, we'll leverage the browser's 
`URL.createObjectURL` function, which takes a `Blob` object as a 
parameter and returns a special URL leading to this resource. Our 
custom attribute, which will be used essentially on `img` elements, 
will be bound to a `Blob` object, will generate an object URL from it, 
and will assign this URL to the `img` element's `src` attribute.

Some of you might think that a value converter would be a better fit for
this type of feature, and I would absolutely agree. A value converter 
could take as an input a `Blob` object and return the object URL. It 
could then be used on a binding between an `img` element's `src` 
attribute and a property containing a `Blob` object.

However, in this particular case, each object URL must be released after 
usage in order to prevent memory leaks, and value converters offer no 
mechanism to be notified when a value is no longer used. On the contrary, 
HTML behaviors offer a much richer workflow and a wider set of extension 
points. That's why we will create a custom attribute instead:

```ts
import {customAttribute, inject} from 'aurelia-framework';

@customAttribute('blob-src')
@inject(Element)
export class BlobSrc {

  private objectUrl: string;

  constructor(private element: HTMLImageElement) {}

  private disposeObjectUrl() {
    if (this.objectUrl) {
      this.element.src = '';
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  valueChanged(value) {
    this.disposeObjectUrl();

    if (value instanceof Blob) {
      this.objectUrl = URL.createObjectURL(value);
      this.element.src = this.objectUrl;
    }
  }

  unbind() {
    this.disposeObjectUrl();
  }
}
```

## Bringing it all together

