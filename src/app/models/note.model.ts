export interface Note {
  id: string;
  employeeId: string;
  content: string;
  createdAt: string;
}

export interface CreateNoteRequest {
  content: string;
}
