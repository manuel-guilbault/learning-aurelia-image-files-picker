import {valueConverter} from 'aurelia-framework';

@valueConverter('chunk')
export class Chunk {
  toView(array: any[], size: number): any[][] {
    if (size <= 0) {
      throw new RangeError('Chunk size must be greater than zero');
    }
    
    let result = [];
    let nbChunks = Math.ceil(array.length / size);
    for (let i = 0; i < nbChunks; ++i) {
      result.push(array.slice(i * size, i * size + size));
    }
    return result;
  }
}
