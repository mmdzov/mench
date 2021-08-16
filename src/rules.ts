import { Player, _Rules } from "./interfaces";

class Rules {
  award: boolean = false;
  runned: boolean = false;
  tryPickManch: number = 0;
  manchPicked: Element | null = null;

  manchDetails(item: Element): _Rules.manchObjDetail {
    const detail: string[] = item.getAttribute("data-beadgameid")?.split(":")!;

    let details: _Rules.manchObjDetail = {
      playerId: +detail[1],
      beadUid: +detail.slice(-1)[0]!,
      manchIndex: +detail[0]!,
    };

    return details;
  }

  handleAwardAfter6(lastManchPicked: Element) {
    if (
      lastManchPicked &&
      lastManchPicked.childElementCount === 6 &&
      !this.runned
    ) {
      this.runned = true;
    }
    return;
  }
  detectBeadWithStyle(item: Element) {
    let loopItem: any = item.getAttribute("style")?.split("; ");
    loopItem?.shift();
    return loopItem?.join(";");
  }
  handleThrowEnemyBead(bead: Element, players: Player[]) {
    const beads = document.querySelectorAll(".beadBackground > div");
    beads.forEach((item) => {
      if (
        this.manchDetails(item).playerId !== this.manchDetails(bead).playerId
      ) {
        if (this.detectBeadWithStyle(item) === this.detectBeadWithStyle(bead)) {
          let detail = this.manchDetails(item);
          const playerIndex = players.findIndex(
            (item) => item.id === detail.playerId
          );
          let filteredTargetInGame = players[playerIndex].manchs.inGame.filter(
            (item) => item.id !== detail.beadUid
          );
          players[playerIndex].manchs.inGame = filteredTargetInGame;
          const domPlayers = document.querySelector(
            `#root > .player[data-id="${detail.playerId}"] > .beadContainer > .beadEnable[data-bead-id="${detail.manchIndex}"]`
          );
          domPlayers?.classList.remove("beadEnable");
          item.remove();
          return;
        }
      }
    });
    this.handleListeningBeads(players);
  }
  handleListeningBeads(players: Player[]) {
    players.forEach((item) => {
      if (item.manchs.inGame.length > 0) {
        item.deadline = 1;
      } else {
        item.deadline = 3;
      }
    });
  }
}

export default Rules;
