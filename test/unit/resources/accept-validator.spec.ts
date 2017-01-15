import {AcceptValidator} from '../../../src/resources/accept-validator';

function createFile(name: string, type: string): File {
  return new File(['some binary content'], name, { type });
}

describe('the AcceptValidator class', () => {

  it('validates a single file extension', () => {
    const sut = AcceptValidator.parse('.jpg');

    const result = sut.isValid(createFile('test.jpg', 'image/jpg'));
    expect(result).toBe(true);
  });

  it('validates a single MIME subtype', () => {
    const sut = AcceptValidator.parse('image/jpg');

    const result = sut.isValid(createFile('test.jpg', 'image/jpg'));
    expect(result).toBe(true);
  });

  [
    createFile('test.jpg', 'image/jpg'),
    createFile('test.png', 'image/png'),
    createFile('test.gif', 'image/gif'),
  ].map(file => it(`validates a single MIME type (${file.type})`, () => {
    const sut = AcceptValidator.parse('image/*');

    const result = sut.isValid(file);
    expect(result).toBe(true);
  }));

  
});
