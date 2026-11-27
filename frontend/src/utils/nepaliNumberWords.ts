/**
 * Nepali Number to Words Converter for Government Agreements and Financial Documents
 * Converts amounts (e.g. 3500000) to Nepali words (e.g. "पैंतीस लाख रुपैयाँ मात्र")
 */

const ONES: { [key: number]: string } = {
  0: 'शून्य',
  1: 'एक',
  2: 'दुई',
  3: 'तीन',
  4: 'चार',
  5: 'पाँच',
  6: 'छ',
  7: 'सात',
  8: 'आठ',
  9: 'नौ',
  10: 'दश',
  11: 'एघार',
  12: 'बाह्र',
  13: 'तेह्र',
  14: 'चौध',
  15: 'पन्ध्र',
  16: 'सोह्र',
  17: 'सत्र',
  18: 'अठार',
  19: 'उन्नाइस',
  20: 'बीस',
  21: 'एक्काइस',
  22: 'बाइस',
  23: 'तेइस',
  24: 'चौविस',
  25: 'पच्चिस',
  26: 'छब्बीस',
  27: 'सत्ताइस',
  28: 'अठ्ठाइस',
  29: 'उनन्तिस',
  30: 'तीस',
  31: 'एकत्तिस',
  32: 'बत्तिस',
  33: 'तेत्तिस',
  34: 'चौँतिस',
  35: 'पैंतीस',
  36: 'छत्तिस',
  37: 'सरसत्तिस',
  38: 'अठतीस',
  39: 'उनन्चालीस',
  40: 'चालीस',
  41: 'एकचालीस',
  42: 'बयालीस',
  43: 'त्रियालीस',
  44: 'चवालीस',
  45: 'पैँतालीस',
  46: 'छयालीस',
  47: 'सच्चालीस',
  48: 'अठचालीस',
  49: 'उनन्पचास',
  50: 'पचास',
  51: 'एकाउन्न',
  52: 'बाउन्न',
  53: 'त्रिपन्न',
  54: 'चवन्न',
  55: 'पचपन्न',
  56: 'छपन्न',
  57: 'सन्ताउन्न',
  58: 'अन्ठाउन्न',
  59: 'उनन्साठी',
  60: 'साठी',
  61: 'एकसट्ठी',
  62: 'बाइसट्ठी',
  63: 'त्रिसट्ठी',
  64: 'चौंसट्ठी',
  65: 'पैंसट्ठी',
  66: 'छयसट्ठी',
  67: 'सडसट्ठी',
  68: 'अडसट्ठी',
  69: 'उनन्सत्तरी',
  70: 'सत्तरी',
  71: 'एकहत्तर',
  72: 'बहत्तर',
  73: 'त्रिहत्तर',
  74: 'चौहत्तर',
  75: 'पचहत्तर',
  76: 'छयहत्तर',
  77: 'सतहत्तर',
  78: 'अठहत्तर',
  79: 'उनासी',
  80: 'असी',
  81: 'एकासी',
  82: 'बयासी',
  83: 'त्रियासी',
  84: 'चौरासी',
  85: 'पचासी',
  86: 'छयासी',
  87: 'सतासी',
  88: 'अठासी',
  89: 'उनान्नब्बे',
  90: 'नब्बे',
  91: 'एकान्नब्बे',
  92: 'बयानब्बे',
  93: 'त्रियान्नब्बे',
  94: 'चौरान्नब्बे',
  95: 'पन्चान्नब्बे',
  96: 'छयान्नब्बे',
  97: 'सन्तान्नब्बे',
  98: 'अन्ठान्नब्बे',
  99: 'उनान्सय',
};

function convertTwoDigits(n: number): string {
  if (n <= 0) return '';
  return ONES[n] || '';
}

function convertThreeDigits(n: number): string {
  if (n <= 0) return '';
  const hundred = Math.floor(n / 100);
  const rem = n % 100;
  let res = '';
  if (hundred > 0) {
    res += `${ONES[hundred]} सय`;
  }
  if (rem > 0) {
    res += (res ? ' ' : '') + convertTwoDigits(rem);
  }
  return res;
}

/**
 * Converts a number to Nepali words using the Vedic numbering system
 * @param amount - number or numeric string (e.g. 3500000 or "3500000.50")
 * @param addCurrencySuffix - whether to append "रुपैयाँ मात्र" (default: true)
 */
export function nepaliNumberToWords(amount: number | string, addCurrencySuffix = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num) || num === 0) {
    return addCurrencySuffix ? 'शून्य रुपैयाँ मात्र' : 'शून्य';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const intPart = Math.floor(absNum);
  const paisaPart = Math.round((absNum - intPart) * 100);

  if (intPart === 0 && paisaPart === 0) {
    return addCurrencySuffix ? 'शून्य रुपैयाँ मात्र' : 'शून्य';
  }

  // Nepali denominations: Kharab (10^11), Arab (10^9), Crore (10^7), Lakh (10^5), Thousand (10^3), Hundred (10^2)
  let n = intPart;
  const parts: string[] = [];

  const kharab = Math.floor(n / 100000000000);
  n %= 100000000000;

  const arab = Math.floor(n / 1000000000);
  n %= 1000000000;

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const remainder = n; // 0 to 999

  if (kharab > 0) parts.push(`${convertTwoDigits(kharab)} खर्ब`);
  if (arab > 0) parts.push(`${convertTwoDigits(arab)} अर्ब`);
  if (crore > 0) parts.push(`${convertTwoDigits(crore)} करोड`);
  if (lakh > 0) parts.push(`${convertTwoDigits(lakh)} लाख`);
  if (thousand > 0) parts.push(`${convertTwoDigits(thousand)} हजार`);
  if (remainder > 0) parts.push(convertThreeDigits(remainder));

  let words = (isNegative ? 'ऋणात्मक ' : '') + parts.join(' ').trim();

  if (paisaPart > 0) {
    words += (words ? ' र ' : '') + `${convertTwoDigits(paisaPart)} पैसा`;
  }

  if (addCurrencySuffix) {
    words += ' रुपैयाँ मात्र';
  }

  return words;
}
