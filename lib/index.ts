/* eslint-disable react-hooks/rules-of-hooks */
import { SetStateAction, useCallback } from "react";
import * as O from "optics-ts";
import { StoreApi, UseBoundStore } from "zustand";

export function createStoreWithOptics<S>(
  useBoundStore: UseBoundStore<StoreApi<S>>,
  defaultIsEqual = Object.is,
) {
  function get<A>(f: O.Getter<S, A>): A;
  function get<A>(f: O.Lens<S, any, A>): A;
  function get<A>(f: O.Equivalence<S, any, A>): A;
  function get<A>(f: O.Iso<S, any, A>): A;
  function get<A>(f: O.Prism<S, any, A>): A | undefined;
  function get<A>(f: O.Traversal<S, any, A>): A[];
  function get<A>(
    focus:
      | O.Getter<S, A>
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
  ) {
    return useBoundStore(valueProducer(focus));
  }

  function set<A>(
    focus: O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
  ): (v: SetStateAction<A>) => void;
  function set<A>(
    focus: O.Prism<S, any, A> | O.Traversal<S, any, A>,
  ): (v: SetStateAction<A> | undefined) => void;
  function set<A>(
    focus:
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
  ) {
    return useCallback(
      (value: SetStateAction<A> | undefined) =>
        useBoundStore.setState(updateProducer(focus)(value)),
      [focus],
    );
  }

  type Pair<A> =
    | [
        focus: O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
        value: SetStateAction<A>,
      ]
    | [
        focus: O.Prism<S, any, A> | O.Traversal<S, any, A>,
        value: SetStateAction<A> | undefined,
      ];
  function setWith<A, B, C, D, E, F, G>(
    ...ps: [Pair<A>, Pair<B>, Pair<C>, Pair<D>, Pair<E>, Pair<F>, Pair<G>]
  ): () => void;
  function setWith<A, B, C, D, E, F>(
    ...ps: [Pair<A>, Pair<B>, Pair<C>, Pair<D>, Pair<E>, Pair<F>]
  ): () => void;
  function setWith<A, B, C, D, E>(
    ...ps: [Pair<A>, Pair<B>, Pair<C>, Pair<D>, Pair<E>]
  ): () => void;
  function setWith<A, B, C, D>(
    ...ps: [Pair<A>, Pair<B>, Pair<C>, Pair<D>]
  ): () => void;
  function setWith<A, B, C>(...ps: [Pair<A>, Pair<B>, Pair<C>]): () => void;
  function setWith<A, B>(...ps: [Pair<A>, Pair<B>]): () => void;
  function setWith<A>(...ps: Pair<A>[]): () => void;
  function setWith(...ps: Pair<unknown>[]) {
    const step = (p: Pair<unknown>) => updateProducer(p[0])(p[1]);
    const pipe2 = (f: (s: S) => S, g: (s: S) => S) => (s: S) => g(f(s));
    const cb = ps.reduce(
      (acc, p) => pipe2(acc, step(p)),
      (s: S) => s,
    );
    return useCallback(() => useBoundStore.setState(cb), [cb]);
  }

  function rw<A>(f: O.Lens<S, any, A>): [A, (v: SetStateAction<A>) => void];
  function rw<A>(
    f: O.Equivalence<S, any, A>,
  ): [A, (v: SetStateAction<A>) => void];
  function rw<A>(f: O.Iso<S, any, A>): [A, (v: SetStateAction<A>) => void];
  function rw<A>(
    f: O.Prism<S, any, A>,
  ): [A | undefined, (v: SetStateAction<A> | undefined) => void];
  function rw<A>(
    f: O.Traversal<S, any, A>,
  ): [A[], (v: SetStateAction<A[]> | undefined) => void];
  function rw<A>(
    focus:
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
  ) {
    return [
      useBoundStore(valueProducer(focus)),
      useCallback(
        (value: SetStateAction<A> | undefined) =>
          useBoundStore.setState(updateProducer(focus)(value)),
        [focus],
      ),
    ] as const;
  }

  function activate<A>(
    focus: O.Lens<S, any, A> | O.Equivalence<S, any, A> | O.Iso<S, any, A>,
    value: A,
    isEqual?: (p: any, q: any) => boolean,
  ): readonly [boolean, () => void];
  function activate<A>(
    focus: O.Prism<S, any, A> | O.Traversal<S, any, A>,
    value: A | undefined,
    isEqual?: (p: any, q: any) => boolean,
  ): readonly [boolean, () => void];
  function activate<A>(
    focus:
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
    value: A | undefined,
    isEqual = defaultIsEqual,
  ) {
    return [
      useBoundStore((s) => isEqual(valueProducer(focus)(s), value)),
      useCallback(
        () => useBoundStore.setState(updateProducer(focus)(value)),
        [focus, value],
      ),
    ] as const;
  }

  return {
    get,
    set,
    setWith,
    rw,
    activate,
  };
}

const isFunction = <T>(x: T): x is T & ((...args: any[]) => any) =>
  typeof x === "function";

const valueProducer =
  <S, A>(
    focus:
      | O.Getter<S, A>
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
  ) =>
  (source: S) => {
    if (focus._tag === "Traversal") {
      const values = O.collect(focus)(source);
      return values;
    }
    if (focus._tag === "Prism") {
      const value = O.preview(focus)(source);
      return value;
    }
    const value = O.get(focus)(source);
    return value;
  };

const updateProducer =
  <S, A>(
    focus:
      | O.Lens<S, any, A>
      | O.Equivalence<S, any, A>
      | O.Iso<S, any, A>
      | O.Prism<S, any, A>
      | O.Traversal<S, any, A>,
  ) =>
  (update: SetStateAction<A> | undefined) => {
    if (update === undefined) {
      if (focus._tag === "Traversal" || focus._tag === "Prism")
        return O.remove(focus);
      return (s: S) => s;
    }
    if (isFunction(update)) return O.modify(focus)(update);
    return O.set(focus)(update);
  };
