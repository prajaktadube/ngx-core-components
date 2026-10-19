import { BitArray, Code128Reader } from '@zxing/library';
import { encodeCode128B } from './barcode-encoding';

describe('encodeCode128B', () => {
  it('uses the Code 128-B start, character, checksum, and stop symbols', () => {
    const encoded = encodeCode128B('A')
      .map(module => (module ? '1' : '0'))
      .join('');

    expect(encoded).toBe('11010010000' + '10100011000' + '10001011000' + '1100011101011');
  });

  it('decodes independently with ZXing to the original Code 128-B value', () => {
    const value = 'Code128 test 123';
    const modules = encodeCode128B(value);
    const moduleScale = 3;
    const quietZone = 20 * moduleScale;
    const row = new BitArray(modules.length * moduleScale + quietZone * 2);

    modules.forEach((isBar, moduleIndex) => {
      if (!isBar) return;
      for (let pixel = 0; pixel < moduleScale; pixel++) {
        row.set(quietZone + moduleIndex * moduleScale + pixel);
      }
    });

    expect(new Code128Reader().decodeRow(0, row).getText()).toBe(value);
  });

  it('rejects empty and unsupported input instead of drawing a misleading barcode', () => {
    expect(() => encodeCode128B('')).toThrowError('Code 128-B values must not be empty.');
    expect(() => encodeCode128B('café')).toThrowError(
      'Code 128-B supports printable ASCII characters from space through tilde.'
    );
  });
});
