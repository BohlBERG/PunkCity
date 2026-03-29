import { emptyInputState, type InputState } from '../../game/input/actions';
import { createInitialGameState, type GameState } from '../../game/simulation/state';
import { updateWorld } from '../../game/simulation/systems/updateWorld';

export class SceneBridge {
  private state: GameState;

  constructor() {
    this.state = createInitialGameState();
  }

  public getState(): GameState {
    return this.state;
  }

  public restart(): GameState {
    this.state = createInitialGameState();
    return this.state;
  }

  public step(partialInput: Partial<InputState>, deltaMs: number): GameState {
    const input = {
      ...emptyInputState(),
      ...partialInput,
    };

    updateWorld(this.state, input, deltaMs / 1000);
    return this.state;
  }
}
