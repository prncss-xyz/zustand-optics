# Zustand Optics

[![Codecov](https://img.shields.io/codecov/c/github/prncss-xyz/zustand-optics)](https://codecov.io/github/prncss-xyz/zustand-optics)
[![Version](https://img.shields.io/npm/v/@prncss-xyz/zustand-optics)](https://www.npmjs.com/package/@prncss-xyz/zustand-optics)

[Zustand](https://docs.pmnd.rs/zustand) integration for [optics-ts](https://akheron.github.io/optics-ts/). Based on [jotai-optics](https://github.com/jotaijs/jotai-optics).

## Install

`npm i optics-ts @prncss-xyz/zustand-optics`

## Usage

### First create a store

```typescript
import { create } from "zustand";
import { bindStoreWithOptics } from "@prncss-xyz/zustand-optics";
import { optic } from "optics-ts";

const init = { bears: { grizzly: 0 } };
const useBearStore = bindStoreWithOptics(create(() => init));
const bearStoreO = optic<typeof init>();
```

### Then

```typescript
import { useCallback } from "react";

function GrizzlyCounter({ grizzly }: { grizzly: number }) {
  return <h1>{grizzly} around here...</h1>;
}
const grizzlyO = bearStoreO.prop("bears").prop("grizzly");

function App() {
  const [grizzly, setGrizzly] = useBearStore.rw(grizzlyO);
  const increasePopulation = useCallback(() => setGrizzly((x) => x + 1), []);
  return (
    <>
      <GrizzlyCounter grizzly={grizzly} />
      <button onClick={increasePopulation}>one up</button>
    </>
  );
}

```

## API

### bindStoreWithOptics

`const useStore = bindStoreWithOptics<S>(useBoundStore: UseBoundStore<StoreApi<S>>, defaultIsEqual = Object.is)`

Create a hook with methods as described below. For the meaning of `defaultIsEqual`, see `activate`.

### Basic hooks

#### get

```javascript
const value = useStore.get(focus);
```

Returns the value of the focus. (Will retrun an array if focus is a traversable).

#### set

```javascript
const setValue = useStore.set(focus);
setValue(value);
```

Return a callback which accepts a value and sets the focus with it. If `value` is a value (!), sets that value to the focus. If `value` is a callback, applies the callback to focus. If `value` is `undefined`, removes the focus for a removable optics (prism and traversable) and do nothing otherwise.

The callback is stable.

### Utility hooks

These are wrappers around basic hooks which can help with code readability.

### rw

Returns a pair made of the focus value and a `set` callback.

```javascript
const [value, setValue] = useStore.rw(focus);
```

### activate

```javascript
const [active, activate] = useStore.activate(focus, target, isEqual?);
activate()
```

Returns a pair. The first value is a boolean reprenting wether the focus has the target value. The second value is a callback setting focus to target value.

```typescript
isEqual<A>(a: A, b: A): boolean
```

The second argument is an optional equality function. If not provided, it defaults to the second argument of `createStoreWithOptics`. If neither is provided, defaults to `Object.is`.

### setWith

```javascript
const setter = useStore.setWith([focus1, value1], [focus2, value2] /*, ...*/);
setter();
```

Creates a callback which calls multiple `set` operations from left to right.

Note on typing: if you have more than 7 arguments (please don't), TypeScript will assume they all have the same type.
