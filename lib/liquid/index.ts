export type Parameters = Record<string, any>;
export type ParseOptions = {
  matcher?: RegExp,
};
export const defaultMatcher = /{{([^}]*)}}/ig;
export const parse = (string: string, parameters: Parameters, options: ParseOptions = {}) => {
  const {
    matcher = defaultMatcher,
  } = options;
  return string
    .replaceAll(matcher, (raw, match) => {
      if (match in parameters) {
        return String(parameters[match]);
      }
      return raw;
    });
};
