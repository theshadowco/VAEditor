import { VanessaGherkinProvider } from '../../src/languages/turbo-gherkin/provider';
import { content } from './example.file.js'
let expect = require('chai').expect;

describe('Сворачивание кода', function () {
  let result, ranges: Array<monaco.languages.FoldingRange>;
  before(() => {
    const provider = VanessaGherkinProvider.instance;
    const model = monaco.editor.createModel(content, "turbo-gherkin");
    result = provider.provideFoldingRanges(model, undefined, undefined) as Array<monaco.languages.FoldingRange>;
    ranges = result.map(e => ({ start: e.start, end: e.end }));
  });
  it('Свертка тегов и комментариев', () => {
    expect(result[0]).to.have.property('kind').to.be.an('object').to.have.property('value', 'comment');
    expect(ranges).to.deep.include({ start: 1, end: 2 });
    expect(ranges).to.deep.include({ start: 3, end: 5 });
  });
  it('Свертка секций фиче-файла', () => {
    let regions = result.filter(e => e.kind && e.kind.value === 'region');
    for (let i = 0; i < regions.length - 1; ++i) {
      expect(regions[i].end + 1).to.equal(regions[i + 1].start);
    }
  });
  it('Свертка описания функционала', () => {
    expect(ranges).to.deep.include({ start: 8, end: 10 });
    expect(ranges).to.deep.include({ start: 9, end: 10 });
  });
  it('Простые отступы шагов', () => {
    expect(ranges).to.deep.include({ start: 21, end: 26 });
    expect(ranges).to.deep.include({ start: 22, end: 25 });
    expect(ranges).to.deep.include({ start: 23, end: 25 });
  });
  it('Свертка таблиц и многострочных параметров', () => {
    expect(ranges).to.deep.include({ start: 30, end: 41 });
    expect(ranges).to.deep.include({ start: 43, end: 50 });
  });
})