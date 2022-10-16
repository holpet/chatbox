const searchUtils = require("../searchUtils");

describe("checks functionality of searchUtils", () => {
  test("strips special characters and swaps them with 'space'", () => {
    const stripped_word = searchUtils.stripSpecialChars(
      "house*(%@#**/ not*now"
    );
    expect(stripped_word).toEqual("house  not now");
  });
});
