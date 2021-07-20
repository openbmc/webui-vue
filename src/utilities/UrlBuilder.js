const cleanOptionalsRegEx = /[/&]?\{:\s*([^}\s]+)\s*\}/g;
const replaceAmperstand = /&+/g;
const cleanAmperstand = /^&|&$/g;
const requiredParametersRegEx = /\{([^:]\s*[^}\s]+)\s*\}/g;
const optionalParametersRegEx = /\{:\s*([^}\s]+)\s*\}/g;

export default class UrlBuilder {
  format(template, params) {
    if (!template) {
      throw new Error('UrlBuilder: template is required');
    }
    const urlValueProvider = (obj, property) => obj[property];

    if (template.indexOf('?') === -1) {
      return this.formatUrl(template, params, urlValueProvider);
    }

    const [urlTemplate, queryStringTemplate] = template.split('?');
    const url = this.formatUrl(urlTemplate, params, urlValueProvider);
    const queryString = this.formatUrl(
      queryStringTemplate,
      params,
      (obj, property) => this.queryStringProvider(obj, property)
    );

    return queryString.length > 0 ? `${url}?${queryString}` : url;
  }

  formatUrl(template, params, valueProvider) {
    let url = this.replace(
      requiredParametersRegEx,
      template,
      params,
      valueProvider
    );
    url = this.replace(optionalParametersRegEx, url, params, valueProvider);
    url = url.replace(cleanOptionalsRegEx, '');
    url = url.replace(replaceAmperstand, '&');
    url = url.replace(cleanAmperstand, '');

    if (requiredParametersRegEx.test(url)) {
      const matches = url.match(requiredParametersRegEx) || [];

      throw new Error(
        `UrlBuilder: not all required parameters are matched.Following did not matched: ${matches.join(
          ', '
        )}`
      );
    }

    return url;
  }

  replace(regex, template, params, valueProvider) {
    if (!params) {
      return template;
    }

    const result = template.replace(regex, (match, group1) => {
      // we need to know whether object has property or not
      // eslint-disable-next-line no-prototype-builtins
      if (params.hasOwnProperty(group1)) {
        return valueProvider(params, group1);
      }

      return match;
    });

    return result;
  }

  queryStringProvider(obj, property) {
    if (obj[property] == null) {
      return '';
    }

    if (!Array.isArray(obj[property])) {
      return `${property}=${obj[property]}`;
    }

    if (obj[property].length === 0) {
      return '';
    }

    const reducer = (accumulator, currentValue, i, arr) => {
      if (!currentValue) {
        return accumulator;
      }

      const val = `${accumulator}${encodeURIComponent(currentValue)}`;
      return arr.length - 1 > i ? `${val},` : val;
    };

    const s = obj[property].reduce(reducer, '');
    return `${property}=${s}`;
  }
}
