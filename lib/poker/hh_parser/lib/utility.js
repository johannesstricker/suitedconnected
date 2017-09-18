/** Compares to given poker positions. Returns -1 if lhs < rhs, +1 if rhs < lhs and 0 otherwise. */
comparePositions = function(lhs, rhs) {
	var positions = ['EP', 'EP+1', 'EP+2', 'MP', 'MP+1', 'MP+2', 'CO', 'BU', 'SB', 'BB'];
	if(lhs === rhs) {
		return 0;
	}
	for(let i = 0; i < positions.length; i++) {
		let position = positions[i];
		if(lhs === position) {
			return -1;
		}
		if(rhs === position) {
			return 1;
		}
	}
	return 0;
};
comparePlayers = function(lhs, rhs) {
	return comparePositions(lhs.position, rhs.position);
};