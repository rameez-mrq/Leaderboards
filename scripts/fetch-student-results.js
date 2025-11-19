#!/usr/bin/env node

/**
 * Fetches MAP scores from student repositories' GitHub Actions runs
 * 
 * This script:
 * 1. Reads student repo configuration
 * 2. Fetches latest GitHub Actions workflow run for each repo
 * 3. Extracts MAP score from Actions summary or artifacts
 * 4. Updates leaderboard.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const STUDENTS_CONFIG = join(__dirname, '../students.json');
const LEADERBOARD_FILE = join(__dirname, '../static/leaderboard.json');

if (!GITHUB_TOKEN) {
	console.error('❌ Error: GITHUB_TOKEN environment variable is required');
	process.exit(1);
}

// Fetch workflow runs for a repository
async function getLatestWorkflowRun(owner, repo, workflowName = 'evaluation.yml') {
	try {
		// Get workflow runs
		const runsResponse = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflowName}/runs?per_page=1&status=success`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			}
		);

		if (!runsResponse.ok) {
			console.warn(`⚠️  Could not fetch runs for ${owner}/${repo}: ${runsResponse.statusText}`);
			return null;
		}

		const runsData = await runsResponse.json();
		if (!runsData.workflow_runs || runsData.workflow_runs.length === 0) {
			console.warn(`⚠️  No successful runs found for ${owner}/${repo}`);
			return null;
		}

		return runsData.workflow_runs[0];
	} catch (error) {
		console.error(`❌ Error fetching workflow for ${owner}/${repo}:`, error.message);
		return null;
	}
}

// Extract MAP score from workflow run logs or summary
async function extractMapScore(owner, repo, runId) {
	try {
		// Get workflow jobs
		const jobsResponse = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			}
		);

		if (!jobsResponse.ok) {
			return null;
		}

		const jobsData = await jobsResponse.json();
		
		// Look through job logs for MAP score
		// Many evaluation workflows output: "MAP: 0.3524" or "| MAP | 0.3524 |"
		for (const job of jobsData.jobs || []) {
			if (job.conclusion === 'success') {
				// Try to get logs (this requires additional API call)
				// For now, we'll rely on results file or artifacts
			}
		}

		// Try artifacts as fallback
		const artifactsResponse = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			}
		);

		if (artifactsResponse.ok) {
			const artifacts = await artifactsResponse.json();
			for (const artifact of artifacts.artifacts || []) {
				if (artifact.name.includes('metrics') || artifact.name.includes('results') || artifact.name.includes('evaluation')) {
					// Note: Downloading artifacts requires additional API calls
					// For simplicity, we'll rely on results files in the repo
					console.log(`  📦 Found artifact: ${artifact.name} (download requires additional setup)`);
				}
			}
		}

		return null;
	} catch (error) {
		console.error(`❌ Error extracting MAP score:`, error.message);
		return null;
	}
}

// Fetch from a results file in the repo (if students commit results)
async function fetchFromResultsFile(owner, repo, filePath = 'results/metrics.json') {
	try {
		const fileResponse = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			}
		);

		if (!fileResponse.ok) {
			return null;
		}

		const fileData = await fileResponse.json();
		const content = JSON.parse(Buffer.from(fileData.content, 'base64').toString());
		
		// Extract MAP score (supports multiple formats)
		const mapScore = content.map || 
		                 content.MAP || 
		                 content.metrics?.map || 
		                 content.metrics?.MAP ||
		                 content.results?.map ||
		                 content.evaluation?.map;
		
		if (mapScore !== undefined && !isNaN(parseFloat(mapScore))) {
			return parseFloat(mapScore);
		}
		
		return null;
	} catch (error) {
		// File doesn't exist or invalid format - that's okay
		return null;
	}
}

// Get commit time for a repo
async function getLastCommitTime(owner, repo) {
	try {
		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
			{
				headers: {
					'Authorization': `token ${GITHUB_TOKEN}`,
					'Accept': 'application/vnd.github.v3+json'
				}
			}
		);

		if (!response.ok) {
			return 'Unknown';
		}

		const commits = await response.json();
		if (commits.length === 0) {
			return 'Unknown';
		}

		const commitDate = new Date(commits[0].commit.committer.date);
		const now = new Date();
		const diffMs = now - commitDate;
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffHours / 24);

		if (diffHours < 1) return 'Just now';
		if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		if (diffDays === 1) return '1 day ago';
		return `${diffDays} days ago`;
	} catch (error) {
		return 'Unknown';
	}
}

// Main function to update leaderboard from student repos
async function updateFromStudentRepos() {
	// Read student configuration
	let students;
	try {
		const configContent = readFileSync(STUDENTS_CONFIG, 'utf-8');
		students = JSON.parse(configContent);
	} catch (error) {
		console.error('❌ Error reading students.json:', error.message);
		console.error('💡 Create a students.json file with student repo information');
		process.exit(1);
	}

	// Read current leaderboard
	let leaderboard;
	try {
		const leaderboardContent = readFileSync(LEADERBOARD_FILE, 'utf-8');
		leaderboard = JSON.parse(leaderboardContent);
	} catch (error) {
		console.error('❌ Error reading leaderboard.json:', error.message);
		process.exit(1);
	}

	console.log(`📊 Fetching results from ${students.length} student repositories...\n`);

	// Process each student
	for (const student of students) {
		const { id, name, team, repo } = student;
		
		if (!repo) {
			console.warn(`⚠️  Skipping ${name}: No repo specified`);
			continue;
		}

		const [owner, repoName] = repo.split('/');
		if (!owner || !repoName) {
			console.warn(`⚠️  Skipping ${name}: Invalid repo format (expected owner/repo)`);
			continue;
		}

		console.log(`🔍 Checking ${name} (${repo})...`);

		// Try multiple file paths for results
		const possiblePaths = [
			student.resultsFile,
			'results/metrics.json',
			'results.json',
			'metrics.json',
			'evaluation-results.json',
			'runs/metrics.json'
		].filter(Boolean);

		let mapScore = null;
		
		// Try to get MAP score from results file first
		for (const path of possiblePaths) {
			mapScore = await fetchFromResultsFile(owner, repoName, path);
			if (mapScore !== null) {
				console.log(`  ✅ Found results in ${path}`);
				break;
			}
		}
		
		// If not found in files, try to get from latest workflow run
		if (mapScore === null) {
			const workflowRun = await getLatestWorkflowRun(owner, repoName, student.workflowName || 'evaluation.yml');
			if (workflowRun) {
				console.log(`  🔄 Checking workflow run #${workflowRun.run_number}...`);
				mapScore = await extractMapScore(owner, repoName, workflowRun.id);
			}
		}

		// Get last commit time
		const lastCommit = await getLastCommitTime(owner, repoName);

		// Update or add to leaderboard
		const existingIndex = leaderboard.findIndex(s => s.id === id || s.name === name);
		
		if (mapScore !== null && !isNaN(parseFloat(mapScore))) {
			const updatedEntry = {
				id: existingIndex >= 0 ? leaderboard[existingIndex].id : id || Math.max(...leaderboard.map(s => s.id), 0) + 1,
				name,
				team: team || 'Unassigned',
				map: parseFloat(mapScore),
				lastCommit
			};

			if (existingIndex >= 0) {
				leaderboard[existingIndex] = updatedEntry;
				console.log(`  ✅ Updated: ${name} - MAP: ${mapScore.toFixed(4)}`);
			} else {
				leaderboard.push(updatedEntry);
				console.log(`  ➕ Added: ${name} - MAP: ${mapScore.toFixed(4)}`);
			}
		} else {
			console.log(`  ⚠️  Could not fetch MAP score for ${name}`);
		}
	}

	// Sort by MAP score (descending)
	leaderboard.sort((a, b) => b.map - a.map);

	// Write updated leaderboard
	try {
		writeFileSync(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, '\t') + '\n', 'utf-8');
		console.log(`\n✅ Leaderboard updated successfully!`);
	} catch (error) {
		console.error('❌ Error writing leaderboard:', error.message);
		process.exit(1);
	}
}

// Run the update
updateFromStudentRepos().catch(error => {
	console.error('❌ Fatal error:', error);
	process.exit(1);
});

