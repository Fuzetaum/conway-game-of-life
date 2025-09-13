# Conway's Game of Life

This is a monorepo that contains both backend and frontend to run Conway's Game of Life simulations. Both applications were developed using VS Code as IDE, with Gemini Code Assist extension as AI assisting agent.

# Folder structure

**Backend**: contains the backend's source code.

**Frontend**:  contains the frontend's source code.

**Requirements**: contains Markdown files that describe all desired requirements for each application. These were created to serve as initial syntax for Gemini Code Assist to be able to understand what path development should take, increasing its efficiency.

In the root folder, there are also all Docker files to run the backend application in a container, and a Docker Compose file to allow running it alongside a database instance.

# Technical overview

## Backend

The backend was built as an API application using .NET 7. To add data persistence, it was chosen PostgreSQL as database and Entity Framework as the integration library, but structured in a way that it's simple to switch between different database engines if needed. To implement unit tests, it was opted to use xUnit as the testing library.

## Frontend

The frontend was built as a Single-Page Application using vanilla React. Since this application already has some complex behaviors to implement, especially the infinite property of boards and interactions with it, it was opted for a leaner technical setup to help have a better understanding of all components behaviors in case bugs were found.

Axios was chosen to implement all backend communication due to its fluent, developer-friendly API, as well as being Promise-oriented. Tailwind was chosen as the CSS framework (and so opted to not use any components library) due to its wide adoption and wide amount of styles that allow to quickly write elegant interfaces. Webpack was chosen as bundling tool due to its robustness and ability to quickly define different configurations between development and production routines. Finally, to implement unit tests it was chosen to use Jest due to its native React support, and React Testing Library due to its ability to simulate user interaction events with the screen.

# Development approach

Given the short time suggested to develop each one of the system's component, it was opted to use an AI assistant agent tool to speed up the process, as well as suggest patterns and paths to follow when implementing some of the complex behavior involved in this project. Given that the AI assistant has a high probability of hallucinating, development was done using the following approach:

* First, all requirements were written in a Markdown file, simplifying how the AI assistant acquires all context for the project. It's important to emphasize that requirements might not contain all needed information for the AI to be as accurate as possible on this step;

* Next, the prompts were submitted to the AI assistant in an order that it firsts only reads the requirements files, and later develop the entire component's codebase. This was done separately for backend and frontend.

* After letting the AI write the entire codebase, a full code review was performed to ensure it followed best practices, refactoring code whenever necessary. This was done for all generated unit tests as well.

* After the code review, all unit tests were reviewed to understand what they were testing exactly. With this knowledge, tests could be executed to find what scenarios would fail in order to start identifying code logic flaws. At this step, it was expected that the AI's code was flawed and contained bugs to be fixed.

* With all generated unit tests passing, a coverage report was generated for each application to understand what was the AI tests actual coverage. This would show how well the AI assistant tested the code and what we had to test next.

* Finally, when an acceptable coverage was reached, we could start testing the system end-to-end, running both applications and seeing how they interacted with each other.