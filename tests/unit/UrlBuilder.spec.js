/* eslint-disable prettier/prettier */
import UrlBuilder from '@/utilities/UrlBuilder';

describe('UrlBuilder', () => {
  let service;
  beforeEach(() => {
    service = new UrlBuilder();
  });

  it('should throw when tempalte is null or empty', () => {
    expect(() => {
      service.format('', {});
    }).toThrow();

    expect(() => {
      service.format(null, {});
    }).toThrow();
  });

  it('should throw when template contains required parameters that are not supplied', () => {
    expect(() => {
      service.format('http://example.com/{projectId}/script/{id}', {});
    }).toThrow();

    expect(() => {
      service.format('http://example.com/{projectId}/script', {});
    }).toThrow();
  });

  it('Should map optional parameter at the end of the template', () => {
    const result = service.format('http://example.com/script/{:id}', {
      projectId: 12,
      id: 99,
    });
    expect(result).toEqual('http://example.com/script/99');
  });

  it('should map empty value when parameter is not provided', () => {
    const result = service.format('http://example.com/script/{:id}/values', {
      projectId: 12,
    });
    expect(result).toEqual('http://example.com/script/values');
  });

  it('should map optional value when parameter is provided', () => {
    const result = service.format('http://example.com/script/{:id}/values', {
      id: 12,
    });
    expect(result).toEqual('http://example.com/script/12/values');
  });

  it('should return template when params are null', () => {
    const result = service.format('http://example.com/script', null);
    expect(result).toEqual('http://example.com/script');
  });

  it('should map required parameter in query string', () => {
    const result = service.format('http://example.com/script?{id}&values=1,2', {
      id: 12,
    });
    expect(result).toEqual('http://example.com/script?id=12&values=1,2');
  });

  it('should map required parameter in query string when value is array', () => {
    const result = service.format(
      'http://example.com/script?{ids}&values=1,2',
      {
        ids: [12, 'someValue', 3333],
      }
    );
    expect(result).toEqual(
      'http://example.com/script?ids=12,someValue,3333&values=1,2'
    );
  });

  it('should map optional parameter in query string', () => {
    const result = service.format(
      'http://example.com/script?{:id}&values=1,2',
      {
        id: 12,
      }
    );
    expect(result).toEqual('http://example.com/script?id=12&values=1,2');
  });

  it('should remove optional parameter in query string', () => {
    const result = service.format(
      'http://example.com/script?{:id}&values=1,2',
      {}
    );
    expect(result).toEqual('http://example.com/script?values=1,2');
  });

  it('should map params', () => {
    const result = service.format('http://example.com/{plot}', {
      plot: 1,
    });

    expect(result).toEqual('http://example.com/1');
  });

  it('should not map null params', () => {
    const result = service.format(
      'http://example.com/{plot}?{:workloads}&{:projects}&{:types}&{:zero}&{:emptyString}&{:array}',
      {
        plot: 1,
        workloads: null,
        zero: 0,
        emptyString: '',
        array: [],
      }
    );

    expect(result).toEqual('http://example.com/1?zero=0&emptyString=');
  });

  it('should not leave many & when optionals are arrays', () => {
    const result = service.format(
      'http://example.com/api/plots-data/{plot}?{:firmwareRevisions}&{:instances}&{:projects}&{:types}&{:workloads}&{from}&{to}',
      {
        plot: 1,
        firmwareRevisions: [],
        instances: [],
        projects: [],
        types: [],
        workloads: [],
        from: '2014-11-22',
        to: '2014-11-22',
      }
    );
    expect(result).toEqual(
      'http://example.com/api/plots-data/1?from=2014-11-22&to=2014-11-22'
    );
  });

  it('should not leave many & when optionals are empty arrays and some are not', () => {
    const result = service.format(
      'http://example.com/api/plots-data/{plot}?{:firmwareRevisions}&{:instances}&{:projects}&{:types}&{:workloads}&{from}&{to}',
      {
        plot: 1,
        firmwareRevisions: [1, 2, 3],
        instances: [],
        projects: [],
        types: [],
        workloads: [],
        from: '2014-11-22',
        to: '2014-11-22',
      }
    );

    expect(result).toEqual(
      'http://example.com/api/plots-data/1?firmwareRevisions=1,2,3&from=2014-11-22&to=2014-11-22'
    );
  });
});
