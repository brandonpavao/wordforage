# Infinite Connections Pet Feed

A Connections-style word puzzle game with a pet care twist, where each round helps feed, grow, or lose your raccoon companion.

This project started as a simple clone of the NYT Connections format, then grew into a more personal game loop. Instead of only solving word groups, the player also cares for a raccoon across daily feeding sessions. Wins reward the raccoon. Losses affect its health. The goal was to make the puzzle system feel more alive through progression, reactions, and small emotional stakes.

## Overview

Infinite Connections Pet Feed combines a 16-word category puzzle with a lightweight pet survival system. Players solve word groups, earn food rewards, and feed their raccoon through the day.

The raccoon reacts to correct guesses, wrong guesses, feeding progress, and death states. Each raccoon has a name, a short life cycle, and a graveyard record if it does not survive. The result is a word game with memory, consequence, and character.

## Features

* 16-word Connections-style puzzle board
* Four hidden word groups per puzzle
* Correct group detection and solved-group stacking
* Wrong guess feedback with visual reaction states
* Raccoon companion displayed below the word tiles
* Daily feeding system
* Four feed attempts per day
* Health loss tied to failed forage sessions
* Food reward shown after successful play
* Raccoon naming modal
* Growth tier progress bar
* Raccoon reaction sprites for idle, happy, sad, full, and death states
* Graveyard system for past raccoons
* Browser-based persistence planned for saved raccoon data
* Static HTML, CSS, and JavaScript structure for GitHub Pages hosting

## What I Learned

* How to turn a simple puzzle clone into a larger game loop
* How to connect player performance to character progression
* How to manage UI state across modals, puzzle screens, and pet screens
* How to plan sprite states around gameplay feedback
* How local browser storage can support persistent game data
* How small emotional mechanics make repeated play feel less disposable
