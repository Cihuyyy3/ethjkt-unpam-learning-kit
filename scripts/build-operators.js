const fs = require("fs");
const path = require("path");

const EN_SOURCE_FILE = path.join(__dirname, "..", "character_table_en.json");
const CN_SOURCE_FILE = path.join(__dirname, "..", "character_table.json");
const SOURCE_FILE = fs.existsSync(EN_SOURCE_FILE) ? EN_SOURCE_FILE : CN_SOURCE_FILE;
const OUTPUT_FILE = path.join(__dirname, "..", "operators.json");
const BROWSER_OUTPUT_FILE = path.join(__dirname, "..", "operators-data.js");
const ART_BASE_URL =
  "https://cdn.jsdelivr.net/gh/Aceship/Arknight-Images@master/characters";
const AVATAR_BASE_URL =
  "https://cdn.jsdelivr.net/gh/Aceship/Arknight-Images@master/avatars";

const ROLE_NAMES = {
  PIONEER: "Vanguard",
  WARRIOR: "Guard",
  TANK: "Defender",
  SNIPER: "Sniper",
  CASTER: "Caster",
  MEDIC: "Medic",
  SUPPORT: "Supporter",
  SPECIAL: "Specialist",
};

const RARITY_TO_STARS = {
  TIER_3: 3,
  TIER_4: 4,
  TIER_5: 5,
  TIER_6: 6,
};

const characterTable = JSON.parse(fs.readFileSync(SOURCE_FILE, "utf8"));

const operators = Object.entries(characterTable)
  .filter(([id, character]) => {
    return (
      id.startsWith("char_") &&
      RARITY_TO_STARS[character.rarity] &&
      character.isNotObtainable === false
    );
  })
  .map(([id, character]) => ({
    id,
    name: character.name,
    rarity: RARITY_TO_STARS[character.rarity],
    role: ROLE_NAMES[character.profession] ?? character.profession,
    roleId: character.profession,
    subRoleId: character.subProfessionId,
    artUrl: `${ART_BASE_URL}/${id}_1.png`,
    avatarUrl: `${AVATAR_BASE_URL}/${id}.png`,
  }))
  .sort((a, b) => {
    if (b.rarity !== a.rarity) {
      return b.rarity - a.rarity;
    }

    return a.id.localeCompare(b.id);
  });

fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(operators, null, 2)}\n`);
fs.writeFileSync(
  BROWSER_OUTPUT_FILE,
  `window.OPERATORS = ${JSON.stringify(operators, null, 2)};\n`,
);

console.log(`Generated ${operators.length} operators in ${path.basename(OUTPUT_FILE)}`);
console.log(`Generated ${path.basename(BROWSER_OUTPUT_FILE)}`);
console.log(`Source: ${path.basename(SOURCE_FILE)}`);
