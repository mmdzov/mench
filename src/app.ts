import {
  BeadList,
  Handlers,
  InsideManchs,
  Manchs,
  manchScheme,
  Player,
  PlayerManch,
} from "./interfaces";
import Rules from "./rules.js";
const manch = document.querySelector("#manch") as HTMLDivElement;
const root = document.getElementById("root") as HTMLDivElement;
let rules = new Rules();

const pick: manchScheme[] = [];
let players: Player[] = [];
let luckyRun: number = 1;
let beadReplace: BeadList[] = [];
let insideManchList: InsideManchs[] = [];
let award: boolean = false;
let returnPick: boolean = false;
let beadPlayers: { playerId: number; list: BeadList[] }[] = [];
let lastManchPicked: Element;
let runned: boolean | null = null;
let luckyCount: number = 3;
let pickedManch: boolean = false;
let pushBeadInGame: boolean = false;
let playerNames: string[] = [
  "ali",
  "hesam",
  "mamad",
  "reza",
  "hassan",
  "amir",
  "abbas",
  "pooyan",
  "hamid",
  "majid",
  "roya",
  "shirin",
  "roberto",
];
function GeneratePlayers(count: number = 4) {
  let plyrs: Player[] = [];
  for (let i: number = 1; i <= count; i++) {
    const manchs: PlayerManch[] = [];
    for (let b: number = 1; b <= 4; b++) {
      let manchItem: PlayerManch = {
        burned: false,
        homeNumber: -1,
        id: ~~(Math.random() * 999999),
        inGame: true,
        name: `${b}`,
        saved: false,
        hasFinished: false,
      };
      manchs.push(manchItem);
    }
    let playerManchs: Manchs<PlayerManch> = {
      burned: [],
      inGame: [],
      saved: [],
      finished: [],
      manchs: manchs,
    };
    const unitPlayer: Player = {
      color:
        i === 1
          ? "red"
          : i === 2
          ? "green"
          : i === 3
          ? "blue"
          : i === 4
          ? "black"
          : "#ccc",
      deadline: 3,
      id: ~~(Math.random() * 99999),
      inGame: true,
      manchs: playerManchs,
      turn: i === 1 ? true : false,
      name: playerNames[~~(Math.random() * playerNames.length)],
    };
    players.push(unitPlayer);
    plyrs.push(unitPlayer);
  }
  for (let i: number = 0; i <= players.length - 1; i++) {
    let beadReplace: BeadList[] = [];
    let beadList: BeadList[] = [];
    const domPlayer = document.createElement("div") as HTMLDivElement;
    const playerProfile = document.createElement("div") as HTMLDivElement;
    const playerImg = document.createElement("img") as HTMLImageElement;
    const playerName = document.createElement("div") as HTMLDivElement;
    const beadContainer = document.createElement("div") as HTMLDivElement;
    domPlayer.className = "player";
    playerProfile.className = "profile";
    playerImg.src = "./assets/Images/profile.jpg";
    playerName.className = "username";
    playerName.innerHTML = plyrs[i]?.name;
    beadContainer.className = "beadContainer";
    if (plyrs[i]?.turn) {
      playerImg.className = "turn";
    }
    for (let b: number = 0; b < plyrs[i]?.manchs?.manchs.length; b++) {
      const bead = document.createElement("div") as HTMLDivElement;
      bead.className = "bead";
      bead.style.background = plyrs[i].color;
      bead.setAttribute("data-bead-id", `${b}`);
      bead.setAttribute(
        "data-uinqueId",
        `${plyrs[i]?.id}:${plyrs[i]?.manchs?.manchs[b].id}`
      );
      bead.addEventListener("click", (e: Event) =>
        runBeadToGame(e, b, plyrs[i]?.id, i, plyrs[i]?.manchs?.manchs[b].id)
      );
      beadContainer.appendChild(bead);
    }
    domPlayer.appendChild(playerProfile);
    domPlayer.appendChild(beadContainer);
    domPlayer.setAttribute("data-id", `${plyrs[i]?.id}`);
    playerProfile.appendChild(playerImg);
    playerProfile.appendChild(playerName);
    root?.appendChild(domPlayer);

    const circles = document.querySelectorAll(`#root svg circle`);
    circles.forEach((item, index) => {
      if (item.getAttribute("data-home")?.split(":").length! !== 3) {
        item.setAttribute("data-index", `${index}`);
      }
    });
    // beadList.splice(0, 1);
    circles.forEach((item, index) => {
      if (
        item.getAttribute("data-home")?.split(":").length! !== 3 &&
        index !== 0
      ) {
        beadList.push({
          element: item,
          index: index,
          hasActive: false,
          hasMain:
            item.getAttribute("data-home") === (i + 1).toString()
              ? true
              : false,
        });
      }
    });
    const activeIndex = beadList.findIndex((item) => item.hasMain);
    const next7Steps: BeadList[] = beadList.slice(
      activeIndex,
      activeIndex + 100
    );
    beadReplace.push(...next7Steps, ...beadList.slice(0, activeIndex));
    beadPlayers.push({
      playerId: plyrs[i]?.id,
      list: [...next7Steps, ...beadList.slice(0, activeIndex)],
    });
  }
}

function PickManch() {
  let manchName: string;
  let item: manchScheme;
  for (let i: number = 1; i <= 6; i++) {
    let namePicker = "";
    if (i === 1) namePicker = "one";
    else if (i === 2) namePicker = "two";
    else if (i === 3) namePicker = "three";
    else if (i === 4) namePicker = "four";
    else if (i === 5) namePicker = "five";
    else if (i === 6) namePicker = "six";
    pick.push({ name: namePicker, count: i });
  }
}

function generatInsideManchs() {
  const allManchs = document.querySelectorAll("#root > svg > circle");
  allManchs.forEach((item) => {
    let manchData: string[] | undefined = item
      .getAttribute("data-home")
      ?.split(":");
    if (manchData && manchData?.length > 1) {
      let playerIndex: number = +manchData[0];
      let index: number = +manchData[1];
      let position: DOMRect = item.getBoundingClientRect();
      let playerId: number = players[playerIndex].id;
      let element: Element = item;
      insideManchList?.push({
        element,
        position,
        playerIndex,
        playerId,
        index,
      });
    }
  });
}

const combineArray = (arr: Element[]) => {
  let newData = Array(arr.length);

  for (let i = 0; i < arr.length * 100; i++) {
    const randomNumber = ~~(Math.random() * arr.length);
    const currentHasExist = newData.some((item) => item === arr[randomNumber]);
    if (!currentHasExist) {
      newData[i] = arr[randomNumber];
    }
  }
  return newData.filter((item) => item);
};

function switchToNextPlayer() {
  let index = players.findIndex((item) => item.turn);
  const player = document.getElementsByClassName("player");
  if (index === players.length - 1) {
    index = 0;
    players[0].turn = true;
  } else index++;

  players = players.map((item) => {
    item.turn = false;
    return item;
  });
  players[index].turn = true;
  for (let x in player) {
    const playerId = player[index].getAttribute("data-id");
    if (+playerId! === players[index]?.id) {
      document
        .querySelectorAll(".player > div:first-of-type img")
        .forEach((item) => {
          item.classList.remove("turn");
        });
      const playerDom = document.querySelector(
        `.player[data-id="${playerId}"] > div:first-of-type img`
      ) as HTMLImageElement;
      playerDom.className = "turn";
      luckyRun = 1;
      break;
    }
  }
  runned = null;
  pushBeadInGame = false;
  pickedManch = true;
}

const handleSelectManch = (e: Event) => {
  if (rules.runned && !rules.award) return; // !test
  if (lastManchPicked?.childElementCount === 6 && !pushBeadInGame) return; //!test
  if (runned === false) return; //!test
  // if (rules.tryPickManch === 3) return;
  rules.handleAwardAfter6(lastManchPicked); //!test
  PickManch();
  pickedManch = true;
  let elements: Element[] = [];
  for (let i: number = 0; i < pick.length; i++) {
    const el = document.createElement("div") as HTMLDivElement;
    el.className = pick[i]?.name;
    for (let b: number = 0; b < pick[i].count; b++) {
      const dot = document.createElement("span") as HTMLSpanElement;
      dot.setAttribute("data-count", `${pick[i].count}`);
      el.appendChild(dot);
    }
    elements.push(el);
  }
  const expire: number = Date.now() + 0.5 * 1000;
  let interval = setInterval(() => {
    let index = players.findIndex((item) => item.turn);
    const playerDeadline = players[index].deadline;
    const els = combineArray(elements); //! test
    manch.style.boxShadow = "unset";
    manch.innerHTML = "";
    manch.appendChild(els[0]); //!test
    lastManchPicked = els[0]; //! test
    // manch.appendChild(elements[5]);
    // lastManchPicked = elements[5];
    if (expire < Date.now()) {
      if (playerDeadline === 3) {
        if (lastManchPicked.children.length === 6) {
          manch.style.boxShadow = "0 2px 10px -1px #673ab7";
        }
        if (
          luckyRun >= luckyCount &&
          !award &&
          lastManchPicked.children.length !== 6
        ) {
          switchToNextPlayer();
          clearInterval(interval);
          return;
        }
        luckyRun += 1;
        rules.tryPickManch += 1;
      } else {
        runned = false;
      }
      clearInterval(interval);
      return;
    }
  }, 50);
};

function runBeadToGame(
  e: any,
  beadId: number,
  playerId: number,
  playerIndex: number,
  beadUid: number
) {
  let preventToPlayGame: boolean = false;
  if (lastManchPicked?.childElementCount !== 6) return; //! test
  const currentManch = document.querySelectorAll(`#root > svg > circle`);
  currentManch.forEach((item) => {
    if (+item.getAttribute("data-home")! === playerIndex + 1) {
      const beads = document.querySelectorAll(".beadBackground > div");
      beads.forEach((beadItem) => {
        const bdId = beadItem.getAttribute("data-beadgameid")?.split(":");
        if (bdId && +bdId[1] === playerId) {
          const beadItemPos = rules
            .detectBeadWithStyle(beadItem)
            .split(/[^0-9\.]/g)
            .filter((filterItem: string) => filterItem && filterItem !== "p");
          let circlePos = item?.getBoundingClientRect();
          if (
            +Number(beadItemPos[0]).toFixed(2) ===
              +Number(circlePos.x + 3).toFixed(2) &&
            +Number(beadItemPos[1]).toFixed(2) ===
              +Number(circlePos.y + 3).toFixed(2)
          ) {
            preventToPlayGame = true;
          }
        }
      });
    }
  });
  if (runned) return; //! test
  if (preventToPlayGame) return; //! test
  const index = players.findIndex((item) => item?.id === playerId);
  const activeUserIndex = players.findIndex((item) => item?.turn); //! test
  if (+e.path[2].getAttribute("data-id") !== players[activeUserIndex].id)
    return; //! test
  if (lastManchPicked.children.length !== 6 && !rules.award) return; //! test
  const sit = document.querySelector(
    `#root svg [data-home="${playerIndex + 1}"]`
  );
  const x = sit?.getBoundingClientRect().x;
  const y = sit?.getBoundingClientRect().y;
  const beadUnit = document.querySelector(
    `.player[data-id="${playerId}"] .beadContainer .bead[data-bead-id="${beadId}"]`
  );
  beadUnit!.classList.add("beadEnable");
  const bead = document.createElement("div");
  bead.className = "beadInGame";
  bead.style.background = players[index].color;
  bead.style.left = `${x! + 3}px`;
  bead.style.top = `${y! + 3}px`;
  bead.setAttribute("data-beadGameId", `${beadId}:${playerId}:${beadUid}`);
  bead.addEventListener("click", (e: Event) =>
    handleRunBead({ e, playerIndex, beadId, playerId, beadUid })
  );
  const background = document.getElementById(
    "beadBackground"
  ) as HTMLDivElement;
  background.appendChild(bead);
  let beadIndex = players[index].manchs.manchs.findIndex(
    (item) => item.id === beadUid
  );
  players[index].manchs.inGame.push(players[index].manchs.manchs[beadIndex]);
  rules.handleThrowEnemyBead(bead, players);
  const manch = document.querySelector(".manch") as HTMLDivElement;
  manch.style.boxShadow = "unset";
  returnPick = true;
  rules.runned = false;
  rules.award = true;
  pushBeadInGame = true;
  runned = true;
  luckyRun = 2;
  rules.tryPickManch += 1;
}

function handleRunBead<x extends Handlers.playerSign>({
  e,
  beadId: beadIndex,
  playerId,
  playerIndex,
  beadUid,
}: x) {
  const plyrIndex = players.findIndex((item) => item.id === playerId);
  if (!players[plyrIndex].turn) return; //!  test
  if (runned) return; //! test
  const count = lastManchPicked.childElementCount;
  const currentBeadIndex = players[plyrIndex].manchs.inGame.findIndex(
    (item) => item.id === beadUid
  );
  players[plyrIndex].manchs.inGame[currentBeadIndex].homeNumber += count;
  const forward =
    beadPlayers[plyrIndex].list[
      players[plyrIndex].manchs.inGame[currentBeadIndex].homeNumber + 1
    ];
  const unitBeadInGame = document.querySelector(
    `.beadInGame[data-beadgameid="${beadIndex}:${playerId}:${beadUid}"]`
  ) as HTMLDivElement;
  try {
    let xy: DOMRect = forward?.element?.getBoundingClientRect();
    unitBeadInGame.style.left = `${xy.x! + 3}px`;
    unitBeadInGame.style.top = `${xy.y! + 3}px`;
    rules.handleThrowEnemyBead(unitBeadInGame, players);
    console.log(players);

    const manch = document.querySelector(".manch") as HTMLDivElement;
    manch.style.boxShadow = "unset";
    beadPlayers[plyrIndex].list.forEach((item) => (item.hasActive = false));
    beadPlayers[plyrIndex].list[
      players[plyrIndex].manchs.inGame[currentBeadIndex].homeNumber + 1
    ].hasActive = true;
    if (lastManchPicked.childElementCount === 6) {
      rules.runned = false;
      rules.award = true;
      rules.tryPickManch += 1;
      runned = true;
    } else {
      switchToNextPlayer();
    }
  } catch (error) {
    if (!forward) {
      const beadsIndex = beadPlayers.findIndex(
        (item) => item.playerId === playerId
      );
      const beadList = beadPlayers[beadsIndex].list;
      let mainIndex = beadList.findIndex((item) => item.hasMain);
      const beadActiveIndex = beadList.findIndex((item) => item.hasActive);
      let beadListAfterActiveItem = beadList.slice(
        -(beadList[mainIndex].index - beadList[beadActiveIndex].index)
      );
      const insidePlayerManchs = insideManchList.filter(
        (item) => item.playerId === playerId
      );
      insidePlayerManchs.forEach((item) => {
        if (
          item.index ===
          lastManchPicked.childElementCount -
            (beadListAfterActiveItem.length - 1)
        ) {
          unitBeadInGame.style.left = `${item.position.x! + 3}px`;
          unitBeadInGame.style.top = `${item.position.y! + 3}px`;
        }
        players[playerIndex].manchs.finished.push(
          players[playerIndex].manchs.manchs[currentBeadIndex]
        );
      });
    }
  }
}

window.onload = () => {
  GeneratePlayers();
  PickManch();
  generatInsideManchs();
  console.log(insideManchList);
};

manch.addEventListener("click", handleSelectManch);
