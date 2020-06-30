import curry from "lodash/curry";
import isObject from "lodash/isObjectLike";
import mapValues from "lodash/mapValues";
import { Element, ElementCompact, js2xml, Options, xml2js } from "xml-js";

export function recursiveXml2js(data: any) {
  if (data == null || Object.keys(data).length === 0) {
    return null;
  } else if (data._text) {
    // text node
    return data._text;
  } else if (Array.isArray(data)) {
    return data.map(recursiveXml2js);
  } else if (isObject(data)) {
    const { _attributes, ...rest } = data;
    return mapValues(rest, recursiveXml2js);
  }
  throw new Error(`Unknown xml case: ${data}`);
}

export const xmlConvOpt: Options.JS2XML = {
  compact: true,
  ignoreComment: true,
  spaces: 4
};

export const jsConvOpt: Options.XML2JS = {
  compact: true
};

// I ain't gat thyyyymmme for dis bidges
const js2xmlWellTyped = (
  options: Options.JS2XML,
  obj: Element | ElementCompact
) => js2xml(obj, options);

const xml2jsWellTyped = (options: Options.XML2JS, xml: string) =>
  xml2js(xml, options);

export const xml2js2 = curry(xml2jsWellTyped);
export const js2xml2 = curry(js2xmlWellTyped);
