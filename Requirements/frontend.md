# Frontend Requirements

## Functional Requirements

**FR1**: The frontend must implement an interactive board for users to run a simulation of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life). This board must be presented on screen as a matrix of squares that can be either black or white.

**FR2**: A board always has one square designated as its origin, located in the coordinates (0,0) in the matrix. When the board is first rendered on screen, it is displayed with its origin on the center.

**FR3**: When the frontend is loaded, an empty board is shown with all squares in white and simulation stopped. It's also shown above the board a message "Board not yet created" and a generation counter with a value of 1.

**FR4**: Above the board, the frontend must display a button with a label "New board". When users click this button, the frontend must clear all states on screen and present a new board, as if the page was just loaded.

**FR5**: Above the board, the frontend must display a button with a label "Save board". When users click this button, the frontend must send a request to the backend to save the board's current state.

**FR6**: When the current board was not yet created (which is identified by the absence of its unique identifier), the frontend must change the behavior of "Save board" button, sending a request to a different endpoint to create the board on backend's side. After receiving the backend's response, the frontend must replace the message "Board not yet created" with the board's unique identifier received in the backend's response.

**FR7**: Users must be able to change the board's state by clicking on squares and changing their values. Each click must switch a square's state between black and white.

**FR8**: Users must be able to zoom in and out of the board on screen.

**FR9**: Users must be able to drag te board's current view, showing a different region of the board.

**FR10**: The frontend must allow users to load a board from the backend, informing a board's unique identifier. When a board is successfully loaded, it's displayed centered in its origin and with simulation paused.

**FR11**: The frontend must have a control button to start the current board's simulation. When users click on it, the frontend must begin requesting to the backend the current board's next state.

**FR10**: If the frontend doesn't have a unique identifier for the current board, the simulation start button must be disabled.

**FR11**: The frontend must have a control button to stop the current board's simulation, interrupting the frontend's communication with the backend and only showing its current state. If the frontend receives a board's new state after the stop button is clicked, that new state must be discarded.

**FR12**: The frontend must have a control button to advance the board's simulation to the next generation. When users click this button, the frontend must request to the backend the current board's next state, update the shown board when receives it and stop.

**FR13**: The frontend must have a field and button that allow users to advance a set number of states in the current simulation. The input field must have a placeholder "Generations to skip", and the button's label must be "Skip".

## Technical Requirements

**TR1**: The frontend app must be built using Typescript as programming language, and React as SPA library. React-based frameworks like Next and Vite should not be used.

**TR2**: The frontend must use Axios to write all backend API communication.

**TR3**: The frontend must use Tailwind as the CSS framework to style all elements. No components library should be used.

**TR5**: All components must be tested via unit tests, using Jest and React Testing Library.

**TR6**: The frontend must use Webpack as bundling tool, with configurations appropriate for development and production environments.