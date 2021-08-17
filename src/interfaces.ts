export interface PlayerManch {
  id: number;
  name: string;
  inGame: boolean;
  burned: boolean;
  hasFinished: boolean;
  saved: boolean;
  homeNumber: number;
}

export interface Manchs<X> {
  inGame: X[];
  burned: X[];
  saved: X[];
  finished: X[];
  manchs: X[];
}

export interface Player {
  id: number;
  name: string;
  manchs: Manchs<PlayerManch>;
  inGame: boolean;
  deadline: number;
  color: "red" | "green" | "blue" | "black" | "#ccc";
  turn: boolean;
}

export interface manchScheme {
  name: string;
  count: number;
}

export interface BeadList {
  element: Element;
  index: number;
  hasActive: boolean;
  hasMain: boolean;
}

export interface InsideManchs extends Omit<BeadList, "hasActive" | "hasMain"> {
  playerId: number;
  playerIndex: number;
  position: DOMRect;
}

export namespace Handlers {
  export interface playerSign {
    e?: any;
    beadId: number;
    playerId: number;
    playerIndex: number;
    beadUid: number;
  }
  export interface _handleRunBead extends playerSign {
    (values: playerSign): unknown;
  }
}

export namespace _Rules {
  export interface manchObjDetail {
    manchIndex: number;
    beadUid: number;
    playerId: number;
  }
}
