// Utility functions

var getCoupon = function() {
	var coupon = new card('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=9769&type=card', 'Ashnod`s Coupon', 'Artifact')
	return coupon;
}

var getBear = function() {
	var bear = new card('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=9769&type=card', 'Grizzly Bears', 'Creature');
	bear.setManaCost({'G':1, 'C':1});
	return bear;
}

var getIsland = function() {
    var island = new card('http://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=177737&type=card', 'Island', 'Land');
    island.setSubtypes('Island');
    return island;
}

var putCardIntoHand = function(game, ourPlayer, card) {
    card.setOwner(ourPlayer);
    game.on('gameStart', function() {
        var targetPlayer = false;
        var gamePlayers = this.getPlayers();
        // Searching for target player in game players
        for (var player_id in gamePlayers) {
            if (gamePlayers[player_id] == ourPlayer) {
                targetPlayer = gamePlayers[player_id];
            }
        }
        // If player is found...
        if (targetPlayer) {
            // ...place card in his hand
            targetPlayer.hand.place(card);
        }
    });
}

    var testPlayer = function(name) {
		var that = this;
        this.name = name;
        this.handlers = {};

        this.handlers = {};
        this.deck = [];
        this.life = 20;
        this.landToPlay = 1;
	    this.manapool = {
		    'W': 0,
		    'U': 0,
		    'B': 0,
		    'R': 0,
		    'G': 0,
		    'X': 0
	    };
        this.flags = {
            'drawnFromEmptyLibrary' : false,
	        'won' : false
        }

        this.battlefield = false;
        this.library = false;
        this.graveyard = false;
        this.hand = false;

		this.givePriority = function() {
            console.log('Testplayer ' + name + ' got priority');
            var stepName = this.getCurrentStep().name;
            that.game = this; // Contexts...
            that.trigger('step#' + stepName, this);
			//console.log('Test player ' + name + ' got priority');
			that.trigger('pass');
		}
	};

	testPlayer.prototype = new player();

// Tests

test('Player object', function() {
	equal((new player('test')).getName(), 'test', 'Storing and returning name');
	equal((new player('test')).flags.drawnFromEmptyLibrary, false, 'Flags are present on creation, DFEL is false');
	equal((new player('test')).flags.won, false, 'Winning flag is present and set to false');
	equal((new player('test')).life, 20, 'Player starts at 20 life');
	var johnny = new player('Johnny');
	johnny.addMana('R', 2);
	ok(johnny.hasMana('R', 2), 'Can add/check mana in pool');
	johnny.addMana('R', 1);
	ok(johnny.hasMana('R', 3), 'Mana in pool stacks');
	// Setting player zones
	var spike = new player('Spike');
	var hand = new zone('test_hand', true, true);
	spike.setHand(hand);
	equal(spike.hand.getName(), 'test_hand', 'Saving zone as hand works');
	equal(hand.owner.getName(), 'Spike', 'Setting owner of zone when saving works');
	var spike = new player('Spike');
	var library = new zone('test_library', true, true);
	spike.setLibrary(library);
	equal(spike.library.getName(), 'test_library', 'Saving zone as library works');
	equal(library.owner.getName(), 'Spike', 'Setting owner of zone when saving works');
	var spike = new player('Spike');
	var graveyard = new zone('test_graveyard', true, true);
	spike.setGraveyard(graveyard);
	equal(spike.graveyard.getName(), 'test_graveyard', 'Saving zone as graveyard works');
	equal(graveyard.owner.getName(), 'Spike', 'Setting owner of zone when saving works');
	var johnny = new player('Johnny');
	var bear = getBear();
	bear.setOwner(johnny);
	equal(johnny.owns(bear), true, 'Checking ownership on own cards work');
	var spike = new player('Spike');
	var other_bear = getBear();
	other_bear.setOwner(spike);
	equal(johnny.owns(other_bear), false, 'Checking ownership on another player cards work')
});

test('Card object', function() {
	var test_card = getBear();
	equal(test_card.getName(), 'Grizzly Bears', 'Card name is stored and retrieved');
	equal(test_card.getManaCost().W, 0, 'White mana cost is stored and retrieved');
	equal(test_card.getManaCost().U, 0, 'Blue mana cost is stored and retrieved');
	equal(test_card.getManaCost().B, 0, 'Black mana cost is stored and retrieved');
	equal(test_card.getManaCost().R, 0, 'Red mana cost is stored and retrieved');
	equal(test_card.getManaCost().G, 1, 'Green mana cost is stored and retrieved');
	equal(test_card.getManaCost().C, 1, 'Colorless mana cost is stored and retrieved');
	var test_card = getBear();
	var johnny = new player('Johnny');
	test_card.setOwner(johnny);
	equal(test_card.getOwner(), johnny, 'Owner is stored and retrieved correctly');
	var test_card = getBear();
	var johnny = new player('Johnny');
	var johnny_library = new zone('library', true, true);
	johnny.setLibrary(johnny_library);
	test_card.setOwner(johnny);
	test_card.goLibrary();
	equal(johnny_library.contents.length, 1, 'Card goes to its owner library');	
	var johnny = new player('Johnny');
	var johnny_graveyard = new zone('graveyard', true, true);
	johnny.setGraveyard(johnny_graveyard);
	test_card.setOwner(johnny);
	test_card.goGraveyard();
	equal(johnny_graveyard.contents.length, 1, 'Card goes to its owner graveyard');
    var test_card = getBear();
    test_card.setTypes('Artifact Creature');
    equal(test_card.hasType('Artifact'), true, 'Card type is saved and retrieved (1)');
    equal(test_card.hasType('Creature'), true, 'Card type is saved and retrieved (2)');
    equal(test_card.hasType('Land'), false, 'Card type is saved and retrieved (3)');
    var test_card = getBear();
    test_card.setSubtypes('Lizard Wizard');
    equal(test_card.hasSubtype('Lizard'), true, 'Card subtype is saved and retrieved (1)');
    equal(test_card.hasSubtype('Wizard'), true, 'Card subtype is saved and retrieved (2)');
    equal(test_card.hasSubtype('Human'), false, 'Card subtype is saved and retrieved (3)');
});

test('Stack object', function() {
	var test_card = getBear();
    var test_spell = new spell(test_card);
    var stack = new stack_object;
    equal(stack.getContents().length, 0, 'Stack is empty on creation');
    stack.put(test_spell);
    equal(stack.getContents().length, 1, 'The spell is on stack');
    equal(stack.getContents()[0], test_spell, 'Test spell is on stack');
    var resolving_spell = stack.pop();
    equal(stack.getContents().length, 0, 'Test spell is removed from the stack');
    equal(resolving_spell, test_spell, 'Resolving spell is the test spell');
});


asyncTest('Player object events', 2, function(){
	var spike = new player('Spike');
	spike.on('test', function() {
		ok(true, 'Player event is passed through');
	});
	spike.trigger('test');
    var game = new engine();
    var spike = new testPlayer('Spike');
    game.addPlayer(spike);
    game.addPlayer(new testPlayer('Mike'));
    game.flags.canDrawFromEmptyLibrary = true;
    game.on('eos_Untap',function() {
        console.log('##### Trying to concede...');
        game.concede(spike);
    });
    game.on('eos_Cleanup',function() {
        this.flags.finished = true;
    });
    game.on('finish', function() {
        equal(spike.flags['lost'], true, 'Game ended after player concedes, player marked as lost');
        start();
    });
    game.start();
});

test('Zone object', function() {
	equal((new zone('test', true, true)).getName(), 'test', 'Storing and returning name');
	var johnny = new player('Johnny');
	var hand = new zone('hand', true, true);
	hand.setOwner(johnny);
	equal(hand.owner.getName(), 'Johnny', 'Setting zone owner works');
});


test('Permanent object', function() {
	var our_card = getBear();
	var our_permanent = new permanent(our_card);
	equal(our_permanent.getName(), 'Grizzly Bears', 'Name of card used as name of permanent');
	var our_token = new permanent({
		'name': 'Centaur',
		'power': 2,
		'toughness': 2
	});
	equal(our_token.getName(), 'Centaur' , 'Name of token is stored and passed correctly.');
	var our_card = getCoupon();
	var our_permanent = new permanent(our_card);
	equal(our_permanent.isTapped(), false, 'Permanent is created untapped');
	our_permanent.tap();
	equal(our_permanent.isTapped(), true, 'Permanent can be tapped');
	our_permanent.untap();
	equal(our_permanent.isTapped(), false, 'Permanent can be untapped');
	var our_card = getBear();
	var our_permanent = new permanent(our_card);
	equal(our_permanent.getManaCost().G, 1, 'Card cost is used as permanent cost')
});


test('Spell object', function() {
	var our_card = getBear();
	var johnny = new player('Johnny');
	our_card.setOwner(johnny);
	var our_spell = new spell(our_card);
	equal(our_spell.representedBy, our_card, 'Spell is represented by right card');
	equal(our_spell.getOwner(), johnny, 'Spell owner is passed correctly');
});

// Integration tests

test('Drawing from library', function() {
	// Here's our player
	var johnny = new player('Johnny');
	// This will be his library
	var library = new zone('Johnny`s library', true, true);
	// This will be his hand
	var hand = new zone('Johnny`s hand', false, true);
	// This is his only card
	var our_card = getCoupon();
	// Put it in the library
	library.place(our_card);
	// Give this deck to Johnny
	johnny.setLibrary(library);
	// Set his hand (drawn cards go here)
	johnny.setHand(hand);
	// Draw a card
	johnny.draw();
	// Test that Johnny has drawn our card
	equal(johnny.hand.contents.length, 1, 'Has a card in hand after drawing');
	equal(johnny.library.contents.length, 0, 'Has no cards in library after drawing');
	equal(johnny.hand.contents[0].getName(), 'Ashnod`s Coupon', 'Drawn card is Ashnod`s Coupon');
	equal(johnny.flags.drawnFromEmptyLibrary, false, 'Johnny is not marked as having drawn card from empty library');
});

test('Registering deck', function() {
	var johnny = new player('Johnny');
	var bear = getBear();
	var johnnys_deck = [];
	johnnys_deck.push(bear);
	johnny.setDeck(johnnys_deck);
	var game = new engine();
	game.addPlayer(johnny);
	equal(bear.getOwner().getName(), 'Johnny', 'Cards in registered deck are marked as owned by right player');
});

test('Drawing from empty library', function() {
	// Here's our player
	var johnny = new player('Johnny');
	// This will be his library
	var library = new zone('Johnny`s library', true, true);
	// This will be his hand
	var hand = new zone('Johnny`s hand', false, true);
	// Give empty deck to Johnny
	johnny.setLibrary(library);
	// Set his hand (drawn cards go here)
	johnny.setHand(hand);
	// Draw a card
	johnny.draw();
	// Test that Johnny has drawn our card
	equal(johnny.hand.contents.length, 0, 'Has no cards in hand after drawing');
	equal(johnny.library.contents.length, 0, 'Has no cards in library after drawing');
	equal(johnny.flags.drawnFromEmptyLibrary, true, 'Johnny is marked as having drawn card from empty library');
});

test('Engine events', 1, function() {
    var game = new engine();
    game.on('test', function(data) {
        equal(data, 'Test', 'Data is passed to event handler');
    });
    game.trigger('test', 'Test');
});

asyncTest('APNAP priority order', 1, function() {
	var $fixture = $('#qunit-fixture');
	$fixture.append('<div id="actions"></div>');
	$fixture.append('<div id="zones"></div>');
	$fixture.append('<div id="steps"></div>');

	var teststring = '';

	var priority_player = function(phrase) {
		var that = this;
		this.givePriority = function() {
			console.log('Test player got priority');
			teststring = teststring + phrase;
			that.trigger('pass');
		}
	};

	priority_player.prototype = new player();

	// Here's our player 1
	var johnny = new priority_player('AP');
	// Give empty deck and hand to Johnny
	johnny.setLibrary(new zone('Johnny`s library', true, true));
	johnny.setHand(new zone('Johnny`s hand', false, true));
	// Here's our player 2
	var timmy = new priority_player('NAP');
	timmy.setLibrary(new zone('Timmy`s library', true, true));
	timmy.setHand(new zone('Timmy`s hand', false, true));

	var test_game = new engine();
    test_game.verbose = 'APNAP';
    test_game.flags.canDrawFromEmptyLibrary = true;
	//
	test_game.on('eos_Untap', function() {
        console.log('eos_Untap');
		// finish the game on the end of turn one phase one
		test_game.flags.finished = true;
	});

	test_game.on('finish', function() {
		equal(teststring, 'APNAP', 'Players are given priority in APNAP order');
        start();
	});
	test_game.addPlayer(johnny);
	test_game.addPlayer(timmy);

	test_game.start();
});

test('View', function() {
    var game = new engine();
    var view = game.getView();
    equal(game, view.getGame(), 'View returns correct game instance');
});

test('View events', 2, function() {
    var game = new engine();
    game.flags.verbose = 'VE';
    var view = game.getView();
    view.on('gameStart', function(data) {
        equal(game, this, 'View event uses correct game instance');
        equal(data.players.length, 2, 'View event for game start returns list of players');
    });

    // Finish game at the end of the first phase
    game.on('eos_Untap', function() {
        game.flags.finished = true;
    });

    game.start();
});

asyncTest('New putCardIntoHand', 1, function() {
    console.log('Putcards test');
    var game = new engine();
    game.verbose = 'PC';
    var johnny = new player('Johnny');
    game.addPlayer(johnny);
    var bears = getBear();
    putCardIntoHand(game, johnny, bears);
    game.on('stepStart#triggers', function() {
        console.log('Stepstart trigger');
        var firstPlayer = this.getPlayers()[0];
        equal(firstPlayer.hand.contents.length, 1, 'Player has card in hand at end of Untap step');
        this.flags.finished = true;
        start();
    });
    game.start();
});

asyncTest('Turn Structure', function() {
    console.log('Starting Turn Structure test')
    expect(1);
    var game = new engine();
    game.verbose = 'TS';
    game.stepDelay = 0;
    var johnny = new testPlayer('Jackie');
    var stepNames = '';
    game.flags.canDrawFromEmptyLibrary = true;
    var bears = getBear();
    putCardIntoHand(game, johnny, bears);
    game.addPlayer(johnny);
    game.on('stepStart#triggers', function() {
        var stepName = this.getCurrentStep().name;
        stepNames = stepNames + ', ' + stepName;
    });
    game.on('eos_Cleanup', function() {
        console.log('Turn Structure callback');
        equal(stepNames, ', Untap, Upkeep, Draw, Precombat Main, Beginning of Combat, Declare Attackers, Declare Blockers, Combat Damage, End of Combat, Post-Combat Main, End, Cleanup', 'Step names are correct');
        this.flags.finished = true;
        start();
    });
    console.log('Starting engine for TurnStructure...');
    game.start();
});

asyncTest('Playing land', function() {
    expect(1);
    console.log('Starting PlayingLand test');
    var game = new engine();
    game.verbose = 'PL';
    game.stepDelay = 0;
    var johnny = new testPlayer('Johnny');
    var johnnys_deck = [];
    johnnys_deck.push(getIsland());
    johnnys_deck.push(getIsland());
    johnnys_deck.push(getIsland());
    johnny.setDeck(johnnys_deck);
    johnny.on('step#Draw', function() {
        console.log('Entering Draw step, ' + johnny.library.contents.length + ' cards in library');
    });

    var land_played = false;

    var times = 1;

    // Play land at the start of precombat main phase
    johnny.on('step#Precombat Main', function() {
        console.log('PlayingLand intermediate event (' + times + ')');
        game.playLand(johnny, johnny.hand.contents[0]);
        land_played = true;
        equal(game.mtg.zone('battlefield').eq(0).contents.length, 1, 'Card is on the battlefield after land is played');
        times++;
        game.flags.finished = true;
    });

    game.on('finish', function() {
        console.log('Finishing PlayingLand test');
        if (!land_played) {
            ok(false, 'Player lost before playing land.')
        }
        start();
    });
    game.addPlayer(johnny);
    game.start();
});