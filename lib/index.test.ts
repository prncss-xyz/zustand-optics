import { act, renderHook } from "@testing-library/react";
import { withOptics } from ".";
import { create } from "zustand";
import { optic } from "optics-ts";

describe("get", () => {
  describe("prism", () => {
    it("get value when focus exists", () => {
      const init = [1, 2, 3];
      const storeO = optic<typeof init>();
      const o = storeO.at(1);
      const useTestStore = withOptics(create(() => init));
      const value = renderHook(() => useTestStore.get(o)).result.current;
      expect(value).toBe(2);
    });
    it("get undefined when focus does not exist", () => {
      const init = [1, 2, 3];
      const storeO = optic<typeof init>();
      const o = storeO.at(3);
      const useTestStore = withOptics(create(() => init));
      const value = renderHook(() => useTestStore.get(o)).result.current;
      expect(value).toBeUndefined();
    });
  });
  describe("traversal", () => {
    it("should collect an arrray of value", () => {
      const init = [1, 2, 3];
      const storeO = optic<typeof init>();
      const o = storeO.elems();
      const useTestStore = withOptics(create(() => init));
      const value = renderHook(() => useTestStore.get(o)).result.current;
      expect(value).toEqual([1, 2, 3]);
    });
  });
});

describe("set", () => {
  it("applies updates in from left to right", () => {
    const init = { a: 1, b: 2, c: 3 };
    const storeO = optic<typeof init>();
    const a = storeO.prop("a");
    const useTestStore = withOptics(create(() => init));
    const cb = renderHook(() => useTestStore.set(a)).result.current;
    act(() => cb(2));
    const state = renderHook(() => useTestStore.get(storeO)).result.current;
    expect(state).toEqual({ a: 2, b: 2, c: 3 });
  });
});

describe("setWith", () => {
  it("applies updates in from left to right", () => {
    const init = { a: 1, b: 2, c: 3 };
    const storeO = optic<typeof init>();
    const a = storeO.prop("a");
    const b = storeO.prop("b");
    const useTestStore = withOptics(create(() => init));
    const cb = renderHook(() =>
      useTestStore.setWith([a, 2], [a, (x) => x * 3], [b, 3]),
    ).result.current;
    act(cb);
    const state = renderHook(() => useTestStore.get(storeO)).result.current;
    expect(state).toEqual({ a: 6, b: 3, c: 3 });
  });
});

describe("rw", () => {
  it("gets and sets a value consistently", () => {
    const init = { a: 1 };
    const storeO = optic<typeof init>();
    const p = storeO.prop("a");
    const useTestStore = withOptics(create(() => init));
    const { result } = renderHook(() => useTestStore.rw(p));
    expect(result.current[0]).toBe(1);
    act(() => {
      result.current[1](2);
    });
    expect(result.current[0]).toBe(2);
  });
  it("modifies a value", () => {
    const init = { a: 1 };
    const storeO = optic<typeof init>();
    const p = storeO.prop("a");
    const useTestStore = withOptics(create(() => init));
    const { result } = renderHook(() => useTestStore.rw(p));
    expect(result.current[0]).toBe(1);
    act(() => {
      result.current[1]((x) => x - 1);
    });
    expect(result.current[0]).toBe(0);
  });
  it("removes a value", () => {
    const init = { a: ["a", "b", "c"] };
    const storeO = optic<typeof init>();
    const focus = storeO.prop("a").at(1);
    const useTestStore = withOptics(create(() => init));
    const before = renderHook(() => useTestStore.get(storeO)).result.current;
    expect(before).toEqual({ a: ["a", "b", "c"] });
    const setter = renderHook(() => useTestStore.set(focus)).result.current;
    act(() => setter(undefined));
    const after = renderHook(() => useTestStore.get(storeO)).result.current;
    expect(after).toEqual({ a: ["a", "c"] });
    const value = renderHook(() => useTestStore.get(focus)).result.current;
    expect(value).toBe("c");
  });
});

describe("activate", () => {
  it("gets ands sets equality to a value", () => {
    const init = { a: 1, b: 2 };
    const storeO = optic<typeof init>();
    const p = storeO.prop("a");
    const useTestStore = withOptics(create(() => init));
    const { result } = renderHook(() => useTestStore.activate(p, 3));
    expect(result.current[0]).toBeFalsy();
    act(() => {
      result.current[1]();
    });
    expect(result.current[0]).toBeTruthy();
    const value = renderHook(() => useTestStore.get(storeO)).result.current;
    expect(value).toEqual({ a: 3, b: 2 });
  });
});
