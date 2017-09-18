Meteor.startup(function() {
	if(Tags.find().count() === 0) {
		var tags = [
			{name: "cbet", description: "If a player bets in an earlier round and then bets again in the current one, this is called a continuation bet since it continues the aggression from the previous round.", synonyms: ['contibet', 'continuationbet']},
			{name: "3bet", description: "Re-raise following a raise.", synonyms: ['3-bet', 'threebet']},
			{name: "4bet", description: "Raise following a 3bet.", synonyms: ['4-bet', 'fourbet']},
			{name: "ante", description: "The ante is a form of forced bet that all players must pay before the cards are dealt. They are paid by all players at the table every round and do not count as bets made, but are a form of entry fee into the round."},
			{name: "5bet", description: "Not available.", synonyms: ['5-bet', 'fivebet']},
			{name: "all-in preflop", description: "To go all-in is to bet all the chips one has at the table. Once a player is all-in, he is treated specially since he can no longer make any more wagers or call any more bets. He cannot be forced to fold and will see the showdown for sure.", synonyms: ['AI', 'allin', 'shove', 'jam']},
			{name: "multiway", description: "A multiway pot is one in which more than 3 players are involved.", synonyms: ['mw']},
			{name: "EPvsEP", description: "Early position versus early position."},
			{name: "EPvsMP", description: "Early position versus middle position."},
			{name: "EPvsCO", description: "Early position versus cutoff."},
			{name: "EPvsBU", description: "Early position versus button."},
			{name: "EPvsSB", description: "Early position versus small blind."},
			{name: "EPvsBB", description: "Early position versus big blind."},
			{name: "MPvsEP", description: "Middle position versus early position."},
			{name: "MPvsMP", description: "Middle position versus middle position."},
			{name: "MPvsCO", description: "Middle position versus cutoff."},
			{name: "MPvsBU", description: "Middle position versus button."},
			{name: "MPvsSB", description: "Middle position versus small blind."},
			{name: "MPvsBB", description: "Middle position versus big blind."},
			{name: "COvsEP", description: "Cutoff versus early position."},
			{name: "COvsMP", description: "Cutoff versus middle position."},
			{name: "COvsBU", description: "Cutoff versus button."},
			{name: "COvsSB", description: "Cutoff versus small blind."},
			{name: "COvsBB", description: "Cutoff versus big blind."},
			{name: "BUvsEP", description: "Button versus early position."},
			{name: "BUvsMP", description: "Button versus middle position."},
			{name: "BUvsCO", description: "Button versus cutoff."},
			{name: "BUvsSB", description: "Button versus small blind."},
			{name: "BUvsBB", description: "Button versus big blind."},
			{name: "SBvsEP", description: "Small blind versus early position."},
			{name: "SBvsMP", description: "Small blind versus middle position."},
			{name: "SBvsCO", description: "Small blind versus cutoff."},
			{name: "SBvsBU", description: "Small blind versus button."},
			{name: "SBvsBB", description: "Small blind versus big blind."},
			{name: "BvB", description: "Blind versus Blind, meaning only the small blind and big blind are involved in the pot.", synonyms: ['BvsB', 'blindbattle']},
			{name: "BBvsEP", description: "Big blind versus early position."},
			{name: "BBvsMP", description: "Big blind versus middle position."},
			{name: "BBvsCO", description: "Big blind versus cutoff."},
			{name: "BBvsBU", description: "Big blind versus button."},
			{name: "BBvsSB", description: "Big blind versus small blind."},
			{name: "IP", description: "In position: A player is said to have position on or be in position with respect to all players who must act before him in the betting round. He has the advantage of knowing what these players have already done.", synonyms: ['inposition', 'in-position']},
			{name: "OOP", description: "Out of position: A player is out of position on his opponent if he must act before his opponent in a given betting round.", synonyms: ['outofposition']},
			{name: "SRP", description: "Single Raised Pot: A single raised pot, is a pot in which exactly one player raised before the flop.", synonyms: ['singleraisedpot']},
			{name: "delayed cbet", description: "If a player bets in an earlier round and then bets again in the current one, this is called a continuation bet since it continues the aggression from the previous round."},
			{name: "6-max", description: "A maximum of 6 players can be seatet at the table.", synonyms: ['sixmax', '6max', 'shorthanded']},
			{name: "full ring", description: "A maximum of8/9 players can be seatet at the table.", synonyms: ['FR', 'full-ring', '9max', '9-max', '8max', '8-max']},
			{name: "MTT", description: "Multi Table Tournament.", synonyms: ['tourney', 'trny', 'tournament', 'multitabletournament']},
			{name: "SNG", description: "Single Table Tournament."},
			{name: "HU", description: "Heads Up: A match between exactly 2 opponents.", synonyms: ['headsup', 'heads-up', '2max', '2-max', '1on1']},
			{name: "lead", description: "Bet by a player who was not the aggressor in the previous betting round.", synonyms: ['donk', 'donkbet']},
			{name: "bubble", description: "The phase of a tournament just before the bubble is reached, where only a few players need to be eliminated before reaching the rewarded places."},
			{name: "ICM", description: "Independent Chip Model."},
			{name: "preflop", description: "The part of the game that takes place before the flop is dealt is called the preflop."},
			{name: "flop", description: "In poker variants with community cards like Hold'em and Omaha, the flop is the first three board cards to be dealt."},
			{name: "turn", description: "In poker variants with community cards such as Texas Hold'em or Omaha, the fourth community card is called the turn or 4th street."},
			{name: "river", description: "In poker variants with community cards such as Texas Hold'em or Omaha, the fifth community card is called the river or 5th street."},
			{name: "blocker", description: "Not available."},
			{name: "bluff catcher", description: "Not available."},
			{name: "XR", description: "Check-Raise.", synonyms: ['checkraise', 'check-raise', 'xraise', 'x/raise', 'x/r', 'c/r', 'check/raise', 'chraise', 'ch/raise', 'ch/r']},
			{name: "stab", description: "Not available.", synonyms: ['probe', 'probebet']},
			{name: "missed cbet", description: "Not available.",  synonyms: ['skip', 'skipcbet', 'skipc-bet', 'skippedcbet', 'skippedc-bet']},
			{name: "EP", description: "Early Position: In games where the relative position of a player to the dealer determines the order of play, the early positions are those who must act first."},
			{name: "MP", description: "Middle Position: In games where the order of player action is fixed by the position of the dealer, the middle positions are those mid way around the table from the dealer."},
			{name: "CO", description: "Cutoff: In games with a dealer button, the cutoff is the position immediately to the right of the button."},
			{name: "BU", description: "Button: The button or dealer button is a chip that shows who the current dealer is. The position where the dealer sits is also called the button. We also say that the dealer is on the button."},
			{name: "SB", description: "Small Blind: In a poker game with blinds, the small blind is the lesser of the two blind bets. It can also refer to the player who pays such a bet."},
			{name: "BB", description: "Big Blind: The big blind is the larger of the two forced bets in a game with blinds. The smaller of the two is called the small blind. The blinds are paid before the cards are dealt, always by different players from round to round. The player to the left of the dealer pays the small blind and the player to his left pays the big blind."},
			{name: "CAP", description: "Not available."},
			{name: "shallow", description: "Not available.", synonyms: ['shw']},
			{name: "3-max", description: "A maximum of 3 players can be seatet at the table.", synonyms: ['threehanded', 'three-handed', '3handed', '3-handed', 'threemax']},
			{name: "5-max", description: "A maximum of 5 players can be seatet at the table.", synonyms: ['fivehanded', 'five-handed', '5handed', '5-handed', 'fivemax']},
			{name: "DoN", description: "Double or nothing.", synonyms: ['doubleornothing']},
			{name: "betsize", description: "Not available."},
			{name: "GTO", description: "Game Theoretical Optimum: This concept from game theory refers to a play that can be considered the optimal strategy in terms of a Nash equilibrium."},
			{name: "PLO", description: "Pot Limit Omaha.", synonyms: ['potlimitomaha', 'potlimitomaha', 'omaha']},
			{name: "NLH", description: "No-Limit Hold'em.", synonyms: ['nl', 'no-limit', 'nolimit']},
			{name: "FLH", description: "Fixed Limit Hold'em.", synonyms: ['FL', 'fixedlimit', 'fixedlimitholdem']},
			{name: "limp", description: "In games with blinds, a player limps if he calls the blinds as his first action. He calls the big blind but does not raise."},
			{name: "overbet", description: "Not available."},
			{name: "squeeze", description: "A squeeze means to make a re-raise after there has already been one raise and at least one call."},
			{name: "raise", description: "A raise is an action that a player can make when confronted by another player's bet."},
			{name: "deep", description: "A stack is deep if it is substantially larger than the maximum table buy-in."},
			{name: "EPvsIP", description: "Not available.", synonyms: ['UTGvsIP', 'earlyvsip', 'earlypositionversusinposition']},
			{name: "MPvsIP", description: "Not available.", synonyms: ['middlevsip', 'middlepositionversusinposition']},
			{name: "COvsIP", description: "Not available.", synonyms: ['HJvsIP', 'cutoffvsip', 'cutoffversusinposition', 'cut-offvsip', 'cut-offversusinposition']},
			{name: "SBvsIP", description: "Not available.", synonyms: ['smallblindvsip', 'smallblindversusinposition']},
			{name: "BBvsIP", description: "Not available.", synonyms: ['bigblindvsip', 'bigblindversusinposition']},
			{name: "EPvsOOP", description: "Not available.", synonyms: ['UTGvsOOP', 'earlyvsoop', 'earlypositionversusoutofposition']},
			{name: "MPvsOOP", description: "Not available.", synonyms: ['middlevsoop', 'middlepositionversusoutofposition']},
			{name: "COvsOOP", description: "Not available.", synonyms: ['HJvsooP', 'cutoffvsoop', 'cutoffversusoutofposition', 'cut-offvsoop', 'cut-offversusoutofposition']},
			{name: "BUvsOOP", description: "Not available.", synonyms: ['BTNvsOOP', 'buttonvsoop', 'buttonversusoutofposition', 'dealervsoop', 'dealerversusoutofposition' ]},
			{name: "SBvsOOP", description: "Not available.", synonyms: ['smallblindvsoop', 'smallblindversusoutofposition']},
			{name: "BBvsOOP", description: "Not available.", synonyms: ['bigblindvsoop', 'bigblindversusoutofposition']},
			{name: "early vs early", description: "Not available."},
			{name: "early vs late", description: "Not available."},
			{name: "early vs blinds", description: "Not available."},
			{name: "late vs late", description: "Not available."},
			{name: "late vs blinds", description: "Not available."},
			{name: "blinds vs early", description: "Not available."},
			{name: "blinds vs late", description: "Not available."},
			{name: "blinds vs blinds", description: "Not available."},
		];

		_.each(tags, function(tag) {
			Tags.insert(tag);
		});
	}
});