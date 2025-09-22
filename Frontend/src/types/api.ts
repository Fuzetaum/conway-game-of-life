export interface Square {
  row: number;
  column: number;
}

export interface Board {
  id: string;
  generation: number;
  dimensions: {
    width: number;
    height: number;
  };
  livingCells: Square[];
}

export interface CreateBoardRequest {
  LivingCells: Square[];
}

export interface UpdateBoardRequest {
  LivingCells: Square[];  // Fixed to match backend casing
}

export interface GenerationRequest {
  maxGenerations?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}