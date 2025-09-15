export interface Square {
  x: number;
  y: number;
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
  dimensions: {
    width: number;
    height: number;
  };
  livingCells: Square[];
}

export interface UpdateBoardRequest {
  livingCells: Square[];
}

export interface GenerationRequest {
  maxGenerations?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}