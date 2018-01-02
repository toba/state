import { is } from "@toba/utility";

test("identifies undefined variables", () => {
   //expect(is.value(u)).toBe(false);
   expect(is.value(null)).toBe(false);
   expect(is.value("whatever")).toBe(true);
});
