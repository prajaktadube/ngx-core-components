import { TestBed } from '@angular/core/testing';
import { DEFAULT_EN_I18N, NGX_CORE_I18N, provideNgxI18n } from './ngx-core-i18n';

describe('provideNgxI18n', () => {
  it('merges partial nested translations while preserving default labels', () => {
    TestBed.configureTestingModule({
      providers: [
        provideNgxI18n({
          grid: { noData: 'Aucune ligne' },
          chart: { lineChartDescription: (names, count) => `Courbes ${names} sur ${count} catégories.` },
        }),
      ],
    });

    const translations = TestBed.inject(NGX_CORE_I18N);
    expect(translations.grid.noData).toBe('Aucune ligne');
    expect(translations.grid.exportCsv).toBe(DEFAULT_EN_I18N.grid.exportCsv);
    expect(translations.dialog.close).toBe(DEFAULT_EN_I18N.dialog.close);
    expect(translations.chart.lineChartDescription('Ventes', 2)).toBe('Courbes Ventes sur 2 catégories.');
    expect(translations.chart.pieSliceDescription).toBe(DEFAULT_EN_I18N.chart.pieSliceDescription);
    expect(translations.grid.addCondition).toBe(DEFAULT_EN_I18N.grid.addCondition);
    expect(translations.chart.waterfallMarkDescription).toBe(DEFAULT_EN_I18N.chart.waterfallMarkDescription);
  });

  it('allows replacing complete locale arrays', () => {
    TestBed.configureTestingModule({
      providers: [provideNgxI18n({ datePicker: { months: ['Janvier'] } })],
    });

    const translations = TestBed.inject(NGX_CORE_I18N);
    expect(translations.datePicker.months).toEqual(['Janvier']);
    expect(translations.datePicker.weekdays).toEqual(DEFAULT_EN_I18N.datePicker.weekdays);
  });
});
