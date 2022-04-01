class UnknownPropertyError extends Error {
  constructor(prop) {
    super(`Attempt to access missing property ${prop}`);
    this.name = "Invalid property";
    this.prop = prop;
  }
}
class UnexpectedTypeError extends Error {
  constructor(expectedType, actualType) {
    super(`Expected ${expectedType} but got ${actualType}`);
    this.name = "Unexpected type";
    this.expectedType = expectedType;
    this.actualType = actualType;
  }
}
class UnexpectedValueError extends Error {
  constructor(expectedValue, actualValue) {
    super(
      `Expected ${JSON.stringify(expectedValue)} but got ${JSON.stringify(
        actualValue
      )}`
    );
    this.name = "Unexpected value";
    this.expectedValue = expectedValue;
    this.actualValue = actualValue;
  }
}
// hoist for exports
export const errors =  {
  newUnknownPropertyError: (prop) => new UnknownPropertyError(prop),
  newUnexpectedTypeError: (expectedType, actualType) =>
    new UnexpectedTypeError(expectedType, actualType),
  newUnexpectedValueError: (expectedValue, actualValue) =>
    new UnexpectedValueError(expectedValue, actualValue),
  UnexpectedTypeError,
  UnexpectedValueError,
  UnknownPropertyError
};
