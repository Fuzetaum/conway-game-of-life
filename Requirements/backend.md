# Backend Requirements

## Functional Requirements

**FR1**: The backend must be implemented as a web API for an application that allows users to simulate a board of [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life).

**FR2**: The backend must expose an endpoint that allows users to create a new game board, providing as input its initial state. The created board will have an initial generation value of 1.

**FR3**: The backend must allow users to overwrite a board's state, providing its unique identifier, the new desired state, and optionally a new generation value.

**FR4**: When creating a new board or saving a new state, the backend must persist such information into a database.

**FR5**: The backend must expose an endpoint that allows users to generate a given board's next state, and return such information.

**FR6**: The backend must expose an endpoint that allows users to generate a given board's state after a given number of generations, and return such information.

**FR7**: The backend must expose an endpoint that allows users to get a given board's final state, up to an informed maximum number of generations, and return such information.

**FR8**: If users request for a board's final state without informing the limit number of generations, the backend must return an error informing that such parameter is mandatory.

**FR9**: If the backend is not able to reach a board's final state after the given limit number of generations, the backend must return an error informing that the board doesn't reach its end state after such amount of generations.

**FR10**: The backend must consider that a board has reached its final state when the next state has the same exact values as the current one under analysis.

**FR11**: The backend must not automatically update database values when a board's future state is calculated.

## Technical Requirements

**TR1**: The backend must be built using C# as programming language, with .NET 7 as framework.

**TR2**: The backend must expose all endpoints without requiring from users to authenticate or identify.

**TR3**: The backend must implement all database interactions considering it's a PostgreSQL database.

**TR4**: The backend must implement its database interactions in an abstract manner, isolating all specific PostgreSQL code into separate files.

**TR5**: The backend must use Entity Framework as the database connection library.

**TR6**: All endpoint functionalities should be tested and covered by xUnit unit tests.

**TR7**: The backend must be a containerized application using Docker. It must also have a Docker Compose file that starts an instance alongside a containerized PostgreSQL instance.