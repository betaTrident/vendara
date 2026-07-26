export const hasDirtyForm = () => {
  if (typeof document === "undefined") {
    return false;
  }

  return Boolean(
    document.querySelector("form[data-dirty='true'], form[data-vendara-dirty='true']"),
  );
};
