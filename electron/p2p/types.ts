export enum Role {
  WORKER = 'worker',
  COORDINATOR = 'coordinator',
  CANDIDATE = 'candidate'
}

export type NodeState = {
  role: Role;
  term: number; // For election epoch
  leaderId: string | null;
};
