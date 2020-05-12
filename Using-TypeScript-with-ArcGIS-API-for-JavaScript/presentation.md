<!-- .slide: data-background="../images/bg-1.png" -->

<h1 style="text-align: left; font-size: 80px;">Using TypeScript</h1>
<h2 style="text-align: left; font-size: 60px;">with the ArcGIS API for JavaScript</h2>
<p style="text-align: left; font-size: 30px;">Stefan Eilemann | René Rubalcava</p>
    <p style="text-align: left; font-size: 30px;">slides: <a href="https://git.io/fhpEi"><code>https://git.io/fhpEi</code></a></p>

---

<!-- .slide: data-background="../images/bg-2.png" -->

## Agenda

- Development tooling & setup
- Working with the 4.x JS API
- Accessor, decorators, and advanced concepts

---

<!-- .slide: data-background="../images/bg-4.png" -->

## Super quick TS intro

---

## Superset of JavaScript

- *Transpiles* to JavaScript
- ESNext features (import, =>, rest/spread, async/await, etc)
- Types
- Compatible with existing JavaScript

---

## Benefits of TypeScript

![TypeScript](images/typescript.jpg)
- Easier for multiple people to work on
- Easier to refactor
- Easier to test
- Can help prevent technical debt

---

<!-- .slide: class="section" -->

# Fundamentals

---

## Primitive (Basic) Types

- `boolean`, `number`, `string`, `[]`, `{}`
- `any`

```ts
type Foo = number;

const foo: Foo = 8;
const bar: string = "Lorem ipsum";

// Here be dragons
const waldo: any = {
  doStuff: (things: any) => something
};
```

---

## Type Inference

- TypeScript compiler can infer types automatically 

```ts
let foo = 8; // number type is inferred

foo = 12; // Ok

foo = "12"; // Error!
```

---

## Interfaces

- Define contracts between parts of an application

```ts
type Foo = number;
type Bar = string;

interface Foobar {
  foo: Foo,
  bar: Bar
}

const baz: Foobar = { foo: 8, bar: "Lorem ipsum" }; // Ok
const qux: Foobar = { foo: "12", bar: "Lorem ipsum" } // Error!
```

---

- Interfaces facilitate predictable behavior

```ts
interface Foobar {
  foo: number,
  bar: string
}

const waldo = {
  doStuff: (things: Foobar): Foobar => ({
    foo: things.foo + 1,
    bar: `${things.bar}!`
  })
};

waldo.doStuff({ foo: 1, bar: "a" }); // Ok, { foo: 2, bar: "a!" }
waldo.doStuff(1, "a"); // Error!
```

---

## Classes

```ts
class Waldo {
  public doStuff(things: Foobar): Foobar { ... }

  private iterateNumber(num: number) {
    return num + 1;
  }

  private addExclamationPoint(str: string) {
    return `${str}!`;
  }
}

const testWaldo = new Waldo(); // Create a Waldo instance
testWaldo.iterateNumber(2); // Error!
```

---

## Extension

- Interfaces can extend other interfaces *or* classes
- Classes can extend other classes and *implement* interfaces

```ts
interface Point {
  x: number;
  y: number;
}

interface Point3d extends Point { z: number; }

class MyPoint implements Point3d {
  x = 0;
  y = 0;
  z = 0;
}

class My4dPoint extends MyPoint {
  time = Date.now();
}
```

---

<!-- .slide: data-background="../images/bg-4.png" -->

## Development tooling

---

## Essentials

- typescript: `npm install --save-dev typescript`
- JS API 4.x typings: `npm install --save-dev @types/arcgis-js-api`
- JS API 3.x typings: `npm install --save-dev @types/arcgis-js-api@3`

---

## Recommended

- [Visual Studio Code](https://code.visualstudio.com/)
- tslint: `npm install --save-dev tslint`

---

## Setting Up

[developers.arcgis.com/javascript/latest/guide/typescript-setup](https://developers.arcgis.com/javascript/latest/guide/typescript-setup/index.html)

---

<!-- .slide: data-background="../images/bg-4.png" -->

## Working with the JavaScript API

---

## Imports

- JS API is currently strictly AMD
- Conventionally classes are exported directly
- Requires the use of `require` style imports
  - `import MapView from "esri/views/MapView"`
  - Or, use `esModuleInterop` with typescript 2.7.2

---

## Auto-cast

- Due to nature of types, auto-cast does not type-check
  - `get` and `set` must have the same type
- Auto-casting is supported in constructor signatures only
  - Still helps in lots of cases
  - For setting properties, need to import the relevant modules

---

## Typing improvements

- Use of generics where possible `Collection<T>`
- Strictly type events (`MapView.on("mouse-wheel", ...)`))
- "Advanced" auto-casts like colors (`"red"`), screen sizes (`"5px"`) and basemaps `"streets"`

---

<!-- .slide: data-background="../images/bg-4.png" -->

## Advanced API concepts

---

## Promises

- In 4.7, promises are more compatible with native promises
- Replaced `then` with `when` for `esri/core/Promise`
- Typings are more compatible (although not fully compatible)
- General advice is to wrap API promises in native if needed
  until JS API switches to native promises

---

## Writing Accessor based classes

- Can be useful to use Accessor based classes in your app
- Also required for creating custom API based widgets
- API classes are using dojo declare, requires some additional work to integrate with TS
- [Code](./demos/subclassing)

---

## Multiple inheritance

- Multiple inheritance possible with dojo declare
- Supported in typescript at runtime and strictly type-checked
- Uses declaration merging
- [Code](./demos/subclassing)

---

## Extending the API typings

- API typings are not always as strict as they can be
- In rare occasions typings are missing or imprecise
- Typings can be externally "patched" through declaration merging
- [Code](./demos/type-extensions)

---

<!-- .slide: data-background="../images/bg-5.png" -->

## Questions?

---

<!-- .slide: data-background="../images/bg-esri.png" -->

---

<!-- .slide: data-background="../images/bg-rating.png" -->
