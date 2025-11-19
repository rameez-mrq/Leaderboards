#!/usr/bin/env node

/**
 * Script to update leaderboard.json with new student evaluation results
 * 
 * Usage:
 *   node scripts/update-leaderboard.js
 * 
 * Or with data:
 *   node scripts/update-leaderboard.js --name "John Doe" --team "Team Alpha" --map 0.35 --commit "1 hour ago"
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const LEADERBOARD_FILE = join(__dirname, '../static/leaderboard.json');

// Parse command line arguments
function parseArgs() {
	const args = process.argv.slice(2);
	const result = {};
	
	for (let i = 0; i < args.length; i += 2) {
		const key = args[i]?.replace('--', '');
		const value = args[i + 1];
		if (key && value) {
			result[key] = value;
		}
	}
	
	return result;
}

// Read current leaderboard
function readLeaderboard() {
	try {
		const content = readFileSync(LEADERBOARD_FILE, 'utf-8');
		return JSON.parse(content);
	} catch (error) {
		console.error('Error reading leaderboard:', error);
		process.exit(1);
	}
}

// Write updated leaderboard
function writeLeaderboard(data) {
	try {
		writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, '\t') + '\n', 'utf-8');
		console.log('✅ Leaderboard updated successfully!');
	} catch (error) {
		console.error('Error writing leaderboard:', error);
		process.exit(1);
	}
}

// Update or add student entry
function updateStudent(leaderboard, { name, team, map, commit, id }) {
	const mapScore = parseFloat(map);
	if (isNaN(mapScore)) {
		console.error('❌ Invalid MAP score:', map);
		process.exit(1);
	}

	// Find existing student by id or name
	let existingIndex = -1;
	if (id) {
		existingIndex = leaderboard.findIndex(s => s.id === parseInt(id));
	} else {
		existingIndex = leaderboard.findIndex(s => s.name === name);
	}

	const newEntry = {
		id: existingIndex >= 0 ? leaderboard[existingIndex].id : Math.max(...leaderboard.map(s => s.id), 0) + 1,
		name: name || 'Unknown',
		team: team || 'Unassigned',
		map: mapScore,
		lastCommit: commit || new Date().toISOString()
	};

	if (existingIndex >= 0) {
		// Update existing
		leaderboard[existingIndex] = newEntry;
		console.log(`📝 Updated: ${name} (MAP: ${mapScore.toFixed(2)})`);
	} else {
		// Add new
		leaderboard.push(newEntry);
		console.log(`➕ Added: ${name} (MAP: ${mapScore.toFixed(2)})`);
	}

	return leaderboard;
}

// Main function
function main() {
	const args = parseArgs();
	
	// If no arguments, show usage
	if (Object.keys(args).length === 0) {
		console.log(`
📊 Leaderboard Update Script

Usage:
  node scripts/update-leaderboard.js --name "Student Name" --team "Team Name" --map 0.35 --commit "1 hour ago"

Options:
  --name     Student name (required)
  --team     Team name
  --map      MAP score (required)
  --commit   Last commit time/description
  --id       Student ID (for updates)

Example:
  node scripts/update-leaderboard.js --name "John Doe" --team "Team Alpha" --map 0.42 --commit "2 hours ago"
		`);
		process.exit(0);
	}

	if (!args.name || !args.map) {
		console.error('❌ Error: --name and --map are required');
		process.exit(1);
	}

	let leaderboard = readLeaderboard();
	leaderboard = updateStudent(leaderboard, {
		name: args.name,
		team: args.team,
		map: args.map,
		commit: args.commit,
		id: args.id
	});

	// Sort by MAP score (descending)
	leaderboard.sort((a, b) => b.map - a.map);

	writeLeaderboard(leaderboard);
}

main();

