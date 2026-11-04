import { TestBed } from '@angular/core/testing';
import { DEFAULT_EN_I18N, NGX_CORE_I18N, provideNgxI18n } from './ngx-core-i18n';

describe('provideNgxI18n', () => {
  it('merges partial nested translations while preserving default labels', () => {
    TestBed.configureTestingModule({
      providers: [
        provideNgxI18n({
          grid: { noData: 'Aucune ligne' },
          chart: {
            lineChartDescription: (names, count) => `Courbes ${names} sur ${count} catégories.`,
            variwidePointDescription: (label, height, width, share) => `${label}: ${height} h, ${width} w (${share})`,
            ohlcMarkDescription: (date, open, high, low, close) =>
              `${date}: ouverture ${open}, maximum ${high}, minimum ${low}, clôture ${close}`,
            hlcMarkDescription: (date, high, low, close) =>
              `${date}: maximum ${high}, minimum ${low}, clôture ${close}`,
            renkoMarkDescription: (index, type, open, close) =>
              `Brique ${index}: ${type === 'bullish' ? 'hausse' : 'baisse'}, de ${open} à ${close}`,
            pointFigureMarkDescription: (type, value, column) => `Point et figure ${type} colonne ${column}: ${value}`,
            kagiMarkDescription: (index, type, trend, start, end) =>
              `Segment Kagi ${index} ${type} ${trend}: ${start} à ${end}`,
            areaRangeMarkDescription: (series, category, boundary, value, low, high) =>
              `${series} à ${category}: limite ${boundary} ${value}, plage ${low} à ${high}`,
            histogramBinDescription: (low, high, count, percentage) =>
              `${low} à ${high}: ${count} observations, ${percentage}% des données`,
            calendarHeatmapCellDescription: (date, value) => `${date}: ${value} contributions`,
            adjacencyMatrixCellDescription: (source, target, value) => `${source} vers ${target}: poids ${value}`,
            orgChartNodeDescription: (name, title, department, hasChildren) =>
              [name, title, department, hasChildren ? 'a des rapports' : 'aucun rapport'].filter(Boolean).join('; '),
            orgChartToggleDescription: (name, expanded) => `${expanded ? 'Réduire' : 'Développer'} ${name}`,
            mapBubbleDescription: (label, value, latitude, longitude, group) =>
              `${label}; valeur ${value}; latitude ${latitude}, longitude ${longitude}; groupe ${group}`,
            mapPointDescription: (label, latitude, longitude) =>
              `${label}; latitude ${latitude}, longitude ${longitude}`,
            mapLineDescription: (label, source, target) => `${label}: de ${source} à ${target}`,
            choroplethRegionDescription: (region, value, label) => `${region}: ${value}${label ? `; ${label}` : ''}`,
            geoHeatmapCellDescription: (latitude, longitude, weight) => `Zone à ${latitude}, ${longitude}: ${weight}`,
            networkNodeDescription: (label, value, group, connections) =>
              `${label}; valeur ${value}; ${group}; liens ${connections}`,
            networkLinkDescription: (source, target, weight) => `Lien ${source} vers ${target}: ${weight}`,
            parallelCoordinatesLineDescription: (record, values) => `Enregistrement ${record}: ${values}`,
            multiNeedleDescription: (label, value, units, type) => `${label}: ${value}${units}; ${type}`,
            topologyNodeDescription: (label, type, status) => `${label}; ${type}; ${status}`,
            topologyLinkDescription: (source, target, active, label) =>
              `${source} vers ${target}${label ? `; ${label}` : ''}; ${active ? 'actif' : 'inactif'}`,
            pictorialIconDescription: (index, threshold, fillPercentage) =>
              `Icône ${index}: seuil ${threshold}, remplissage ${fillPercentage}%`,
            packedBubbleMarkDescription: (label, group, value) => `${label}; ${group}; valeur ${value}`,
            wordCloudMarkDescription: (word, value) => `${word}: poids ${value}`,
            windRoseBinDescription: (direction, bin, frequency, cumulative) =>
              `Direction ${direction}, vitesse ${bin}: ${frequency}, cumul ${cumulative}`,
            sankeyNodeDescription: (label, value, incoming, outgoing) =>
              `${label}: flux ${value}, entrant ${incoming}, sortant ${outgoing}`,
            sankeyLinkDescription: (source, target, value) => `Flux de ${source} vers ${target}: ${value}`,
            timelineEventDescription: (title, category, status, start, end) =>
              `${title} (${category}, ${status}) du ${start}${end ? ` au ${end}` : ''}`,
          },
          layout: { closeTab: 'Fermer l’onglet' },
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
    expect(translations.layout?.closeTab).toBe('Fermer l’onglet');
    expect(translations.chart.variwidePointDescription?.('Nord', '12', '3', '100%')).toBe('Nord: 12 h, 3 w (100%)');
    expect(translations.chart.ohlcMarkDescription?.('02/01', '10', '18', '8', '15')).toBe(
      '02/01: ouverture 10, maximum 18, minimum 8, clôture 15'
    );
    expect(translations.chart.hlcMarkDescription?.('02/01', '18', '8', '15')).toBe(
      '02/01: maximum 18, minimum 8, clôture 15'
    );
    expect(translations.chart.renkoMarkDescription?.(1, 'bullish', '100', '105')).toBe(
      'Brique 1: hausse, de 100 à 105'
    );
    expect(translations.chart.pointFigureMarkDescription?.('X', '100', 1)).toBe('Point et figure X colonne 1: 100');
    expect(translations.chart.kagiMarkDescription?.(1, 'vertical', 'bullish', '100', '120')).toBe(
      'Segment Kagi 1 vertical bullish: 100 à 120'
    );
    expect(translations.chart.areaRangeMarkDescription?.('Prix', 'Lun', 'high', '10', '5', '10')).toBe(
      'Prix à Lun: limite high 10, plage 5 à 10'
    );
    expect(translations.chart.histogramBinDescription?.('1', '5', '2', '66.7')).toBe(
      '1 à 5: 2 observations, 66.7% des données'
    );
    expect(translations.chart.calendarHeatmapCellDescription?.('2026-01-02', '3')).toBe('2026-01-02: 3 contributions');
    expect(translations.chart.adjacencyMatrixCellDescription?.('A', 'B', '4')).toBe('A vers B: poids 4');
    expect(translations.chart.orgChartNodeDescription?.('A', 'Lead', 'Sales', true)).toBe(
      'A; Lead; Sales; a des rapports'
    );
    expect(translations.chart.orgChartToggleDescription?.('A', true)).toBe('Réduire A');
    expect(translations.chart.mapBubbleDescription?.('Place', '5', '10', '20', 'Group')).toBe(
      'Place; valeur 5; latitude 10, longitude 20; groupe Group'
    );
    expect(translations.chart.mapPointDescription?.('Place', '10', '20')).toBe('Place; latitude 10, longitude 20');
    expect(translations.chart.mapLineDescription?.('Route', 'A', 'B')).toBe('Route: de A à B');
    expect(translations.chart.choroplethRegionDescription?.('France', '10', '')).toBe('France: 10');
    expect(translations.chart.geoHeatmapCellDescription?.('10', '20', '5')).toBe('Zone à 10, 20: 5');
    expect(translations.chart.networkNodeDescription?.('A', '5', 'Group', '2')).toBe('A; valeur 5; Group; liens 2');
    expect(translations.chart.networkLinkDescription?.('A', 'B', '3')).toBe('Lien A vers B: 3');
    expect(translations.chart.parallelCoordinatesLineDescription?.('1', 'age: 10')).toBe('Enregistrement 1: age: 10');
    expect(translations.chart.multiNeedleDescription?.('Sales', '80', '%', 'needle')).toBe('Sales: 80%; needle');
    expect(translations.chart.topologyNodeDescription?.('Agent', 'Critic', 'thinking')).toBe('Agent; Critic; thinking');
    expect(translations.chart.topologyLinkDescription?.('A', 'B', true, 'uses')).toBe('A vers B; uses; actif');
    expect(translations.chart.pictorialIconDescription?.(1, '10', '50')).toBe('Icône 1: seuil 10, remplissage 50%');
    expect(translations.chart.packedBubbleMarkDescription?.('A', 'Group', '5')).toBe('A; Group; valeur 5');
    expect(translations.chart.wordCloudMarkDescription?.('Angular', '5')).toBe('Angular: poids 5');
    expect(translations.chart.windRoseBinDescription?.('N', '0-5', '10%', '10%')).toBe(
      'Direction N, vitesse 0-5: 10%, cumul 10%'
    );
    expect(translations.chart.sankeyNodeDescription?.('A', '20', '10', '10')).toBe(
      'A: flux 20, entrant 10, sortant 10'
    );
    expect(translations.chart.sankeyLinkDescription?.('A', 'B', '10')).toBe('Flux de A vers B: 10');
    expect(translations.chart.timelineEventDescription?.('Launch', 'Release', 'completed', 'Monday', 'Tuesday')).toBe(
      'Launch (Release, completed) du Monday au Tuesday'
    );
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
