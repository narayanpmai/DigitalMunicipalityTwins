// Bikram Sambat (BS) Astronomical Calendar Matrix & Conversion Engine
export const BS_MONTH_DAYS: Record<number, number[]> = {
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2084: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2087: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2088: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2089: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2090: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
};

export const BS_MONTH_NAMES = [
  'बैशाख (01)',
  'जेठ (02)',
  'असार (03)',
  'साउन (04)',
  'भदौ (05)',
  'असोज (06)',
  'कात्तिक (07)',
  'मंसिर (08)',
  'पुस (09)',
  'माघ (10)',
  'फागुन (11)',
  'चैत (12)',
];

export const NEP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toNepaliDigits(val: number | string | null | undefined): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .split('')
    .map((c) => {
      const d = parseInt(c, 10);
      return !isNaN(d) ? NEP_DIGITS[d] : c;
    })
    .join('');
}

export function toEnglishDigits(str: string | null | undefined): string {
  if (!str) return '';
  let res = String(str);
  NEP_DIGITS.forEach((nd, i) => {
    res = res.replaceAll(nd, String(i));
  });
  return res;
}

export function bsToDaysDiff(y: number, m: number, d: number): number {
  let days = 0;
  if (y >= 2081) {
    for (let yr = 2081; yr < y; yr++) {
      days += (BS_MONTH_DAYS[yr] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]).reduce((a, b) => a + b, 0);
    }
  } else {
    for (let yr = 2081; yr > y; yr--) {
      days -= (BS_MONTH_DAYS[yr - 1] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]).reduce((a, b) => a + b, 0);
    }
  }
  const monthDays = BS_MONTH_DAYS[y] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
  for (let mo = 1; mo < m; mo++) {
    days += monthDays[mo - 1];
  }
  days += d - 1;
  return days;
}

export function bsToAd(bsYear: number, bsMonth: number, bsDay: number): string {
  if (!bsYear || !bsMonth || !bsDay) return '';
  const refAd = new Date('2024-04-13T00:00:00Z');
  const daysDiff = bsToDaysDiff(bsYear, bsMonth, bsDay);
  const targetAd = new Date(refAd.getTime() + daysDiff * 86400000);
  return targetAd.toISOString().split('T')[0];
}

export function adToBs(adDateStr: string): string {
  if (!adDateStr) return '';
  const refAd = new Date('2024-04-13T00:00:00Z');
  const targetAd = new Date(adDateStr + 'T00:00:00Z');
  if (isNaN(targetAd.getTime())) return '';

  let diffDays = Math.round((targetAd.getTime() - refAd.getTime()) / 86400000);
  let y = 2081,
    m = 1,
    d = 1;

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const yearDays = (BS_MONTH_DAYS[y] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]).reduce((a, b) => a + b, 0);
      if (diffDays >= yearDays && BS_MONTH_DAYS[y + 1]) {
        diffDays -= yearDays;
        y++;
      } else {
        const monthDays = BS_MONTH_DAYS[y] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
        const daysInMonth = monthDays[m - 1];
        if (diffDays >= daysInMonth) {
          diffDays -= daysInMonth;
          m++;
          if (m > 12) {
            m = 1;
            y++;
          }
        } else {
          d += diffDays;
          diffDays = 0;
        }
      }
    }
  } else {
    while (diffDays < 0) {
      const prevYear = y - 1;
      const prevYearDays = (BS_MONTH_DAYS[prevYear] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30]).reduce(
        (a, b) => a + b,
        0
      );
      if (Math.abs(diffDays) >= prevYearDays && BS_MONTH_DAYS[prevYear]) {
        diffDays += prevYearDays;
        y--;
      } else {
        m--;
        if (m < 1) {
          m = 12;
          y--;
        }
        const monthDays = BS_MONTH_DAYS[y] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30];
        const daysInMonth = monthDays[m - 1];
        diffDays += daysInMonth;
      }
    }
    d = 1 + diffDays;
  }
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

export interface CalculatedFiscalDates {
  startBs: string;
  startAd: string;
  endBs: string;
  endAd: string;
}

export function calculateFiscalYearDates(fyName: string): CalculatedFiscalDates | null {
  const engVal = toEnglishDigits(fyName.trim());
  const match = engVal.match(/(20\d{2})\D+(\d{2,3})/);
  if (!match) return null;

  const startYr = parseInt(match[1], 10);
  const endYr = startYr + 1;

  // Start date: 1 Shrawan (Month 4, Day 1)
  const startBs = `${toNepaliDigits(startYr)}-०४-०१`;
  const startAd = bsToAd(startYr, 4, 1);

  // End date: last day of Ashadh (Month 3, Day 31 or 32)
  const ashadhDays = (BS_MONTH_DAYS[endYr] || [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30])[2];
  const endBs = `${toNepaliDigits(endYr)}-०३-${toNepaliDigits(ashadhDays)}`;
  const endAd = bsToAd(endYr, 3, ashadhDays);

  return { startBs, startAd, endBs, endAd };
}
