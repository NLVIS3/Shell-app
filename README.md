# Shell-app

An Angular 21 proof of concept for composing independently built frontend applications with Webpack Module Federation.

## What Is a Microfrontend?

A microfrontend divides a frontend into smaller applications that can be developed, built, and deployed independently. A host application, called the **shell**, provides the common application frame and loads those applications at runtime. This can let teams work and release separately, but it also introduces runtime dependencies: the shell must be able to reach each remote, and shared libraries must remain compatible.

This project demonstrates that pattern with one shell and three remote Angular applications. Each remote exposes a standalone Angular component, and the shell loads it from the remote's `remoteEntry.js` file.

## Applications

| Application | Role | Local URL | Exposed module |
| --- | --- | --- | --- |
| `shell-app` | Host shell, responsive layout, header, footer, and remote loading | `http://localhost:4200` | Loads all three remotes |
| `main-container` | Royal London introduction content | `http://localhost:4201` | `./MainComponent` |
| `ui-container` | UI architecture and technology overview | `http://localhost:4202` | `./UiComponent` |
| `backend-container` | Backend services overview | `http://localhost:4203` | `./BackendComponent` |

The shell's federation configuration maps the remotes to their local `remoteEntry.js` files. Each remote declares its exposed component in its own Webpack configuration. The shell uses a dedicated loader for each remote, calls `loadRemoteModule`, and renders the returned component dynamically with `NgComponentOutlet`.

Angular and other shared dependencies are configured as singletons with strict version checks. This helps avoid loading multiple incompatible copies of shared libraries at runtime.

On the shell home view, the Main remote is displayed above the UI and Backend remotes. The shell layout places the UI and Backend panels side by side on wider screens and stacks them on smaller screens. The header logo returns to the home view, and the footer displays the current year.

## Run Locally

Run each application in its own terminal. Install dependencies once in each application folder after cloning, then use `npm start` to launch it. Start the three remotes before the shell so their `remoteEntry.js` files are available when the shell loads.

| Terminal | Commands |
| --- | --- |
| Main remote | `cd main-container`, then `npm install` (first run only) and `npm start` |
| UI remote | `cd ui-container`, then `npm install` (first run only) and `npm start` |
| Backend remote | `cd backend-container`, then `npm install` (first run only) and `npm start` |
| Shell host | `cd shell-app`, then `npm install` (first run only) and `npm start` |

Each application also provides `npm run build` for a production build and `npm run watch` for a development watch build.

## Current Scope and Limitations

- This is an architecture demo. The remote content is static; it does not call backend APIs or implement production business workflows.
- Remote URLs are configured for localhost, so deployment environments need their own remote URL configuration.
- The shell template includes conditional views for `/main`, `/ui`, and `/backend`, but the router is currently configured with an empty route list. The header only provides navigation back to home, so the individual remote views need route definitions and navigation before those paths are dependable.
- The remote loader components do not currently provide user-facing loading or error states if a remote is unavailable.


