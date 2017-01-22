const matchAll = '.*';

function escapeForPattern(s: string) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function assemblePattern(parts: string[]) {
  if (parts.length === 0) {
    return null;
  }

  const pattern = parts.join('|') || matchAll;
  return new RegExp(`^(${pattern})$`);
}

export class AcceptValidator {

  static parse(accept: string) {
    const parts = (accept || '')
      .split(',')
      .map(p => p.trim());
    const nameParts = parts
      .filter(p => p.startsWith('.'))
      .map(p => matchAll + escapeForPattern(p));
    const typeParts = parts
      .filter(p => !p.startsWith('.'))
      .map(part => {
        const [type, subType] = part.split('/', 2);
        return subType === '*'
          ? escapeForPattern(`${type}/`) + matchAll
          : escapeForPattern(part);
      });

    const namePattern = assemblePattern(nameParts);
    const typePattern = assemblePattern(typeParts);
    return new AcceptValidator(namePattern, typePattern);
  }

  constructor(private namePattern: RegExp = null, private typePattern: RegExp = null) {}

  isValid(file: File) {
    if (this.namePattern === null && this.typePattern === null) {
      return true;
    }

    return (this.namePattern && this.namePattern.test(file.name))
      || (this.typePattern && this.typePattern.test(file.type));
  }
}
