import deepEql from "deep-eql";
import { errors } from "./errors.js";
const { UnexpectedTypeError, UnknownPropertyError } = errors;
const _proxying = (() => {
  /**
   * check a type is as expected and optionally fail
   * @param {object} params
   * @param {*} params.originalObject the originalObject to check
   * @param {string} [params.type="string"] the type to check for
   * @param {boolean} [params.fail=false] whether to fail if its not the expected type
   * @return {boolean} whether it was the correct type
   */
  const _checkType = ({ item, type = "string", fail = false }) => {
    const result = typeof item === type;
    if (fail && !result) throw new UnexpectedTypeError(type, typeof item);
    return result;
  };

  /**
   * make a proxy with a default method
   * @param {object} params
   * @param {object} params.originalObject the originalObject with the properties to proxy
   * @param {function} params.defaultMethod the method to execute if no property is selected
   * @param {function} [params.missingPropAction] what to do if a missing property is called
   * @return {function} its the default function, but with all the properties of the originalObject
   */
  const _proxyDust = ({
    originalObject,
    defaultMethod,
    missingPropAction = (prop) => {
      throw new UnknownPropertyError(prop);
    },
    applyAction = (target, thisArg, ...args) => {
      return target.apply(thisArg, ...args);
    },
    propAction = (target, prop, originalObject) => {
      return originalObject[prop];
    },
  }) => {
    // start with a default method - check it's a function
    _checkType({ item: defaultMethod, type: "function", fail: true });

    // and the target is object
    _checkType({ item: originalObject, type: "object", fail: true });

    // and the apply action is a function
    _checkType({ item: applyAction, type: "function", fail: true });

    // and the propAction is a function
    _checkType({ item: propAction, type: "function", fail: true });

    // make a proxy for the function to which we'll the originalObject
    const pust = new Proxy(defaultMethod, {
      get(target, prop) {
        // the property should exist in originalObject (not the default method)
        // so we just ignore the target typically
        if (prop in originalObject) {
          // just return the value for the existing prop
          return propAction(target, prop, originalObject);
        } else {
          // well that's a surprise
          return missingPropAction(prop);
        }
      },
      apply(target, thisArg, ...args) {
        // this where we go when it's called in vanilla mode
        return applyAction(target, thisArg, ...args);
      },
    });

    return pust;
  };
  return {
    _proxyDust,
    _checkType,
  };
})();

// hoist for export
export const bmDuster = {
  proxyDust: _proxying._proxyDust,
  checkType: _proxying._checkType,
  equals: deepEql,
};
