export type ActionName =
  | 'move-left'
  | 'move-right'
  | 'move-up'
  | 'move-down'
  | 'light'
  | 'heavy'
  | 'special'
  | 'jump'
  | 'dodge'
  | 'interact';

export interface InputState {
  moveX: number;
  moveY: number;
  lightPressed: boolean;
  heavyPressed: boolean;
  specialPressed: boolean;
  jumpPressed: boolean;
  dodgePressed: boolean;
  interactPressed: boolean;
}

export const emptyInputState = (): InputState => ({
  moveX: 0,
  moveY: 0,
  lightPressed: false,
  heavyPressed: false,
  specialPressed: false,
  jumpPressed: false,
  dodgePressed: false,
  interactPressed: false,
});
