import {
  BeadList,
  Handlers,
  Manchs,
  manchScheme,
  Player,
  PlayerManch,
} from "./interfaces";
import Rules from "./rules.js";
// import { manch, root } from "./define";
export const manch = document.querySelector("#manch") as HTMLDivElement;
export const root = document.getElementById("root") as HTMLDivElement;
let rules = new Rules();

const pick: manchScheme[] = [];
let players: Player[] = [];
let luckyRun: number = 1;
let beadReplace: BeadList[] = [];
let award: boolean = false;
let returnPick: boolean = false;
let beadPlayers: { playerId: number; list: BeadList[] }[] = [];
let lastManchPicked: Element;
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
export function GeneratePlayers(count: number = 4) {
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
    for (let b: number = 1; b <= plyrs[i]?.manchs?.manchs.length; b++) {
      const bead = document.createElement("div") as HTMLDivElement;
      bead.className = "bead";
      bead.style.background = plyrs[i].color;
      bead.setAttribute("data-bead-id", `${b}`);
      bead.addEventListener("click", (e: Event) =>
        runBeadToGame(e, b, plyrs[i]?.id, i, plyrs[i]?.manchs?.manchs[i].id)
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
  pushBeadInGame = false;
  pickedManch = true;
}

const handleSelectManch = (e: Event) => {
  console.log(rules.runned);
  if (rules.runned && !rules.award) return;
  if (lastManchPicked?.childElementCount === 6 && !pushBeadInGame) return;
  // if (rules.tryPickManch === 3) return;
  // console.log(rules.tryPickManch)
  rules.handleAwardAfter6(lastManchPicked);
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
    const hasNotInGameManchs = players[index].manchs.inGame.length === 0;
    const els = combineArray(elements);
    manch.style.boxShadow = "unset";
    manch.innerHTML = "";
    manch.appendChild(els[0]);
    lastManchPicked = els[0];
    // manch.appendChild(elements[5]);
    // lastManchPicked = elements[5];
    if (expire < Date.now()) {
      // console.log(returnPick);
      if (hasNotInGameManchs) {
        // if(award)
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
  if (!lastManchPicked) return;
  const index = players.findIndex((item) => item?.id === playerId);
  const activeUserIndex = players.findIndex((item) => item?.turn);
  if (+e.path[2].getAttribute("data-id") !== players[activeUserIndex].id)
    return;
  if (lastManchPicked.children.length !== 6 && !rules.award) return;
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
  console.log(players[index].manchs, beadUid, playerIndex, playerId);
  const manch = document.querySelector(".manch") as HTMLDivElement;
  manch.style.boxShadow = "unset";
  returnPick = true;
  rules.runned = false;
  rules.award = true;
  pushBeadInGame = true;
  luckyRun = 2;
  rules.tryPickManch += 1;
}

function handleRunBead<x extends Handlers.playerSign>({
  e,
  beadId,
  playerId,
  playerIndex,
  beadUid,
}: x) {
  const plyrIndex = players.findIndex((item) => item.id === playerId);
  if (!players[plyrIndex].turn) return;
  // if (rules.award) return;

  const count = lastManchPicked.childElementCount;
  const index = beadPlayers[playerIndex].list.findIndex(
    (item) => item.hasActive
  );
  const forward = beadPlayers[playerIndex].list[index + 1 + count].element;
  console.log(forward);
  beadPlayers[playerIndex].list = beadPlayers[playerIndex].list.map((item) => {
    item.hasActive = false;
    return item;
  });
  beadPlayers[playerIndex].list[index + count].hasActive = true;
  let xy: DOMRect = forward.getBoundingClientRect();
  const unitBeadInGame = document.querySelector(
    `.beadInGame[data-beadgameid="${beadId}:${playerId}:${beadUid}"]`
  ) as HTMLDivElement;
  console.log(unitBeadInGame);
  unitBeadInGame.style.left = `${xy.x! + 3}px`;
  unitBeadInGame.style.top = `${xy.y! + 3}px`;
  let result = rules.handleThrowEnemyBead(unitBeadInGame, players);
  // players[playerIndex].manchs.inGame = result;
  const manch = document.querySelector(".manch") as HTMLDivElement;
  manch.style.boxShadow = "unset";
  if (lastManchPicked.childElementCount === 6) {
    rules.runned = false;
    rules.award = true;
    rules.tryPickManch += 1;
  } else switchToNextPlayer();
}

window.onload = () => {
  GeneratePlayers();
  PickManch();
};

manch.addEventListener("click", handleSelectManch);
