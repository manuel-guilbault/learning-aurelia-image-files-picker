define('app',["require", "exports"], function (require, exports) {
    "use strict";
    var App = (function () {
        function App() {
            this.files = [];
        }
        return App;
    }());
    exports.App = App;
});

define('environment',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = {
        debug: true,
        testing: true
    };
});

define('main',["require", "exports", "./environment"], function (require, exports, environment_1) {
    "use strict";
    Promise.config({
        longStackTraces: environment_1.default.debug,
        warnings: {
            wForgottenReturn: false
        }
    });
    function configure(aurelia) {
        aurelia.use
            .standardConfiguration()
            .feature('resources');
        if (environment_1.default.debug) {
            aurelia.use.developmentLogging();
        }
        if (environment_1.default.testing) {
            aurelia.use.plugin('aurelia-testing');
        }
        aurelia.start().then(function () { return aurelia.setRoot(); });
    }
    exports.configure = configure;
});

define('resources/accept-validator',["require", "exports"], function (require, exports) {
    "use strict";
    var matchAll = '.*';
    function escapeForPattern(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    function assemblePattern(parts) {
        if (parts.length === 0) {
            return null;
        }
        var pattern = parts.join('|') || matchAll;
        return new RegExp("^(" + pattern + ")$");
    }
    var AcceptValidator = (function () {
        function AcceptValidator(namePattern, typePattern) {
            if (namePattern === void 0) { namePattern = null; }
            if (typePattern === void 0) { typePattern = null; }
            this.namePattern = namePattern;
            this.typePattern = typePattern;
        }
        AcceptValidator.parse = function (accept) {
            var parts = (accept || '')
                .split(',')
                .map(function (p) { return p.trim(); });
            var nameParts = parts
                .filter(function (p) { return p.startsWith('.'); })
                .map(function (p) { return matchAll + escapeForPattern(p); });
            var typeParts = parts
                .filter(function (p) { return !p.startsWith('.'); })
                .map(function (part) {
                var _a = part.split('/', 2), type = _a[0], subType = _a[1];
                return subType === '*'
                    ? escapeForPattern(type + "/") + matchAll
                    : escapeForPattern(part);
            });
            var namePattern = assemblePattern(nameParts);
            var typePattern = assemblePattern(typeParts);
            return new AcceptValidator(namePattern, typePattern);
        };
        AcceptValidator.prototype.isValid = function (file) {
            if (this.namePattern === null && this.typePattern === null) {
                return true;
            }
            return (this.namePattern && this.namePattern.test(file.name))
                || (this.typePattern && this.typePattern.test(file.type));
        };
        return AcceptValidator;
    }());
    exports.AcceptValidator = AcceptValidator;
});

define('resources/index',["require", "exports"], function (require, exports) {
    "use strict";
    function configure(config) {
        config.globalResources([
            './attributes/blob-src',
            './attributes/file-drop-target',
            './elements/file-picker',
            './elements/image-files-picker',
            './value-converters/chunk',
        ]);
    }
    exports.configure = configure;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('resources/attributes/blob-src',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var BlobSrc = (function () {
        function BlobSrc(element) {
            this.element = element;
        }
        BlobSrc.prototype.disposeObjectUrl = function () {
            if (this.objectUrl) {
                this.element.src = '';
                URL.revokeObjectURL(this.objectUrl);
                this.objectUrl = null;
            }
        };
        BlobSrc.prototype.valueChanged = function (value) {
            this.disposeObjectUrl();
            if (value instanceof Blob) {
                this.objectUrl = URL.createObjectURL(value);
                this.element.src = this.objectUrl;
            }
        };
        BlobSrc.prototype.unbind = function () {
            this.disposeObjectUrl();
        };
        return BlobSrc;
    }());
    BlobSrc = __decorate([
        aurelia_framework_1.customAttribute('blob-src'),
        aurelia_framework_1.inject(Element),
        __metadata("design:paramtypes", [HTMLImageElement])
    ], BlobSrc);
    exports.BlobSrc = BlobSrc;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('resources/attributes/file-drop-target',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var FileDropTarget = (function () {
        function FileDropTarget(element) {
            var _this = this;
            this.element = element;
            this.onDragOver = function (e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            };
            this.onDrop = function (e) {
                e.stopPropagation();
                e.preventDefault();
                if (typeof _this.value === 'function') {
                    _this.value({ files: e.dataTransfer.files });
                }
                else {
                    _this.value = e.dataTransfer.files;
                }
            };
            this.onDragEnd = function (e) {
                e.stopPropagation();
                e.preventDefault();
                e.dataTransfer.clearData();
            };
        }
        FileDropTarget.prototype.attached = function () {
            this.element.addEventListener('dragover', this.onDragOver);
            this.element.addEventListener('drop', this.onDrop);
            this.element.addEventListener('dragend', this.onDragEnd);
        };
        FileDropTarget.prototype.detached = function () {
            this.element.removeEventListener('dragend', this.onDragEnd);
            this.element.removeEventListener('drop', this.onDrop);
            this.element.removeEventListener('dragover', this.onDragOver);
        };
        return FileDropTarget;
    }());
    FileDropTarget = __decorate([
        aurelia_framework_1.customAttribute('file-drop-target', aurelia_framework_1.bindingMode.twoWay),
        aurelia_framework_1.autoinject,
        __metadata("design:paramtypes", [Element])
    ], FileDropTarget);
    exports.FileDropTarget = FileDropTarget;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('resources/elements/file-picker',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var FilePicker = (function () {
        function FilePicker() {
            this.accept = '';
            this.multiple = false;
        }
        FilePicker.prototype.filesChanged = function () {
            if (!this.files) {
                this.clearSelection();
            }
        };
        FilePicker.prototype.clearSelection = function () {
            this.input.type = '';
            this.input.type = 'file';
        };
        return FilePicker;
    }());
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], FilePicker.prototype, "accept", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], FilePicker.prototype, "multiple", void 0);
    __decorate([
        aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
        __metadata("design:type", FileList)
    ], FilePicker.prototype, "files", void 0);
    FilePicker = __decorate([
        aurelia_framework_1.customElement('file-picker'),
        aurelia_framework_1.useView('./file-picker.html')
    ], FilePicker);
    exports.FilePicker = FilePicker;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
define('resources/elements/image-files-picker',["require", "exports", "aurelia-framework", "../accept-validator"], function (require, exports, aurelia_framework_1, accept_validator_1) {
    "use strict";
    var ImageFilesPicker = (function () {
        function ImageFilesPicker() {
            this.files = [];
            this.accept = 'image/*';
            this.acceptValidator = accept_validator_1.AcceptValidator.parse(this.accept);
        }
        ImageFilesPicker.prototype.acceptChanged = function () {
            this.acceptValidator = accept_validator_1.AcceptValidator.parse(this.accept);
        };
        ImageFilesPicker.prototype.add = function (files) {
            for (var i = 0; i < files.length; ++i) {
                var file = files.item(i);
                var isValid = this.acceptValidator.isValid(file);
                if (isValid) {
                    this.files.push(file);
                }
            }
        };
        ImageFilesPicker.prototype.remove = function (index) {
            this.files.splice(index, 1);
        };
        ImageFilesPicker.prototype.addSelectedFiles = function () {
            this.add(this.selectedFiles);
            this.selectedFiles = null;
        };
        return ImageFilesPicker;
    }());
    __decorate([
        aurelia_framework_1.bindable({ defaultBindingMode: aurelia_framework_1.bindingMode.twoWay }),
        __metadata("design:type", Array)
    ], ImageFilesPicker.prototype, "files", void 0);
    __decorate([
        aurelia_framework_1.bindable,
        __metadata("design:type", Object)
    ], ImageFilesPicker.prototype, "accept", void 0);
    ImageFilesPicker = __decorate([
        aurelia_framework_1.customElement('image-files-picker'),
        aurelia_framework_1.useView('./image-files-picker.html')
    ], ImageFilesPicker);
    exports.ImageFilesPicker = ImageFilesPicker;
});

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define('resources/value-converters/chunk',["require", "exports", "aurelia-framework"], function (require, exports, aurelia_framework_1) {
    "use strict";
    var Chunk = (function () {
        function Chunk() {
        }
        Chunk.prototype.toView = function (array, size) {
            var result = [];
            var nbChunks = Math.ceil(array.length / size);
            for (var i = 0; i < nbChunks; ++i) {
                var offset = i * size;
                result.push(array.slice(offset, offset + size));
            }
            return result;
        };
        return Chunk;
    }());
    Chunk = __decorate([
        aurelia_framework_1.valueConverter('chunk')
    ], Chunk);
    exports.Chunk = Chunk;
});

define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n  <require from=\"bootstrap/css/bootstrap.min.css\"></require>\r\n  \r\n  <section class=\"container\">\r\n    <image-files-picker files.bind=\"files\"></image-files-picker>\r\n  </section>\r\n</template>\r\n"; });
define('text!resources/elements/file-picker.html', ['module'], function(module) { module.exports = "<template>\r\n  <input type=\"file\" accept.bind=\"accept\" multiple.bind=\"multiple\" \r\n         files.bind=\"files\" ref=\"input\"\r\n         style=\"visibility: hidden; width: 0; height: 0;\">\r\n  <button class=\"btn btn-primary\" click.delegate=\"input.click()\">\r\n    <slot>Select</slot>\r\n  </button>\r\n</template>\r\n"; });
define('text!resources/elements/image-files-picker.html', ['module'], function(module) { module.exports = "<template>\n  <div file-drop-target.call=\"add(files)\" \n       class=\"jumbotron jumbotron-fluid\">\n    <div class=\"container\">\n      <div class=\"text-center\">\n        <p>You can drop image files anywhere inside this area</p>\n      </div>\n      <div class=\"row\" repeat.for=\"row of files | chunk:3\">\n        <div class=\"col-md-4\" repeat.for=\"file of row\">\n          <div class=\"card card-inverse\">\n            <img class=\"card-img img-fluid\"\n                alt=\"Preview for ${file.name & oneTime}\"\n                blob-src.one-time=\"file\">\n            <div class=\"card-img-overlay\">\n              <button type=\"button\" class=\"close\" \n                      aria-label=\"Remove\" \n                      click.delegate=\"remove($parent.$index * 3 + $index)\">\n                <span aria-hidden=\"true\">&times;</span>\n              </button>\n              <p class=\"card-text\">\n                <small class=\"text-muted\">${file.name & oneTime}</small>\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n  <file-picker accept.bind=\"accept\" multiple.one-time=\"true\" \n               files.bind=\"selectedFiles\" \n               change.delegate=\"addSelectedFiles()\">\n    Add\n  </file-picker>\n</template>\n"; });
//# sourceMappingURL=app-bundle.js.map