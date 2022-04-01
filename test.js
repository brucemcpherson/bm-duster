import test from "ava";
import stableFunction from "stable-fn";
import { bmDuster } from "./index.js";

const fixture = ["a", "b", "c", "d", "e"];
const trues = Array.from({ length: fixture.length }, () => true);
const falses = trues.map(() => false);
// object tests
const fixtureObject = {
  name: "John",
  id: 123,
  options: {
    specs: true,
  },
};
const fixtureClone = JSON.parse(JSON.stringify(fixtureObject));
const fixtureRef = fixtureObject;
const fixtureDifferent = {
  ...fixtureObject,
  id: null,
};
// set tests
const fixtureSet = new Set(Object.keys(fixtureObject));
const fixtureSetClone = new Set(Array.from(fixtureSet.keys()));
const fixtureSetRef = fixtureSet;
const fixtureSetDifferent = new Set(
  Array.from(fixtureSet.keys()).concat("extra").slice(1)
);
// map tests
const fixtureMap = new Map(
  Object.keys(fixtureObject).map((f) => [f, fixtureObject[f]])
);
const v = Array.from(fixtureMap);
const fixtureMapClone = new Map(v);
const fixtureMapRef = fixtureMap;
const fixtureMapDifferent = new Map(v.concat([["extra", 100]]).slice(1));

// start with this object
const originalObject = {
  countArgs: (...args) => args.length,
  stringArgs: (...args) => JSON.stringify(args),
};
// set a default method
const dust = bmDuster.proxyDust({
  originalObject,
  defaultMethod: originalObject.countArgs,
});

test("dust", (t) => {
  t.is(fixture.length, dust(...fixture));
  t.is(JSON.stringify(fixture), dust.stringArgs(...fixture));
  t.is(dust(...fixture), dust.countArgs(...fixture));
});

test("dust differently", (t) => {
  // set a default method
  const dust = bmDuster.proxyDust({
    originalObject,
    defaultMethod: (...args) => args.join(""),
  });
  t.true(stableFunction(() => dust(...fixture)));
  t.is(fixture.join(""), dust(...fixture));
  t.is(JSON.stringify(fixture), dust.stringArgs(...fixture));
  t.is(fixture.length, dust.countArgs(...fixture));
});

// rest of tests are based on this
const duster = () => {
  // process the results once
  const results = ({ value, operation = bmDuster.equals }, ...args) =>
    args.flat(Infinity).map((f) => operation(f, value));

  // the basic object
  const originalObject = {
    every: ({ operation, value }, ...args) =>
      results({ operation, value }, ...args).every((f) => f),
    some: ({ operation, value }, ...args) =>
      results({ operation, value }, ...args).some((f) => f),
    none: ({ operation, value }, ...args) =>
      results({ operation, value }, ...args).every((f) => !f),
    partial: ({ operation, value }, ...args) =>
      results({ operation, value }, ...args).some((f) => f) &&
      !results({ operation, value }, ...args).every((f) => f),
    list: ({ operation, value }, ...args) =>
      results({ operation, value }, ...args),
  };

  return bmDuster.proxyDust({
    originalObject,
    defaultMethod: originalObject.every,
  });
};
const compare = duster();

test("compare simple default", (t) => {
  t.true(stableFunction(() => compare({ value: true }, trues)));
  t.true(compare({ value: null }, null));
  t.false(compare({ value: null }, 123));
  t.false(compare({ value: null }, undefined));
  t.false(compare({ value: null }, [...fixture]));
  t.false(compare({ value: "a" }, [...fixture]));
  t.false(compare({ value: fixture }, [...fixture]));
  t.true(compare({ value: false }, falses));
  t.true(
    compare({ value: fixtureObject }, fixtureObject, fixtureClone, fixtureRef)
  );
  t.false(
    compare(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureDifferent,
      fixtureRef
    )
  );
  t.true(
    compare({ value: fixtureSet }, fixtureSet, fixtureSetClone, fixtureSetRef)
  );
  t.false(
    compare(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetDifferent,
      fixtureSetRef
    )
  );
  t.true(
    compare({ value: fixtureMap }, fixtureMap, fixtureMapClone, fixtureMapRef)
  );
  t.false(
    compare(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapDifferent,
      fixtureMapRef
    )
  );
});

test("compare every", (t) => {
  t.true(stableFunction(() => compare.every({ value: true }, trues)));
  t.false(compare.every({ value: "cheese" }, null));
  t.true(compare.every({ value: "cheese" }, "cheese", "cheese"));
  t.false(compare.every({ value: "cheese" }, "cheese", "onion"));
  t.false(compare.every({ value: null }, 123));
  t.false(compare.every({ value: null }, undefined));
  t.false(compare.every({ value: null }, [...fixture]));
  t.false(compare.every({ value: "a" }, [...fixture]));
  t.false(compare.every({ value: fixture }, [...fixture]));
  t.true(
    compare.every(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureRef
    )
  );
  t.false(
    compare.every(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureDifferent,
      fixtureRef
    )
  );
  t.true(
    compare.every(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetRef
    )
  );
  t.false(
    compare.every(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetDifferent,
      fixtureSetRef
    )
  );
  t.true(
    compare.every(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapRef
    )
  );
  t.false(
    compare.every(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapDifferent,
      fixtureMapRef
    )
  );
});

test("compare some", (t) => {
  t.true(stableFunction(() => compare.some({ value: true }, trues)));
  t.false(compare.some({ value: "cheese" }, null));
  t.true(compare.some({ value: "cheese" }, "cheese", "cheese"));
  t.true(compare.some({ value: "cheese" }, "cheese", "onion"));
  t.false(compare.some({ value: null }, 123));
  t.false(compare.some({ value: null }, undefined));
  t.false(compare.some({ value: null }, [...fixture]));
  t.true(compare.some({ value: "a" }, [...fixture]));
  t.false(compare.some({ value: fixture }, [...fixture]));
  t.true(
    compare.some(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureRef
    )
  );
  t.true(
    compare.some(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureDifferent,
      fixtureRef
    )
  );
  t.false(compare.some({ value: fixtureObject }, fixtureDifferent));
  t.true(
    compare.some(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetRef
    )
  );
  t.true(
    compare.some(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetDifferent,
      fixtureSetRef
    )
  );
  t.false(compare.some({ value: fixtureSet }, fixtureSetDifferent));
  t.true(
    compare.some(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapRef
    )
  );
  t.true(
    compare.some(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapDifferent,
      fixtureMapRef
    )
  );
  t.false(compare.some({ value: fixtureMap }, fixtureMapDifferent));
});

test("compare partial", (t) => {
  t.true(stableFunction(() => compare.partial({ value: true }, trues)));
  t.false(compare.partial({ value: "cheese" }, null));
  t.false(compare.partial({ value: "cheese" }, "cheese", "cheese"));
  t.true(compare.partial({ value: "cheese" }, "cheese", "onion"));
  t.false(compare.partial({ value: null }, 123));
  t.false(compare.partial({ value: null }, undefined));
  t.false(compare.partial({ value: null }, [...fixture]));
  t.true(compare.partial({ value: "a" }, [...fixture]));
  t.false(compare.partial({ value: fixture }, [...fixture]));
  t.false(
    compare.partial(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureRef
    )
  );
  t.true(
    compare.partial(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureDifferent,
      fixtureRef
    )
  );
  t.false(compare.partial({ value: fixtureObject }, fixtureDifferent));
  t.false(
    compare.partial(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetRef
    )
  );
  t.true(
    compare.partial(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetDifferent,
      fixtureSetRef
    )
  );
  t.false(compare.partial({ value: fixtureSet }, fixtureSetDifferent));
  t.false(
    compare.partial(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapRef
    )
  );
  t.true(
    compare.partial(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapDifferent,
      fixtureMapRef
    )
  );
  t.false(compare.partial({ value: fixtureMap }, fixtureMapDifferent));
});

test("compare none", (t) => {
  t.true(stableFunction(() => compare.none({ value: false }, trues)));
  t.true(compare.none({ value: "cheese" }, null));
  t.false(compare.none({ value: "cheese" }, "cheese", "cheese"));
  t.false(compare.none({ value: "cheese" }, "cheese", "onion"));
  t.true(compare.none({ value: null }, 123));
  t.true(compare.none({ value: null }, undefined));
  t.true(compare.none({ value: null }, [...fixture]));
  t.false(compare.none({ value: "a" }, [...fixture]));
  t.true(compare.none({ value: fixture }, [...fixture]));
  t.false(
    compare.none(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureRef
    )
  );
  t.false(
    compare.none(
      { value: fixtureObject },
      fixtureObject,
      fixtureClone,
      fixtureDifferent,
      fixtureRef
    )
  );
  t.true(compare.none({ value: fixtureObject }, fixtureDifferent));
  t.false(
    compare.none(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetRef
    )
  );
  t.false(
    compare.none(
      { value: fixtureSet },
      fixtureSet,
      fixtureSetClone,
      fixtureSetDifferent,
      fixtureSetRef
    )
  );
  t.true(compare.none({ value: fixtureSet }, fixtureSetDifferent));
  t.false(
    compare.none(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapRef
    )
  );
  t.false(
    compare.none(
      { value: fixtureMap },
      fixtureMap,
      fixtureMapClone,
      fixtureMapDifferent,
      fixtureMapRef
    )
  );
  t.true(compare.none({ value: fixtureMap }, fixtureMapDifferent));
});

test("compare list", (t) => {
  t.true(stableFunction(() => compare.list({ value: false }, trues).join(",")));
  t.true(compare({ value: false }, compare.list({ value: "cheese" }, null)));
  t.true(
    compare.none(
      { value: false },
      compare.list({ value: "cheese" }, "cheese", "cheese")
    )
  );
  t.true(
    bmDuster.equals(
      [true, false],
      compare.list({ value: "cheese" }, "cheese", "onion")
    )
  );
  t.deepEqual([false], compare.list({ value: null }, 123));
  t.deepEqual([false], compare.list({ value: null }, undefined));
  t.deepEqual(falses, compare.list({ value: null }, [...fixture]));
  t.true(
    compare.partial({ value: true }, compare.list({ value: "a" }, [...fixture]))
  );
  t.deepEqual(falses, compare.list({ value: fixture }, [...fixture]));
  t.true(
    compare.every(
      { value: true },
      compare.list(
        { value: fixtureObject },
        fixtureObject,
        fixtureClone,
        fixtureRef
      )
    )
  );
  t.true(
    bmDuster.equals(
      [true, true, false, true],
      compare.list(
        { value: fixtureObject },
        fixtureObject,
        fixtureClone,
        fixtureDifferent,
        fixtureRef
      )
    )
  );

  t.true(
    compare(
      { value: false },
      compare.list({ value: fixtureObject }, fixtureDifferent)
    )
  );
});
/*
const tester = () => {
  // comparisons I
  // various tests for null
  const compare = duster();
  let testNumber = 0;
  checker(++testNumber, true, compare({ value: null }, null));
  checker(++testNumber, false, compare({ value: null }, 123));
  checker(++testNumber, false, compare({ value: null }, undefined));
  checker(++testNumber, true, compare({ value: null }, null, null));
  checker(++testNumber, false, compare({ value: null }, null, 99));
  checker(++testNumber, false, compare.every({ value: null }, null, 99));
  checker(++testNumber, true, compare.some({ value: null }, null, 99));
  checker(++testNumber, false, compare.partial({ value: 99 }, 99, 99));
  checker(++testNumber, [false, true], compare.list({ value: 99 }, 100, 99));
  checker(++testNumber, false, compare.none({ value: 99 }, 100, 99));
  checker(++testNumber, true, compare.none({ value: 99 }, 12, "eggs", 56));
  checker(++testNumber, false, compare.some({ value: 99 }, 12, "eggs", "99"));
  checker(++testNumber, true, compare.some({ value: 99 }, 12, "eggs", 99));

  checker(
    ++testNumber,
    false,
    compare({ value: { name: "john" } }, 12, "eggs", 99)
  );
  checker(
    ++testNumber,
    true,
    compare.partial({ value: { name: "john", id: 123 } }, 12, "eggs", {
      name: "john",
      id: 123,
    })
  );
  checker(
    ++testNumber,
    true,
    compare.every(
      { value: { name: "john", id: 123 } },
      { name: "john", id: 123 },
      { name: "john", id: 123 },
      { name: "john", id: 123 }
    )
  );
  checker(
    ++testNumber,
    true,
    compare.partial(
      { value: { name: "john", id: 123 } },
      { name: "fred", id: 123 },
      { name: "john", id: 123 },
      { name: "john", id: 123 }
    )
  );

  checker(
    ++testNumber,
    [true, false],
    compare.list(
      { value: new Set(["a", "b"]) },
      new Set(["a", "b"]),
      new Set(["b", "c"])
    )
  );
  checker(
    ++testNumber,
    [true, false],
    compare.list(
      {
        value: new Map([
          ["a", "b"],
          ["c", "d"],
        ]),
      },
      new Map([
        ["a", "b"],
        ["c", "d"],
      ]),
      new Map([["a", "b"]])
    )
  );
};
*/
