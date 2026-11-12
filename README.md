<div align="center">

# TicTacLearn

Play tic-tac-toe against three neural networks — and see exactly why each one plays the way it does.

[![Live Site](https://img.shields.io/badge/Live%20Site-tictaclearn--three.vercel.app-0f766e?style=for-the-badge&logo=vercel&logoColor=white)](https://tictaclearn-three.vercel.app)
&nbsp;
[![Notebook](https://img.shields.io/badge/Notebook-View%20on%20GitHub-F37626?style=for-the-badge&logo=jupyter&logoColor=white)](https://github.com/Srabon-bot/cnn-tictactoe-playground/blob/main/tictactoe_cnn.ipynb)
&nbsp;
[![Repository](https://img.shields.io/badge/Repository-cnn--tictactoe--playground-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Srabon-bot/cnn-tictactoe-playground)

</div>

---

## Overview

TicTacLearn is a teaching project that turns a familiar game into a hands-on lesson about machine learning. Three CNN opponents are trained on the same task but deliberately learn in different ways: one barely learns, one memorizes, and one generalizes. After every game the site explains, in plain language, what the AI did and why.

This is a **Part A notebook + Part B website** project from the University of Information Technology and Sciences (UITS), Department of Computer Science and Engineering.

**Live site:** [https://tictaclearn-three.vercel.app](https://tictaclearn-three.vercel.app)

> **Academic title:** *Learn by Playing: A CNN-Based Tic-Tac-Toe Game for Teaching Overfitting and Underfitting*

---

## Screenshots

<div align="center">

### Home & Hero Instrument

![Homepage](./docs/screenshots/home.png)

### Play the Three Networks

![Play](./docs/screenshots/play.png)

### Learn & Compare

<br />

| Learn the Ideas | Compare the Three |
|:---:|:---:|
| <img src="./docs/screenshots/learn.png" width="480" alt="Learn the ideas" /> | <img src="./docs/screenshots/compare.png" width="480" alt="Compare the three models" /> |

### Teacher View

![Teacher](./docs/screenshots/teacher.png)

</div>

---

## Features

- Play against three opponents with visibly different learning behavior
- Choose **X first** or **O second**; X always opens the game
- See all nine network scores for every move as a probability heat map
- Legal-move masking that separates the raw top choice from the move actually played
- A post-game report that names missed wins, missed blocks, illegal choices, and the final result
- A move-by-move timeline with every board and network answer kept
- The same board read by all three models side by side
- A Learn page covering filters, loss, underfitting, overfitting, regularization, and symmetry
- A Compare page with accuracy tables, game records, charts, and training curves
- A Teacher page with a syllabus concept map, acceptance report, notebook link, and artifact download
- Fully static site with no backend, no accounts, and no stored scores
- Hand-written JavaScript forward pass over exported weights
- Parity tests against twenty Python boards per model
- Downloadable `.keras` models, portable weights, JSON data, plots, and the full archive
- Responsive layout, keyboard-accessible controls, light and dark themes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Notebook | ![Python](https://img.shields.io/badge/Python%203.10-3776AB?style=flat-square&logo=python&logoColor=white) ![Jupyter](https://img.shields.io/badge/Jupyter-F37626?style=flat-square&logo=jupyter&logoColor=white) Google Colab |
| Modeling | ![TensorFlow](https://img.shields.io/badge/TensorFlow%202.21-FF6F00?style=flat-square&logo=tensorflow&logoColor=white) ![Keras](https://img.shields.io/badge/Keras-D00000?style=flat-square&logo=keras&logoColor=white) ![NumPy](https://img.shields.io/badge/NumPy-013243?style=flat-square&logo=numpy&logoColor=white) |
| Evaluation | ![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=flat-square&logo=python&logoColor=white) memoized minimax, gameplay simulation |
| Verification | ![pytest](https://img.shields.io/badge/Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white) nbclient, nbconvert, acceptance checks |
| Framework | ![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=flat-square&logo=nextdotjs&logoColor=white) App Router |
| UI library | ![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black) |
| Language | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%204-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) |
| Charts | ![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=flat-square&logo=react&logoColor=white) |
| Icons & effects | ![Lucide](https://img.shields.io/badge/Lucide%20React-F56565?style=flat-square&logo=lucide&logoColor=white) ![canvas-confetti](https://img.shields.io/badge/canvas--confetti-E11D48?style=flat-square) |
| Hosting | ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) |

---

## Routes

| Route | Page |
|---|---|
| `/` | Hero, opponent picker, how a game becomes a lesson, and links to every section |
| `/play` | Play against Beginner, Memorizer, or Steady; heat maps, timeline, and post-game report |
| `/learn` | Six plain-language explanations of the ideas behind the board |
| `/compare` | Accuracy tables, game records, training curves, and the same board read three ways |
| `/teacher` | Concept map, acceptance report, notebook link, and artifact downloads |
| `/about` | The team, the notebook-to-browser pipeline, and what the site does not claim |

The site is fully static. There is no login, database, server runtime, or saved score.
