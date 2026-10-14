import assert from "node:assert/strict";
import test from "node:test";
import { createElement, useState } from "react";
import TestRenderer, { act } from "react-test-renderer";
import SignupDropdown from "./SignupDropdown";

test("mouse selection survives Safari focus loss; keyboard and outside blur still work", async (t) => {
  const globals = globalThis as typeof globalThis & {
    IS_REACT_ACT_ENVIRONMENT?: boolean;
  };
  const originalDocument = Object.getOwnPropertyDescriptor(globals, "document");
  const originalAct = globals.IS_REACT_ACT_ENVIRONMENT;
  Object.defineProperty(globals, "document", {
    configurable: true,
    value: { addEventListener() {}, removeEventListener() {} },
  });
  globals.IS_REACT_ACT_ENVIRONMENT = true;
  let renderer!: TestRenderer.ReactTestRenderer;
  t.after(async () => {
    if (renderer) await act(async () => renderer.unmount());
    if (originalDocument)
      Object.defineProperty(globals, "document", originalDocument);
    else Reflect.deleteProperty(globals, "document");
    globals.IS_REACT_ACT_ENVIRONMENT = originalAct;
  });

  function Form() {
    const [value, onChange] = useState("");
    return createElement(SignupDropdown, {
      id: "educationGroup",
      label: "Education",
      placeholder: "Choose",
      value,
      onChange,
      options: [
        { value: "lower", label: "Lower secondary" },
        { value: "upper", label: "Upper secondary" },
      ],
    });
  }
  await act(async () => {
    renderer = TestRenderer.create(createElement(Form));
  });
  const root = () => renderer.root.findByType(SignupDropdown).findByType("div");
  const trigger = () =>
    renderer.root
      .findAllByType("button")
      .find((button) => button.props.id === "educationGroup")!;
  const outsideBlur = {
    currentTarget: { contains: () => false },
    relatedTarget: null,
  };

  await act(async () => trigger().props.onClick());
  const option = renderer.root.findAllByProps({ role: "option" })[1];
  let prevented = false;
  await act(async () => {
    option.props.onMouseDown({
      button: 0,
      preventDefault: () => (prevented = true),
    });
    // Model Safari's default blur only when mousedown was not cancelled.
    if (!prevented) root().props.onBlur(outsideBlur);
  });
  assert.equal(prevented, true);
  assert.equal(trigger().props["aria-expanded"], true);
  await act(async () => option.props.onClick());
  assert.equal(
    trigger().findByType("span").children.join(""),
    "Upper secondary",
  );
  assert.equal(trigger().props["aria-expanded"], false);

  await act(async () =>
    root().props.onKeyDown({ key: "ArrowDown", preventDefault() {} }),
  );
  await act(async () =>
    renderer.root.findAllByProps({ role: "option" })[0].props.onClick(),
  );
  assert.equal(
    trigger().findByType("span").children.join(""),
    "Lower secondary",
  );
  await act(async () => trigger().props.onClick());
  await act(async () => root().props.onKeyDown({ key: "Escape" }));
  assert.equal(trigger().props["aria-expanded"], false);
  await act(async () => trigger().props.onClick());
  await act(async () => root().props.onBlur(outsideBlur));
  assert.equal(trigger().props["aria-expanded"], false);
});
