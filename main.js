"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// load the list of the most common passwords
let commonPasswords = [];
const loadCommonPasswords = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("./src/100000-most-common-passwords.json");
        commonPasswords = yield response.json();
    }
    catch (error) {
        console.error("Failed to load common passwords:", error);
    }
});
const init = () => __awaiter(void 0, void 0, void 0, function* () { return yield loadCommonPasswords(); });
init();
const UPPERCASE = [
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
const LOWERCASE = [
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
const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const SYMBOLS = [
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
const result = document.getElementById("result") || null;
const copiedSign = document.getElementById("copied-sign");
const copyButton = document.getElementById("copy-btn");
const slider = document.getElementById("slider");
const counter = document.getElementById("counter");
const uppercaseCheckbox = document.getElementById("uppercase");
const lowercaseCheckbox = document.getElementById("lowercase");
const numbersCheckbox = document.getElementById("numbers");
const symbolsCheckbox = document.getElementById("symbols");
const strength = document.getElementById("strength");
const ratingBars = document.querySelectorAll(".rating-bar");
const generateButton = document.getElementById("generate-btn");
if (!result)
    throw new Error("Password has not been generated");
// copy the result to the computer's clipboard
const copyPassword = (text) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield navigator.clipboard.writeText(text);
    }
    catch (error) {
        console.error("Failed to copy the password: ", error);
    }
});
copyButton.addEventListener("click", () => {
    if (result) {
        copyPassword(result.value);
        copiedSign.textContent = "COPIED";
    }
});
// general function to set the slider knob's position
const setSlider = (currentLength, maxLength) => {
    const percentage = (currentLength / maxLength) * 100;
    slider.style.setProperty("--track-fill", `linear-gradient(
                to right,
                var(--green) 0%,
                var(--green) ${percentage}%,
                var(--gray-200) ${percentage}%,
                var(--gray-200) 100%
              )`);
};
// set the slider knob's initial position
setSlider(Number(slider.value), Number(slider.max));
// update character length counter
slider.addEventListener("input", () => {
    counter.value = slider.value;
    setSlider(Number(slider.value), Number(slider.max));
});
const inclusionOptions = {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
};
let optionCount = 4;
const checkOption = (checkbox) => {
    const checkIcon = checkbox.querySelector(".check-icon");
    checkbox.style.setProperty("background-color", "var(--green)");
    checkbox.style.setProperty("border", "none");
    checkIcon.style.setProperty("display", "block");
};
const uncheckOption = (checkbox) => {
    const checkIcon = checkbox.querySelector(".check-icon");
    checkbox.style.setProperty("background-color", "var(--gray-800)");
    checkbox.style.setProperty("border", "2px solid var(--gray-200)");
    checkIcon.style.setProperty("display", "none");
};
const toggleOption = (optionName, checkbox) => {
    if (!inclusionOptions[optionName]) {
        inclusionOptions[optionName] = true;
        checkOption(checkbox);
        optionCount++;
    }
    else {
        if (optionCount === 1)
            return; // prevent deselecting the last option
        inclusionOptions[optionName] = false;
        uncheckOption(checkbox);
        optionCount--;
    }
};
const optionsMapping = [
    { optionName: "uppercase", checkbox: uppercaseCheckbox },
    { optionName: "lowercase", checkbox: lowercaseCheckbox },
    { optionName: "numbers", checkbox: numbersCheckbox },
    { optionName: "symbols", checkbox: symbolsCheckbox },
];
optionsMapping.forEach(({ optionName, checkbox }) => {
    checkbox.addEventListener("click", () => toggleOption(optionName, checkbox));
    checkbox.addEventListener("keydown", (e) => {
        if (e.key === "Enter")
            toggleOption(optionName, checkbox);
    });
});
// rate password strength
const rateStrength = (password) => {
    const passwordLength = password.length;
    let score = 0;
    let diversity = 0;
    let hasUppercase = false;
    let hasLowercase = false;
    let hasNumbers = false;
    let hasSymbols = false;
    password.forEach((char) => {
        if (UPPERCASE.includes(char))
            hasUppercase = true;
        if (LOWERCASE.includes(char))
            hasLowercase = true;
        if (NUMBERS.includes(char))
            hasNumbers = true;
        if (SYMBOLS.includes(char))
            hasSymbols = true;
    });
    [hasUppercase, hasLowercase, hasNumbers, hasSymbols].forEach((x) => {
        if (x)
            diversity++;
    });
    // predictability
    if (commonPasswords.includes(password.join("")))
        return ["VERY WEAK", 1];
    // word length
    if (passwordLength <= 3)
        score--;
    if (passwordLength <= 5)
        score--;
    if (passwordLength >= 8)
        score++;
    if (passwordLength >= 12)
        score++;
    if (passwordLength >= 16)
        score++;
    // variation
    if (diversity === 1 && !hasNumbers && !hasSymbols)
        score--;
    if (diversity === 1 && hasNumbers)
        score--;
    if (diversity === 1 && hasSymbols)
        score += 2;
    if (hasSymbols)
        score++;
    if (diversity >= 2)
        score++;
    if (diversity >= 3)
        score++;
    if (diversity === 4)
        score++;
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
const colorBars = (length, color, border) => {
    for (let i = 0; i < length; i++) {
        ratingBars[i].style.setProperty("background-color", `${color}`);
        ratingBars[i].style.setProperty("border", `${border}`);
    }
};
const updateIndicator = (rating) => {
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
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const generatePassword = (passwordLength) => {
    // set up characters to use
    let characters = [];
    if (inclusionOptions.uppercase)
        UPPERCASE.forEach((char) => characters.push(char));
    if (inclusionOptions.lowercase)
        LOWERCASE.forEach((char) => characters.push(char));
    if (inclusionOptions.numbers)
        NUMBERS.forEach((char) => characters.push(char));
    if (inclusionOptions.symbols)
        SYMBOLS.forEach((char) => characters.push(char));
    // generate a password
    let output = [];
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
generateButton.addEventListener("click", () => generatePassword(Number(counter.value)));
