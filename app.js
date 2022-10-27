;(function () {
  // Game constants
  const maxWidth = 60
  const gameTickDelay = 100
  const animateDelay = 250
  const xStepSize = 16

  // Animation related data

    const spriteDataAlex = {
    still: [
      [-235, -645],
      // [1165, 0]
    ],
    walk: [
      [-235, -645],
      [-555, 10],
      [-885, 10],
      [-1215, 10],
      [-1545, 10]
    ],
    hug: [
      [-235, -645],
      [-555, -645],
      [-890, -635],
      [-1210, -625],
      [-1530, -635]
    ],
    hand: [
      [-225, -1300],
      [-600, -1295],
      [-890, -1290],
      [-1215, -1280],
    ],
    pat: [
      [-225, -1300],
      [-600, -1295],
      [-890, -1290],
      [-1215, -1280],
      [-1575, -1290],
      [-235, -1950],
      [-1540,-1950]
    ],
    bum: [
      [-225, -1300],
      [-885, -1950],
      [-1215, -1950]
    ],
    heart: [
      [-225, -2605],
      [-555, -2605],
      [-855, -2605],
      [-1200, -2590],
      [-1535, -2600]
    ]
  }

  const spriteDataLucy = {
    still: [
      [-235, -645],
      // [1165, 0]
    ],
    walk: [
      [-235, -645],
      [-565, 10],
      [-895, 10],
      [-1225, 10],
      [-1555, 10]
    ],
    hug: [
      [-235, -645],
      [-565, -650],
      [-890, -665],
      [-1215, -655],
      [-1541, -648]
    ],
    hand: [
      [-255, -1310],
      [-575, -1300],
      [-905, -1300],
      [-1230, -1302],
    ],
    pat: [
      [-255, -1310],
      [-575, -1300],
      [-905, -1300],
      [-1230, -1302],
      [-1550, -1308],
      [-235, -1950],
      [-1547,-1950]
    ],
    bum: [
      [-255, -1310],
      [-900, -1950],
      [-1245, -1940]
    ],
    heart: [
      [-255, -1310],
      [-565, -2605],
      [-910, -2610],
      [-1235, -2615],
      [-1555, -2610]
    ]
  }

  const nextSprite = function (currentSprite, endingAnimation = false) {
    switch (currentSprite[0]) {
      case 'still':
        return ['still', 0]
      case 'walk':
        return ['walk', (currentSprite[1] + 1) % 5]
      case 'hug':
        if (endingAnimation) {
          return ['hug', currentSprite[1] - 1]
        } else {
          if (currentSprite[1] === 4) {
            return ['hug', 3]
          } else {
            return ['hug', currentSprite[1] + 1]
          }
        }
      case 'hand':
        if (endingAnimation) {
          return ['hand', currentSprite[1] - 1]
        } else {
          return ['hand', Math.min(currentSprite[1] + 1, 3)]
        }
      case 'pat':
        if (endingAnimation) {
          return ['pat', currentSprite[1] - 1]
        } else {
          if (currentSprite[1] === 6) {
            return ['pat', 5]
          } else {
            return ['pat', currentSprite[1] + 1]
          }
        }
      case 'bum':
        if (endingAnimation) {
          return ['bum', currentSprite[1] - 1]
        } else {
          return ['bum', Math.min(currentSprite[1] + 1, 2)]
        }
      case 'heart':
        if (endingAnimation) {
          return ['heart', currentSprite[1] - 1]
        } else {
          return ['heart', Math.min(currentSprite[1] + 1, 4)]
        }
    }
  }
  const controller = {
    KeyG: { pressed: false },
    KeyH: { pressed: false },
    KeyP: { pressed: false },
    KeyB: { pressed: false },
    KeyL: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false }
  }

  const gameTick = () => {
    if (controller['ArrowLeft'].pressed) {
      handleArrowPress(-1)
    } else if (controller['ArrowRight'].pressed) {
      handleArrowPress(1)
    } else if (controller['KeyG'].pressed) {
      newState('hug')
    } else if (controller['KeyH'].pressed) {
      newState('hand')
    } else if (controller['KeyP'].pressed) {
      newState('pat')
    } else if (controller['KeyB'].pressed) {
      newState('bum')
    } else if (controller['KeyL'].pressed) {
      newState('heart')
    } else {
      newState('still')
    }
  }

  //
  let playerId
  let playerRef
  let players = {}
  let playerElements = {}
  let playerSprites = {}

  const gameContainer = document.querySelector('.game-container')
  const playerCharacterButton = document.querySelector('#player-character')

  document.addEventListener('keydown', e => {
    if (controller[e.code]) {
      controller[e.code].pressed = true
    }
  })
  document.addEventListener('keyup', e => {
    if (controller[e.code]) {
      controller[e.code].pressed = false
    }
  })
  const handleArrowPress = function (xChange) {
    const newX = Math.min(Math.max(players[playerId].x + xChange, 0), maxWidth)
    players[playerId].x = newX
    if (xChange === 1) {
      players[playerId].direction = 'right'
      players[playerId].state = 'walk'
    }
    if (xChange === -1) {
      players[playerId].direction = 'left'
      players[playerId].state = 'walk'
    }
    playerRef.set(players[playerId])
  }

  const newState = function (state) {
    if (players[playerId] && players[playerId].state !== state) {
      playerRef.update({
        state: state
      })
    }
  }

  function initGame () {
    const allPlayersRef = firebase.database().ref(`players`)

    allPlayersRef.on('child_added', snapshot => {
      //Fires whenever a new node is added the tree
      const addedPlayer = snapshot.val()
      const characterElement = document.createElement('div')
      characterElement.classList.add('Character', 'grid-cell')
      if (addedPlayer.id === playerId) {
        characterElement.classList.add('you')
      }
      characterElement.innerHTML = `
        <div class="Character_sprite grid-cell"></div>
      `
      playerElements[addedPlayer.id] = characterElement

      //Fill in some initial state
      characterElement.setAttribute('data-character', addedPlayer.character)
      characterElement.setAttribute('data-direction', addedPlayer.direction)
      const left = xStepSize * addedPlayer.x + 'px'
      characterElement.style.left = left
      gameContainer.appendChild(characterElement)

      playerSprites[addedPlayer.id] = ['still', 0]
    })

    allPlayersRef.on('value', snapshot => {
      //Fires whenever a change occurs
      players = snapshot.val() || {}
      Object.keys(players).forEach(key => {
        const characterState = players[key]
        let el = playerElements[key]
        // Now update the DOM
        el.setAttribute('data-character', characterState.character)
        el.setAttribute('data-direction', characterState.direction)
        const left = xStepSize * characterState.x + 'px'
        el.style.left = left
      })
    })

    //Remove character DOM element after they leave
    allPlayersRef.on('child_removed', snapshot => {
      const removedKey = snapshot.val().id
      gameContainer.removeChild(playerElements[removedKey])
      delete playerElements[removedKey]
      delete playerSprites[removedKey]
    })

    //Update player character on button click
    playerCharacterButton.addEventListener('click', () => {
      playerRef.update({
        character: players[playerId].character === 'alex' ? 'lucy' : 'alex'
      })
    })

    const animate = function () {
      Object.keys(players).forEach(key => {
        let currSprite = playerSprites[key]
        let tempSprite
        if (currSprite[0] == players[key].state) {
          tempSprite = nextSprite(currSprite)
        } else if (currSprite[1] == 0) {
          tempSprite = [players[key].state, 0]
        } else {
          tempSprite = nextSprite(currSprite, (endingAnimation = true))
        }
        let tempSpritePos;
        if (players[key].character === 'alex') {
          tempSpritePos = spriteDataAlex[tempSprite[0]][tempSprite[1]]
        } else {
          tempSpritePos = spriteDataLucy[tempSprite[0]][tempSprite[1]]
        }
        let el = playerElements[key]
        el.querySelector('.Character_sprite').style.backgroundPosition =
          tempSpritePos[0] + 'px ' + tempSpritePos[1] + 'px'
        playerSprites[key] = tempSprite
      })
    }

    setInterval(gameTick, gameTickDelay)
    setInterval(animate, animateDelay)
  }

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      //You're logged in!
      playerId = user.uid
      playerRef = firebase.database().ref(`players/${playerId}`)

      playerRef.set({
        id: playerId,
        direction: 'right',
        character: 'alex',
        x: 0,
        state: 'still'
      })

      //Remove me from Firebase when I diconnect
      playerRef.onDisconnect().remove()

      //Begin the game now that we are signed in
      initGame()
    } else {
      //You're logged out.
    }
  })

  firebase
    .auth()
    .signInAnonymously()
    .catch(error => {
      var errorCode = error.code
      var errorMessage = error.message
      // ...
      console.log(errorCode, errorMessage)
    })
})()
