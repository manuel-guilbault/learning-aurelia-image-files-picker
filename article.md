# Creating an image files picker

In my book [Learning Aurelia](https://www.packtpub.com/web-development/learning-aurelia),
you can see, among other things, how to build an image file picker component, supporting 
drag and drop and showing a preview of the selected image.

In this post, we'll use the techniques described in the book to build a multi-select
image file picker, also supporting drag and drop, with a gallery-style preview feature.

## Picking files

Let's start by creating a custom `file-picker` element, which will encapsulate 
an `<input type="file">` element:

`resources/elements/file-picker.ts`:

```ts
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
```

This view-model declares three bindable properties:
* `accept`: will be bound to the `input`'s `accept` attribute, which is used
  to limit the type of files the browser's dialog will show to the user.
* `multiple`: will be bound to the `input`'s `multiple` attribute, which
  tells the browser's dialog if it should support selection of multiple files 
  or not.
* `files`: will be bound to the `input`'s `files` attribute. This property is
  bound two way by default, so the file(s) selected by the user are assigned
  back to the bound property.

The view-model also declares an `input` property, to which the template will
assign a reference on the `<input type="file">` element.

Lastly, since the `input`'s `files` property is read-only and the DOM API
doesn't expose a method to clear the `input`'s file selection (other than
calling the `reset` method on the whole surrounding `form`), the view-model 
uses a hack to clear the selected files when an empty value is assigned
to the `file-picker`'s `files` property: it sets the `input`'s `type` to
an empty string then resets it back to `file`.

`resources/elements/file-picker.html`:

```html
<template>
  <input type="file" accept.bind="accept" multiple.bind="multiple" 
         files.bind="files" ref="input"
         style="visibility: hidden; width: 0; height: 0;">
  <button class="btn btn-primary" click.delegate="input.click()">
    <slot>Select</slot>
  </button>
</template>
```

The `file-picker`'s template defines an `<input type="file">` element,
styled so it is invisible and so it occupies no space in the DOM.
Its `accept`, `multiple`, and `files` attributes are also properly
bound to their corresponding property on the view-model. Lastly, it 
assigns a reference on the `input` to the view-model's `input`
property.

The template also declares a `button` element, styled using Bootstrap's 
classes. Inside it, a default content projection slot, with the 
*Select* text as its default content. Additionally, the `button`'s
`click` event calls the `input`'s `click` method. Thanks to this, 
the browser's file dialog will show up when the user clicks the 
button, even though the `input` element is not visible.

This component basically just replaces the ugly native file picker
with a sexier button.

## Adding a file drop target

Next, let's create a custom attribute allowing to transform any
element into a file drag and drop target:

`resources/attributes/file-drop-target.ts`:

```ts
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
```

The attribute's target element will be injected in the view-model's
constructor. When the attribute is `attached` to the DOM, it starts 
listening for the `dragover`, `drop`, and `dragend` events on the 
target element. When the attribute is `detached` from the DOM, the 
event listeners are removed.

The attribute is bound two way by default, so the file(s) assigned 
to its `value` when a user drops them on the target element are 
assigned back to the bounded property, if any. However, upon files
being dropped on the target element, the view-model checks if the 
`value` is a function or not. This means that the attribute can be 
used either with the `.bind` command, so the dropped files are 
assigned to the bound expression, or with the `.call` command, so 
the bound expression is called and passed the dropped files whenever 
a `drop` event occurs.

## Chunking an array

In order to display the selected images as a gallery, we'll use 
Bootstrap's grid system. This means we'll need to break the files
array down in chunks, so we can iterate on chunks to render rows, 
then on each chunk's files to render columns.

The best way to do this in Aurelia is with a value converter:

`resources/value-converters/chunk.ts`:

```ts
import {valueConverter} from 'aurelia-framework';

@valueConverter('chunk')
export class Chunk {
  toView(array: any[], size: number): any[][] {
    let result = [];
    let nbChunks = Math.ceil(array.length / size);
    for (let i = 0; i < nbChunks; ++i) {
      const offset = i * size;
      result.push(array.slice(offset, offset + size));
    }
    return result;
  }
}
```

The `chunk` value converter expects an array and the chunks' size 
as its parameter and returns an array of array.

## Displaying a Blob object as an image

The last part we'll need is some way to display a `File` instance
inside an `img` element. To do this, we'll leverage the browser's 
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

`resources/attributes/blob-src.ts`:

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

> Each of the parts we saw up to this point is shown in the book,
> even though some have been modified to fit the current context.

The last missing piece is the one that brings everything together:
an `image-files-picker` custom element.

`resources/elements/image-files-picker.html`:

```html
<template>
  <div class="jumbotron jumbotron-fluid" file-drop-target.call="add(files)">
    <div class="container">
      <div class="text-center">
        <p>You can drop image files anywhere inside this area</p>
      </div>
      <div class="row" repeat.for="row of files | chunk:3">
        <div class="col-md-4" repeat.for="file of row">
          <div class="card card-inverse">
            <img class="card-img img-fluid"
                alt="Preview for ${file.name & oneTime}"
                blob-src.one-time="file">
            <div class="card-img-overlay">
              <button type="button" class="close" aria-label="Remove" 
                      click.delegate="remove($index)">
                <span aria-hidden="true">&times;</span>
              </button>
              <p class="card-text">
                <small class="text-muted">${file.name & oneTime}</small>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <file-picker accept.bind="accept" multiple.one-time="true" 
               files.bind="selectedFiles" 
               change.delegate="addSelectedFiles()">
    Add
  </file-picker>
</template>
```

The template starts with a `jumbotron` container, which acts as a
`file-drop-target`. When files are dragged and dropped on this element,
the view-model's `add` method will be called and passed the dropped
`files`.

Inside this container, the `files` array is rendered on three columns
using the `chunk` value converter, each file displayed inside a Bootstrap
`card` component. Each `card` displays the file in an `img` element 
using the `blob-src` attribute, a `button` whose `click` event calls the 
view-model's `remove` method, and the file's `name`.

Lastly, underneath the image gallery, a `file-picker` element allows
the user to select image files. The selected files are bound to the
view-model's `selectedFiles` property, then the `change` event 
dispatched by the underlying `<input type="file">` element and bubbling
up the DOM triggers a call to the `addSelectedFiles` method. The 
`file-picker`'s default projection slot is also overwritten with the text 
*Add*.

`resources/elements/image-files-picker.ts`:

```ts
import {customElement, useView, bindable, bindingMode} from 'aurelia-framework';

@customElement('image-files-picker')
@useView('./image-files-picker.html')
export class ImageFilesPicker {

  @bindable({ defaultBindingMode: bindingMode.twoWay }) files: File[] = [];

  selectedFiles: FileList;

  add(files: FileList) {
    for (let i = 0; i < files.length; ++i) {
      const file = files.item(i);
      this.files.push(file);
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
```

The view-model declares a `files` bindable property, which is bound
two way by default. This property is expected to initially contain 
an empty array.

When files are dropped on the drop target element, the `add` method
is called and the dropped `files` are appended to the `files` property.
When the user selects files using the `file-picker`, the selected files
are assigned back to the `selectedFiles` property, then the `change`
event handler calls the `addSelectedFiles`, which appends the
`selectedFiles` to the `files` property, and finally assigns `null` to 
the `selectedFiles`.

This last step makes sure that the underlying `<input type="file">` 
element has its selection cleared. Without it, if a user tries to add 
the same file twice in a row, the `change` event would not be triggered 
the second time, because the `input`'s value would not change, so the 
second file selection would fail from the user's perspective.

## Using the image files picker

Using the `image-files-picker` element is then pretty simple. We first
need to declare a property hosting the array of files on the `App` 
view-model:

`app.ts`:

```ts
export class App {
  files: File[] = [];
}
```

Next, we simply need to add the custom element in the template of
our `App` component:

`app.html`:

```html
<template>
  <require from="bootstrap/css/bootstrap.min.css"></require>
  
  <section class="container">
    <image-files-picker files.bind="files"></image-files-picker>
  </section>
</template>
```

Of course, the various parts need to be loaded, either using
the `require` statement in the `app.html` template, or in the
`resources/index.ts` feature's `configure` function.

## Filtering out non-image files

At this point, a user can select or drop any type of files using our
component. Some logic allowing only image files should be somehow added.

A basic filtering logic, using the same syntax as the `<input type="file">`
element's `accept` attribute, is implemented in the complete code sample,
which you can find 
[here](https://github.com/manuel-guilbault/learning-aurelia-image-files-picker).
A more complete solution, showing error messages to the user, can easily be
implemented. I'll leave this as an exercise to the reader.

## Exploiting the selected images

Typically, such a component would be used to first select a bunch of image files,
then to upload those files to some remote endpoint. This is pretty easy to do with 
Aurelia's Fetch client and the `FormData` class from the Fetch API.

Here's an example of a client service used to upload an array of `File` instances
to some remote endpoint:

```ts
import {autoinject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-fetch-client';

@autoinject
export class SomeAPI {
  constructor(private http: HttpClient) {}

  uploadFiles(files: File[]): Promise<void> {
    const body = new FormData();
    for (let i = 0; i < files.length; ++i) {
      body.append(`files[${i}]`, files[i]);
    }
    return this.http.fetch('some/url', { method: 'POST', body });
  }
}
```

> The Mozilla Developer Network has 
  [some great doc](https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects)
  about the `FormData` class.

## Summary

Once again, Aurelia makes things easy. Its various constructs, such as custom attributes,
elements, and value converters, help us decompose a problem and solve each of its parts
with a generic, reusable solution, and then recombine them together to address our initial,
specific problem. **Shameless plug alert**: this aspect is one of the many topics addressed 
in [Learning Aurelia](https://www.packtpub.com/web-development/learning-aurelia). You should
definitely give it a look!
