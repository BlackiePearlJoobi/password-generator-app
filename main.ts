// load the list of the most common passwords
let commonPasswords: string[] = [];
const loadCommonPasswords = async () => {
  try {
    const response = await fetch("./src/100000-most-common-passwords.json");
    commonPasswords = await response.json();
  } catch (error) {
    console.error("Failed to load common passwords:", error);
  }
};
const init = async () => await loadCommonPasswords();

init();

// characters
type characters = (string | number)[];
const UPPERCASE: characters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];
const LOWERCASE: characters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
const NUMBERS: characters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SYMBOLS: characters = [
  "~",
  "`",
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "_",
  "-",
  "+",
  "=",
  "{",
  "[",
  "}",
  "]",
  "|",
  "\\", // backslash (\)
  ";",
  ":",
  '"',
  "'",
  "<",
  ",",
  ">",
  ".",
  "?",
  "/",
];

// grab DOM elements
const result = (document.getElementById("result") as HTMLInputElement) || null;
const copiedSign = document.getElementById("copied-sign") as HTMLInputElement;
const copyButton = document.getElementById("copy-btn") as HTMLInputElement;
const slider = document.getElementById("slider") as HTMLInputElement;
const counter = document.getElementById("counter") as HTMLInputElement;
const uppercaseCheckbox = document.getElementById(
  "uppercase",
) as HTMLInputElement;
const lowercaseCheckbox = document.getElementById(
  "lowercase",
) as HTMLInputElement;
const numbersCheckbox = document.getElementById("numbers") as HTMLInputElement;
const symbolsCheckbox = document.getElementById("symbols") as HTMLInputElement;
const strength = document.getElementById("strength") as HTMLInputElement;
const ratingBars = document.querySelectorAll(
  ".rating-bar",
) as NodeListOf<HTMLDivElement>;
const generateButton = document.getElementById(
  "generate-btn",
) as HTMLInputElement;

if (!result) throw new Error("Password has not been generated");

// copy the result to the computer's clipboard
const copyPassword = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Failed to copy the password: ", error);
  }
};

copyButton.addEventListener("click", () => {
  if (result) {
    copyPassword(result.value);
    copiedSign.textContent = "COPIED";
  }
});

// general function to set the slider knob's position
const setSlider = (currentLength: number, maxLength: number): void => {
  const percentage = (currentLength / maxLength) * 100;

  slider.style.setProperty(
    "--track-fill",
    `linear-gradient(
                to right,
                var(--green) 0%,
                var(--green) ${percentage}%,
                var(--gray-200) ${percentage}%,
                var(--gray-200) 100%
              )`,
  );
};

// set the slider knob's initial position
setSlider(Number(slider.value), Number(slider.max));

// update character length counter
slider.addEventListener("input", () => {
  counter.value = slider.value;
  setSlider(Number(slider.value), Number(slider.max));
});

// toggle inclusion options
type OptionName = "uppercase" | "lowercase" | "numbers" | "symbols";

const inclusionOptions: Record<OptionName, boolean> = {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

let optionCount = 4;

const checkOption = (checkbox: HTMLElement): void => {
  const checkIcon = checkbox.querySelector(".check-icon") as HTMLElement;
  checkbox.style.setProperty("background-color", "var(--green)");
  checkbox.style.setProperty("border", "none");
  checkIcon.style.setProperty("display", "block");
};

const uncheckOption = (checkbox: HTMLElement): void => {
  const checkIcon = checkbox.querySelector(".check-icon") as HTMLElement;
  checkbox.style.setProperty("background-color", "var(--gray-800)");
  checkbox.style.setProperty("border", "2px solid var(--gray-200)");
  checkIcon.style.setProperty("display", "none");
};

const toggleOption = (optionName: OptionName, checkbox: HTMLElement) => {
  if (!inclusionOptions[optionName]) {
    inclusionOptions[optionName] = true;
    checkOption(checkbox);
    optionCount++;
  } else {
    if (optionCount === 1) return; // prevent deselecting the last option
    inclusionOptions[optionName] = false;
    uncheckOption(checkbox);
    optionCount--;
  }
};

const optionsMapping: {
  optionName: OptionName;
  checkbox: HTMLInputElement;
}[] = [
  { optionName: "uppercase", checkbox: uppercaseCheckbox },
  { optionName: "lowercase", checkbox: lowercaseCheckbox },
  { optionName: "numbers", checkbox: numbersCheckbox },
  { optionName: "symbols", checkbox: symbolsCheckbox },
];

optionsMapping.forEach(({ optionName, checkbox }) => {
  checkbox.addEventListener("click", () => toggleOption(optionName, checkbox));
  checkbox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") toggleOption(optionName, checkbox);
  });
});

// rate password strength
const rateStrength = (password: (string | number)[]): [string, number] => {
  const passwordLength = password.length;
  let score = 0;
  let diversity = 0;
  let hasUppercase = false;
  let hasLowercase = false;
  let hasNumbers = false;
  let hasSymbols = false;

  password.forEach((char) => {
    if (UPPERCASE.includes(char)) hasUppercase = true;
    if (LOWERCASE.includes(char)) hasLowercase = true;
    if (NUMBERS.includes(char)) hasNumbers = true;
    if (SYMBOLS.includes(char)) hasSymbols = true;
  });

  [hasUppercase, hasLowercase, hasNumbers, hasSymbols].forEach((x) => {
    if (x) diversity++;
  });

  // predictability
  if (commonPasswords.includes(password.join(""))) return ["VERY WEAK", 1];

  // word length
  if (passwordLength <= 3) score--;
  if (passwordLength <= 5) score--;
  if (passwordLength >= 8) score++;
  if (passwordLength >= 12) score++;
  if (passwordLength >= 16) score++;

  // variation
  if (diversity === 1 && !hasNumbers && !hasSymbols) score--;
  if (diversity === 1 && hasNumbers) score--;
  if (diversity === 1 && hasSymbols) score += 2;
  if (hasSymbols) score++;
  if (diversity >= 2) score++;
  if (diversity >= 3) score++;
  if (diversity === 4) score++;

  return score >= 5
    ? ["VERY STRONG", 5]
    : score >= 3
      ? ["STRONG", 4]
      : score >= 2
        ? ["MEDIUM", 3]
        : score >= 1
          ? ["WEAK", 2]
          : ["VERY WEAK", 1];
};

// update the indicators
const colorBars = (length: number, color: string, border: string): void => {
  for (let i = 0; i < length; i++) {
    ratingBars[i].style.setProperty("background-color", `${color}`);
    ratingBars[i].style.setProperty("border", `${border}`);
  }
};

const updateIndicator = (rating: number): void => {
  switch (rating) {
    case 0: // reset the style
      colorBars(5, "var(--gray-850)", "2px solid var(--gray-200)");
      break;
    case 1: // "VERY WEAK"
      colorBars(rating, "var(--red)", "none");
      break;
    case 2: // "WEAK"
      colorBars(rating, "var(--orange)", "none");
      break;
    case 3: // "MEDIUM"
      colorBars(rating, "var(--yellow)", "none");
      break;
    case 4: // "STRONG"
      colorBars(rating, "var(--green)", "none");
      break;
    case 5: // "VERY STRONG"
      colorBars(rating, "var(--dark-green)", "none");
      break;
  }
};

// generate a password
const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generatePassword = (passwordLength: number) => {
  // set up characters to use
  let characters: (string | number)[] = [];

  if (inclusionOptions.uppercase)
    UPPERCASE.forEach((char) => characters.push(char));
  if (inclusionOptions.lowercase)
    LOWERCASE.forEach((char) => characters.push(char));
  if (inclusionOptions.numbers)
    NUMBERS.forEach((char) => characters.push(char));
  if (inclusionOptions.symbols)
    SYMBOLS.forEach((char) => characters.push(char));

  // generate a password
  let output: (string | number)[] = [];

  do {
    const index = getRandomInt(0, characters.length - 1);
    output.push(characters[index]);
    passwordLength--;
  } while (passwordLength > 0);

  // show the result
  result.value = output.join("");
  result.style.color = `var(--gray-200)`;
  copiedSign.textContent = "";

  // rate the strength
  updateIndicator(0); // reset the indicator style
  const [strengthSign, rating] = rateStrength(output);
  strength.textContent = strengthSign;
  updateIndicator(rating);
};

generateButton.addEventListener("click", () =>
  generatePassword(Number(counter.value)),
);
