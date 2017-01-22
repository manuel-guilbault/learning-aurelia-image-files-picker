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
