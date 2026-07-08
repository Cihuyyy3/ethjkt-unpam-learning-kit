const https = require("https");
const operators = require("../operators.json");

const SAMPLE_IDS = [
  "char_003_kalts",
  "char_103_angel",
  "char_002_amiya",
  "char_123_fang",
  "char_1013_chen2",
  "char_2014_nian",
  "char_290_vigna",
  "char_278_orchid",
];

const cdnAgent = new https.Agent({
  rejectUnauthorized: false,
});

function requestHead(url) {
  return new Promise((resolve) => {
    const request = https.request(
      url,
      {
        agent: cdnAgent,
        headers: { "User-Agent": "codex-local" },
        method: "HEAD",
      },
      (response) => {
      response.resume();
      resolve(response.statusCode);
      },
    );

    request.on("error", () => resolve(0));
    request.setTimeout(15000, () => {
      request.destroy();
      resolve(0);
    });
    request.end();
  });
}

async function checkOperatorArt(operator) {
  const artStatus = await requestHead(operator.artUrl);

  if (artStatus === 200) {
    return { operator, status: "ok", artStatus };
  }

  const avatarStatus = await requestHead(operator.avatarUrl);
  return { operator, status: avatarStatus === 200 ? "avatar-fallback" : "missing", artStatus, avatarStatus };
}

async function main() {
  const samples = SAMPLE_IDS.map((id) => operators.find((operator) => operator.id === id))
    .filter(Boolean);
  const results = [];

  for (const operator of samples) {
    results.push(await checkOperatorArt(operator));
  }

  for (const result of results) {
    const detail =
      result.status === "ok"
        ? `art ${result.artStatus}`
        : `art ${result.artStatus}, avatar ${result.avatarStatus}`;
    console.log(`${result.status.toUpperCase()} ${result.operator.id} ${result.operator.name} (${detail})`);
  }

  const failures = results.filter((result) => result.status === "missing");

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
